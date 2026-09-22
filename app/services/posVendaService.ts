import prisma from "../plugin/postgres";
import { StatusPosVenda } from "../generated/prisma";
import { AtualizarStatusPosVendaInput } from "../models/posVendaModel";

export class PosVendaService {
  /**
   * Lista contatos de pós-venda pendentes da empresa até a data de hoje (ou por filtros)
   */
  static async listarPendentes(
    empresaId: string,
    filtros?: {
      status?: StatusPosVenda;
      apenasAteHoje?: boolean;
    }
  ) {
    const status = filtros?.status || "PENDENTE";
    const apenasAteHoje = filtros?.apenasAteHoje ?? true;

    const where: any = {
      empresa_id: empresaId,
      status,
    };

    if (apenasAteHoje) {
      const hojeFim = new Date();
      hojeFim.setHours(23, 59, 59, 999);
      where.data_contato = {
        lte: hojeFim,
      };
    }

    return prisma.posVenda.findMany({
      where,
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
      orderBy: {
        data_contato: "asc",
      },
    });
  }

  /**
   * Busca um registro de pós-venda por ID
   */
  static async buscarPorId(id: string, empresaId: string) {
    return prisma.posVenda.findFirst({
      where: {
        id,
        empresa_id: empresaId,
      },
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
  }

  /**
   * Atualiza o status e/ou observações de um contato de pós-venda
   */
  static async atualizarStatus(
    id: string,
    empresaId: string,
    dados: AtualizarStatusPosVendaInput
  ) {
    const posVenda = await prisma.posVenda.findFirst({
      where: {
        id,
        empresa_id: empresaId,
      },
    });

    if (!posVenda) {
      throw new Error("Registro de pós-venda não encontrado.");
    }

    return prisma.posVenda.update({
      where: { id },
      data: {
        status: dados.status,
        ...(dados.observacoes !== undefined && { observacoes: dados.observacoes }),
      },
      include: {
        cliente: true,
        carro: true,
        servico: true,
      },
    });
  }
}
