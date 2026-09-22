import { FastifyReply, FastifyRequest } from "fastify";
import { loginModel } from "../models/loginModel";
import { registroModel } from "../models/registroModel";
import { findUserAuth } from "../utils/findUserAuth";
import bcrypt from "bcryptjs";
import prisma from "../plugin/postgres";
import { UserPayload } from "../interface/userPayload";

export class AuthController {
  /**
   * Registro completo de Nova Empresa (Onboarding Atômico)
   */
  static async register(req: FastifyRequest, res: FastifyReply) {
    try {
      const data = registroModel.parse(req.body);

      // 1. Checar duplicidade de e-mail
      const existeEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existeEmail) {
        return res.status(400).send({
          success: false,
          message: "Este e-mail já está cadastrado no sistema.",
        });
      }

      // 2. Checar duplicidade de CNPJ
      const existeCnpj = await prisma.empresa.findUnique({
        where: { cnpj: data.cnpj },
      });
      if (existeCnpj) {
        return res.status(400).send({
          success: false,
          message: "Este CNPJ já está cadastrado no sistema.",
        });
      }

      // 3. Hash da senha
      const senhaCriptografada = await bcrypt.hash(data.senha, 12);

      // 4. Criação atômica via transação
      const resultado = await prisma.$transaction(async (tx) => {
        // Criar Empresa
        const empresa = await tx.empresa.create({
          data: {
            nome_fantasia: data.nomeFantasia,
            razao_social: data.razaoSocial || data.nomeFantasia,
            cnpj: data.cnpj,
            email: data.email,
            whatsapp: data.whatsapp,
          },
        });

        // Criar Usuário Proprietário
        const user = await tx.user.create({
          data: {
            nome: data.nome,
            email: data.email,
            senha: senhaCriptografada,
            empresa_id: empresa.id,
          },
        });

        // Inicializar os 3 templates padrão de WhatsApp da oficina
        await tx.mensagemTemplate.createMany({
          data: [
            {
              empresa_id: empresa.id,
              tipo: "CONFIRMACAO_AGENDAMENTO",
              texto:
                "Olá, {cliente}! Seu {carro} ({placa}) está agendado aqui na {oficina} para {data_agendamento}. Serviços: {servicos}. Valor estimado: R$ {valor}. Qualquer dúvida estamos à disposição!",
            },
            {
              empresa_id: empresa.id,
              tipo: "CARRO_PRONTO",
              texto:
                "Olá, {cliente}! Ótima notícia: o seu {carro} está pronto e brilhando aqui na {oficina} ✨! Pode vir retirar quando quiser. Se preferir adiantar o acerto, nossa chave Pix é: {pix}.",
            },
            {
              empresa_id: empresa.id,
              tipo: "POS_VENDA_RECALL",
              texto:
                "Olá, {cliente}! Já faz um tempo que cuidamos do seu {carro} aqui na {oficina}. Pelo tempo decorrido, está na hora ideal de fazer a manutenção do serviço de {servicos} para manter a proteção em dia. Quer agendar seu horário para essa semana?",
            },
          ],
        });

        // Inicializar os 4 serviços sugeridos para o studio
        await tx.servico.createMany({
          data: [
            {
              empresa_id: empresa.id,
              nome: "Lavagem Técnica Detalhada",
              descricao:
                "Lavagem minuciosa com descontaminação leve, proteção de plásticos e cera de manutenção.",
              preco_base: 90.0,
              duracao_minutos: 60,
              tempo_pos_venda: 25,
            },
            {
              empresa_id: empresa.id,
              nome: "Higienização Interna Completa",
              descricao:
                "Limpeza profunda de bancos, carpetes, teto, painel e oxi-sanitização.",
              preco_base: 350.0,
              duracao_minutos: 180,
              tempo_pos_venda: 60,
            },
            {
              empresa_id: empresa.id,
              nome: "Polimento Comercial / Técnico",
              descricao:
                "Correção de verniz, eliminação de micro-riscos e aplicação de selante protetor.",
              preco_base: 450.0,
              duracao_minutos: 240,
              tempo_pos_venda: 90,
            },
            {
              empresa_id: empresa.id,
              nome: "Vitrificação de Pintura Cerâmica",
              descricao:
                "Aplicação de vitrificador cerâmico de alta durabilidade e brilho extremo com garantia.",
              preco_base: 1200.0,
              duracao_minutos: 360,
              tempo_pos_venda: 180,
            },
          ],
        });

        return { empresa, user };
      });

      // 5. Gerar token JWT com os dados essenciais
      const token = req.server.jwt.sign({
        id: resultado.user.id,
        email: resultado.user.email,
        nome: resultado.user.nome,
        empresaId: resultado.empresa.id,
      });

      // 6. Configurar cookie de sessão
      res.setCookie("accessToken", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });

      return res.status(201).send({
        success: true,
        message: "Oficina e usuário cadastrados com sucesso!",
        token,
        user: {
          id: resultado.user.id,
          nome: resultado.user.nome,
          email: resultado.user.email,
          empresa: {
            id: resultado.empresa.id,
            nomeFantasia: resultado.empresa.nome_fantasia,
            cnpj: resultado.empresa.cnpj,
            whatsapp: resultado.empresa.whatsapp,
          },
        },
      });
    } catch (error: any) {
      return res.status(400).send({
        success: false,
        message: error.message || "Erro ao cadastrar oficina e usuário",
      });
    }
  }

  /**
   * Login do Proprietário
   */
  static async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, senha } = loginModel.parse(request.body);
      const user = await findUserAuth(email, senha);

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: "E-mail ou senha inválidos",
        });
      }

      const token = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        nome: user.nome,
        empresaId: user.empresa_id,
      });

      reply.setCookie("accessToken", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });

      return reply.status(200).send({
        success: true,
        message: "Login bem-sucedido",
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          empresa: {
            id: user.empresa.id,
            nomeFantasia: user.empresa.nome_fantasia,
            cnpj: user.empresa.cnpj,
            whatsapp: user.empresa.whatsapp,
          },
        },
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message || "Erro ao realizar login",
      });
    }
  }

  /**
   * Logout (Limpeza segura de cookies)
   */
  static async logout(request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie("accessToken", { path: "/" });
    return reply.status(200).send({
      success: true,
      message: "Logout realizado com sucesso",
    });
  }

  /**
   * Obter perfil do usuário e da oficina logada
   */
  static async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userPayload = request.user as UserPayload;

      const user = await prisma.user.findUnique({
        where: { id: userPayload.id },
        include: { empresa: true },
      });

      if (!user || !user.ativo || !user.empresa.ativo) {
        return reply.status(401).send({
          success: false,
          message: "Usuário ou oficina inativa",
        });
      }

      return reply.status(200).send({
        success: true,
        data: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          empresa: {
            id: user.empresa.id,
            nomeFantasia: user.empresa.nome_fantasia,
            razaoSocial: user.empresa.razao_social,
            cnpj: user.empresa.cnpj,
            whatsapp: user.empresa.whatsapp,
            chavePix: user.empresa.chave_pix,
          },
        },
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        message: "Erro ao buscar dados do usuário logado",
      });
    }
  }
}