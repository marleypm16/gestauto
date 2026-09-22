import { FastifyReply, FastifyRequest } from "fastify";
import { loginModel } from "../models/loginModel";
import { findUserAuth } from "../utils/findUserAuth";
import bcrypt from "bcryptjs";
import { registroModel } from "../models/registroModel";
import prisma from "../plugin/postgres";

export class AuthController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, senha } = loginModel.parse(request.body);
      const user = await findUserAuth(email, senha);

      if (!user) {
        return reply.status(401).send({ message: "E-mail ou senha inválidos" });
      }

      const token = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        nome: user.nome,
        empresaId: user.UsuarioEmpresa?.[0]?.empresaId || null,
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
          email: user.email,
          nome: user.nome,
          empresas: user.UsuarioEmpresa,
        },
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message || "Erro ao realizar login",
      });
    }
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie("accessToken", { path: "/" });
    return reply.status(200).send({ success: true, message: "Logout bem-sucedido" });
  }

  static async register(req: FastifyRequest, res: FastifyReply) {
    try {
      const { user, company } = registroModel.parse(req.body);
      const senhaCriptografada = await bcrypt.hash(user.senha, 12);

      const existeUsuarioComEmail = await prisma.user.findFirst({
        where: { email: user.email },
      });
      if (existeUsuarioComEmail) {
        return res.status(400).send({ message: "E-mail já cadastrado" });
      }

      const existeEmpresaComCnpj = await prisma.empresa.findFirst({
        where: { cnpj: company.cnpj },
      });
      if (existeEmpresaComCnpj) {
        return res.status(400).send({ message: "CNPJ já cadastrado" });
      }

      const resultado = await prisma.$transaction(async (tx) => {
        const empresaCriada = await tx.empresa.create({
          data: company,
        });

        const usuarioCriado = await tx.user.create({
          data: {
            ...user,
            senha: senhaCriptografada,
          },
        });

        const usuarioEmpresa = await tx.usuarioEmpresa.create({
          data: {
            userId: usuarioCriado.id,
            empresaId: empresaCriada.id,
            funcao: "Proprietário",
            permisso: "admin",
          },
        });

        return { empresaCriada, usuarioCriado, usuarioEmpresa };
      });

      return res.status(201).send({
        success: true,
        message: "Empresa e usuário criados com sucesso",
        data: {
          userId: resultado.usuarioCriado.id,
          empresaId: resultado.empresaCriada.id,
        },
      });
    } catch (error: any) {
      return res.status(400).send({
        success: false,
        message: error.message || "Erro ao registrar empresa e usuário",
      });
    }
  }
}