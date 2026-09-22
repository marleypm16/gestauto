import prisma from "../plugin/postgres";
import { CriarOrdemServicoInput, AtualizarStatusOSInput } from "../models/ordemServicoModel";

export class OrdemServicoService {
  /**
   * Cria uma Ordem de Serviço (Check-in imediato ou Agendamento futuro)
   */
  static async criarOrdemServico(empresaId: string, data: CriarOrdemServicoInput) {
    // 1. Validar se cliente pertence à empresa
    const cliente = await prisma.clientes.findFirst({
      where: { id: data.clienteId, empresa_id: empresaId },
    });
    if (!cliente) {
      throw new Error("Cliente não encontrado nesta oficina.");
    }

    // 2. Validar se carro pertence ao cliente e à empresa
    const carro = await prisma.carros.findFirst({
      where: { id: data.carroId, cliente_id: data.clienteId, empresa_id: empresaId },
    });
    if (!carro) {
      throw new Error("Veículo não encontrado para o cliente informado.");
    }

    // 3. Calcular valor total
    const somaItens = data.itens.reduce((acc, item) => acc + Number(item.precoAplicado), 0);
    const valorTotal = data.valorTotal !== undefined ? data.valorTotal : somaItens;

    // 4. Executar transação criando a OS e seus itens
    return prisma.$transaction(async (tx) => {
      const isAgendamento = data.status === "AGENDADO";

      const novaOS = await tx.ordemServico.create({
        data: {
          empresa_id: empresaId,
          cliente_id: data.clienteId,
          carro_id: data.carroId,
          status: data.status,
          data_agendamento: data.dataAgendamento || (isAgendamento ? new Date() : null),
          hora_entrada: !isAgendamento ? new Date() : null,
          previsao_entrega: data.previsaoEntrega,
          valor_total: valorTotal,
          observacoes: data.observacoes,
          itens: {
            create: data.itens.map((item) => ({
              servico_id: item.servicoId,
              preco_aplicado: item.precoAplicado,
            })),
          },
        },
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

      return novaOS;
    });
  }

  /**
   * Visão Mista da Home: Agendados para hoje + Boxes ativos no pátio
   */
  static async listarPatioHoje(empresaId: string) {
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);

    const hojeFim = new Date();
    hojeFim.setHours(23, 59, 59, 999);

    const [agendadosHoje, patioAtivo] = await Promise.all([
      // 1. Agendados com data marcada para hoje
      prisma.ordemServico.findMany({
        where: {
          empresa_id: empresaId,
          status: "AGENDADO",
          data_agendamento: {
            gte: hojeInicio,
            lte: hojeFim,
          },
        },
        include: {
          cliente: true,
          carro: true,
          itens: {
            include: {
              servico: true,
            },
          },
        },
        orderBy: {
          data_agendamento: "asc",
        },
      }),

      // 2. Carros que estão fisicamente no pátio/boxes sendo trabalhados
      prisma.ordemServico.findMany({
        where: {
          empresa_id: empresaId,
          status: {
            in: ["AGUARDANDO_INICIO", "EM_EXECUCAO", "PRONTO_RETIRADA"],
          },
        },
        include: {
          cliente: true,
          carro: true,
          itens: {
            include: {
              servico: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return {
      agendadosHoje,
      patioAtivo,
    };
  }

  /**
   * Lista agendamentos futuros para a tela dedicada de agendamentos
   */
  static async listarAgendamentos(empresaId: string, dataInicio?: Date, dataFim?: Date) {
    const where: any = {
      empresa_id: empresaId,
      status: "AGENDADO",
    };

    if (dataInicio || dataFim) {
      where.data_agendamento = {};
      if (dataInicio) where.data_agendamento.gte = dataInicio;
      if (dataFim) where.data_agendamento.lte = dataFim;
    }

    return prisma.ordemServico.findMany({
      where,
      include: {
        cliente: true,
        carro: true,
        itens: {
          include: {
            servico: true,
          },
        },
      },
      orderBy: {
        data_agendamento: "asc",
      },
    });
  }

  /**
   * Busca detalhes completos de uma Ordem de Serviço
   */
  static async buscarPorId(id: string, empresaId: string) {
    return prisma.ordemServico.findFirst({
      where: { id, empresa_id: empresaId },
      include: {
        cliente: true,
        carro: true,
        itens: {
          include: {
            servico: true,
          },
        },
        pos_venda: true,
      },
    });
  }

  /**
   * Atualiza o status da OS com avanço de fases e agendamento automático de Pós-Venda
   */
  static async atualizarStatus(id: string, empresaId: string, data: AtualizarStatusOSInput) {
    const osExistente = await prisma.ordemServico.findFirst({
      where: { id, empresa_id: empresaId },
      include: {
        itens: {
          include: {
            servico: true,
          },
        },
      },
    });

    if (!osExistente) {
      throw new Error("Ordem de serviço não encontrada.");
    }

    return prisma.$transaction(async (tx) => {
      const updateData: any = {
        status: data.status,
      };

      if (data.observacoes) {
        updateData.observacoes = data.observacoes;
      }

      // Se passou de AGENDADO para entrada no pátio (CTA Confirmar Entrada)
      if (osExistente.status === "AGENDADO" && data.status === "AGUARDANDO_INICIO") {
        updateData.hora_entrada = new Date();
      }

      // Se finalizado e entregue ao cliente
      if (data.status === "ENTREGUE") {
        updateData.data_entrega = new Date();
        updateData.metodo_pagamento = data.metodoPagamento || "A_RECEBER";

        // GATILHO DE PÓS-VENDA AUTOMÁTICO:
        // Encontrar o maior tempo de pós-venda entre os serviços executados
        const temposPosVenda = osExistente.itens.map(
          (item) => item.servico.tempo_pos_venda || 0
        );
        const maiorTempoDias = Math.max(0, ...temposPosVenda);

        if (maiorTempoDias > 0) {
          const dataContato = new Date();
          dataContato.setDate(dataContato.getDate() + maiorTempoDias);

          // Pega o serviço com maior tempo de pós-venda como serviço de referência
          const servicoReferencia = osExistente.itens.reduce((prev, current) =>
            (prev.servico.tempo_pos_venda || 0) > (current.servico.tempo_pos_venda || 0)
              ? prev
              : current
          );

          await tx.posVenda.upsert({
            where: { ordem_servico_id: id },
            create: {
              empresa_id: empresaId,
              cliente_id: osExistente.cliente_id,
              carro_id: osExistente.carro_id,
              servico_id: servicoReferencia.servico_id,
              ordem_servico_id: id,
              data_contato: dataContato,
              status: "PENDENTE",
            },
            update: {
              data_contato: dataContato,
              status: "PENDENTE",
            },
          });
        }
      }

      const osAtualizada = await tx.ordemServico.update({
        where: { id },
        data: updateData,
        include: {
          cliente: true,
          carro: true,
          itens: {
            include: {
              servico: true,
            },
          },
          pos_venda: true,
        },
      });

      return osAtualizada;
    });
  }
}
