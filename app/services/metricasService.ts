import prisma from "../plugin/postgres";

export class MetricasService {
  /**
   * Retorna os indicadores financeiros e operacionais consolidados da oficina
   */
  static async obterResumoDia(empresaId: string) {
    const agora = new Date();

    const hojeInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    const hojeFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999);

    const mesInicio = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0);
    const mesFim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      faturadoHojeAgg,
      faturadoMesAgg,
      valoresPendentesAgg,
      carrosNoPatioCount,
      posVendaPendenteCount,
      agendadosHojeCount,
    ] = await Promise.all([
      // 1. Faturado hoje (OS entregue hoje com pagamento confirmado)
      prisma.ordemServico.aggregate({
        _sum: { valor_total: true },
        where: {
          empresa_id: empresaId,
          status: "ENTREGUE",
          data_entrega: {
            gte: hojeInicio,
            lte: hojeFim,
          },
          metodo_pagamento: {
            not: "A_RECEBER",
          },
        },
      }),

      // 2. Faturado no mês atual (OS entregue no mês com pagamento confirmado)
      prisma.ordemServico.aggregate({
        _sum: { valor_total: true },
        where: {
          empresa_id: empresaId,
          status: "ENTREGUE",
          data_entrega: {
            gte: mesInicio,
            lte: mesFim,
          },
          metodo_pagamento: {
            not: "A_RECEBER",
          },
        },
      }),

      // 3. Valores a receber pendentes (OS entregue com pagamento a receber)
      prisma.ordemServico.aggregate({
        _sum: { valor_total: true },
        where: {
          empresa_id: empresaId,
          status: "ENTREGUE",
          metodo_pagamento: "A_RECEBER",
        },
      }),

      // 4. Carros no pátio físico hoje (boxes e espera)
      prisma.ordemServico.count({
        where: {
          empresa_id: empresaId,
          status: {
            in: ["AGUARDANDO_INICIO", "EM_EXECUCAO", "PRONTO_RETIRADA"],
          },
        },
      }),

      // 5. Contatos de pós-venda pendentes até o final de hoje
      prisma.posVenda.count({
        where: {
          empresa_id: empresaId,
          status: "PENDENTE",
          data_contato: {
            lte: hojeFim,
          },
        },
      }),

      // 6. Agendados para hoje
      prisma.ordemServico.count({
        where: {
          empresa_id: empresaId,
          status: "AGENDADO",
          data_agendamento: {
            gte: hojeInicio,
            lte: hojeFim,
          },
        },
      }),
    ]);

    return {
      faturadoHoje: Number(faturadoHojeAgg._sum.valor_total || 0),
      faturadoMes: Number(faturadoMesAgg._sum.valor_total || 0),
      valoresPendentes: Number(valoresPendentesAgg._sum.valor_total || 0),
      carrosNoPatioHoje: carrosNoPatioCount,
      posVendaPendenteHoje: posVendaPendenteCount,
      agendadosHoje: agendadosHojeCount,
    };
  }
}
