import prisma from "../plugin/postgres";

export interface CreateServicoDTO {
  nome: string;
  descricao?: string;
  precoBase: number;
  duracaoMinutos?: number;
  tempoPosVenda?: number;
  ativo?: boolean;
}

export interface UpdateServicoDTO {
  nome?: string;
  descricao?: string;
  precoBase?: number;
  duracaoMinutos?: number;
  tempoPosVenda?: number;
  ativo?: boolean;
}

export class ServicoService {
  /**
   * Cadastra novo serviço no catálogo da oficina
   */
  static async criarServico(empresaId: string, data: CreateServicoDTO) {
    const existente = await prisma.servico.findFirst({
      where: {
        nome: data.nome,
        empresa_id: empresaId,
        ativo: true,
      },
    });

    if (existente) {
      throw new Error("Já existe um serviço ativo com este nome nesta oficina.");
    }

    return prisma.servico.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        preco_base: data.precoBase,
        duracao_minutos: data.duracaoMinutos ?? 60,
        tempo_pos_venda: data.tempoPosVenda ?? 30,
        ativo: data.ativo ?? true,
        empresa_id: empresaId,
      },
    });
  }

  /**
   * Lista todos os serviços do catálogo da empresa
   */
  static async listarServicos(empresaId: string, apenasAtivos: boolean = true) {
    return prisma.servico.findMany({
      where: {
        empresa_id: empresaId,
        ...(apenasAtivos ? { ativo: true } : {}),
      },
      orderBy: { nome: "asc" },
    });
  }

  /**
   * Busca um serviço por ID
   */
  static async buscarPorId(id: string, empresaId: string) {
    return prisma.servico.findFirst({
      where: { id, empresa_id: empresaId },
    });
  }

  /**
   * Atualiza dados de um serviço do catálogo
   */
  static async atualizarServico(id: string, empresaId: string, data: UpdateServicoDTO) {
    const servico = await prisma.servico.findFirst({
      where: { id, empresa_id: empresaId },
    });

    if (!servico) {
      throw new Error("Serviço não encontrado");
    }

    return prisma.servico.update({
      where: { id },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        preco_base: data.precoBase !== undefined ? data.precoBase : undefined,
        duracao_minutos: data.duracaoMinutos !== undefined ? data.duracaoMinutos : undefined,
        tempo_pos_venda: data.tempoPosVenda !== undefined ? data.tempoPosVenda : undefined,
        ativo: data.ativo !== undefined ? data.ativo : undefined,
      },
    });
  }

  /**
   * Desativa um serviço (Soft delete)
   */
  static async desativarServico(id: string, empresaId: string) {
    const servico = await prisma.servico.findFirst({
      where: { id, empresa_id: empresaId },
    });

    if (!servico) {
      throw new Error("Serviço não encontrado");
    }

    return prisma.servico.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
