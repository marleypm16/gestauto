import prisma from "../plugin/postgres";
import { MensagemTemplate, TipoTemplate } from "../generated/prisma";

export const DEFAULT_TEMPLATES: Record<TipoTemplate, string> = {
  CONFIRMACAO_AGENDAMENTO:
    "Olá, {cliente}! Seu {carro} ({placa}) está agendado aqui na {oficina} para {data_agendamento}. Serviços: {servicos}. Valor estimado: R$ {valor}. Qualquer dúvida estamos à disposição!",
  CARRO_PRONTO:
    "Olá, {cliente}! Ótima notícia: o seu {carro} está pronto e brilhando aqui na {oficina} ✨! Pode vir retirar quando quiser. Se preferir adiantar o acerto, nossa chave Pix é: {pix}.",
  POS_VENDA_RECALL:
    "Olá, {cliente}! Já faz um tempo que cuidamos do seu {carro} aqui na {oficina}. Pelo tempo decorrido, está na hora ideal de fazer a manutenção do serviço de {servicos} para manter a proteção em dia. Quer agendar seu horário para essa semana?",
};

export class TemplateService {
  /**
   * Retorna os templates de WhatsApp da empresa, inicializando os padrões se não existirem
   */
  static async listarTemplates(empresaId: string) {
    let templates = await prisma.mensagemTemplate.findMany({
      where: { empresa_id: empresaId },
      orderBy: { tipo: "asc" },
    });

    // Se a empresa ainda não tiver todos os 3 templates, garante a criação dos faltantes
    const tiposExistentes = new Set(templates.map((t: MensagemTemplate) => t.tipo));
    const tiposNecessarios: TipoTemplate[] = [
      "CONFIRMACAO_AGENDAMENTO",
      "CARRO_PRONTO",
      "POS_VENDA_RECALL",
    ];

    const faltantes = tiposNecessarios.filter((t) => !tiposExistentes.has(t));
    if (faltantes.length > 0) {
      await prisma.mensagemTemplate.createMany({
        data: faltantes.map((tipo) => ({
          empresa_id: empresaId,
          tipo,
          texto: DEFAULT_TEMPLATES[tipo],
        })),
        skipDuplicates: true,
      });

      templates = await prisma.mensagemTemplate.findMany({
        where: { empresa_id: empresaId },
        orderBy: { tipo: "asc" },
      });
    }

    return templates;
  }

  /**
   * Atualiza ou cria o texto de um template específico
   */
  static async atualizarTemplate(empresaId: string, tipo: TipoTemplate, texto: string) {
    return prisma.mensagemTemplate.upsert({
      where: {
        empresa_id_tipo: {
          empresa_id: empresaId,
          tipo,
        },
      },
      create: {
        empresa_id: empresaId,
        tipo,
        texto,
      },
      update: {
        texto,
      },
    });
  }

  /**
   * Gera a URL pronta do WhatsApp (wa.me) resolvendo todas as tags dinâmicas
   */
  static async gerarLinkWhatsApp(params: {
    empresaId: string;
    tipo: TipoTemplate;
    ordemServicoId?: string;
    posVendaId?: string;
  }) {
    const { empresaId, tipo, ordemServicoId, posVendaId } = params;

    // 1. Obter informações da Empresa
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      throw new Error("Empresa não encontrada.");
    }

    // 2. Obter ou garantir o template
    let template = await prisma.mensagemTemplate.findUnique({
      where: {
        empresa_id_tipo: {
          empresa_id: empresaId,
          tipo,
        },
      },
    });

    const textoTemplate = template?.texto || DEFAULT_TEMPLATES[tipo];

    // 3. Buscar os dados da OS ou Pós-Venda
    let clienteNome = "";
    let clienteTelefone = "";
    let carroModelo = "";
    let placa = "";
    let servicosNome = "";
    let valorTotal = "0,00";
    let dataAgendamentoFormatada = "";

    if (posVendaId) {
      const posVenda = await prisma.posVenda.findFirst({
        where: { id: posVendaId, empresa_id: empresaId },
        include: {
          cliente: true,
          carro: true,
          servico: true,
          ordem_servico: {
            include: {
              itens: {
                include: {
                  servico: true,
                },
              },
            },
          },
        },
      });

      if (!posVenda) {
        throw new Error("Registro de pós-venda não encontrado.");
      }

      clienteNome = posVenda.cliente.nome;
      clienteTelefone = posVenda.cliente.whatsapp;
      carroModelo = `${posVenda.carro.marca} ${posVenda.carro.modelo}`.trim();
      placa = posVenda.carro.placa;
      servicosNome = posVenda.servico?.nome || "";
      if (posVenda.ordem_servico) {
        valorTotal = Number(posVenda.ordem_servico.valor_total).toFixed(2).replace(".", ",");
      }
    } else if (ordemServicoId) {
      const os = await prisma.ordemServico.findFirst({
        where: { id: ordemServicoId, empresa_id: empresaId },
        include: {
          cliente: true,
          carro: true,
          itens: {
            include: {
              servico: true,
            },
          },
        },
      });

      if (!os) {
        throw new Error("Ordem de serviço não encontrada.");
      }

      clienteNome = os.cliente.nome;
      clienteTelefone = os.cliente.whatsapp;
      carroModelo = `${os.carro.marca} ${os.carro.modelo}`.trim();
      placa = os.carro.placa;
      servicosNome = os.itens.map((i: any) => i.servico.nome).join(", ");
      valorTotal = Number(os.valor_total).toFixed(2).replace(".", ",");

      if (os.data_agendamento) {
        const d = new Date(os.data_agendamento);
        const dia = String(d.getDate()).padStart(2, "0");
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const ano = d.getFullYear();
        const horas = String(d.getHours()).padStart(2, "0");
        const minutos = String(d.getMinutes()).padStart(2, "0");
        dataAgendamentoFormatada = `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
      }
    } else {
      throw new Error("É necessário fornecer ordemServicoId ou posVendaId.");
    }

    // 4. Substituição de tags dinâmicas
    const oficinaNome = empresa.nome_fantasia || empresa.razao_social || "Nossa Oficina";
    const chavePix = empresa.chave_pix || empresa.whatsapp || empresa.cnpj || oficinaNome;

    let textoFinal = textoTemplate
      .replace(/{cliente}/g, clienteNome)
      .replace(/{cliente_nome}/g, clienteNome)
      .replace(/{carro}/g, carroModelo)
      .replace(/{carro_modelo}/g, carroModelo)
      .replace(/{placa}/g, placa)
      .replace(/{oficina}/g, oficinaNome)
      .replace(/{empresa_nome}/g, oficinaNome)
      .replace(/{servicos}/g, servicosNome)
      .replace(/{servico_nome}/g, servicosNome)
      .replace(/{valor}/g, valorTotal)
      .replace(/{valor_total}/g, valorTotal)
      .replace(/{data_agendamento}/g, dataAgendamentoFormatada)
      .replace(/{pix}/g, chavePix);

    // 5. Normalização do número de WhatsApp
    let cleanPhone = clienteTelefone.replace(/\D/g, "");
    if (!cleanPhone.startsWith("55") && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
      cleanPhone = `55${cleanPhone}`;
    }

    // 6. Montagem da URL wa.me
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textoFinal)}`;

    return {
      url,
      texto: textoFinal,
      telefone: cleanPhone,
      clienteNome,
    };
  }
}
