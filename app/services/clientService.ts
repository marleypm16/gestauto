import { Prisma } from "../generated/prisma";
import prisma from "../plugin/postgres";
import { CriarClienteInput } from "../models/criarCliente";

export interface ListarClientesParams {
  page?: number;
  pageSize?: number;
  busca?: string;
}

export class ClientService {
  /**
   * Lista clientes da empresa com busca inteligente e paginação
   */
  static async getClients(empresaId: string, params: ListarClientesParams) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 10));
    const skip = (page - 1) * pageSize;

    const where: Prisma.ClientesWhereInput = {
      empresa_id: empresaId,
      ativo: true,
    };

    if (params.busca && params.busca.trim()) {
      const termo = params.busca.trim();
      const termoPlaca = termo.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

      where.OR = [
        { nome: { contains: termo, mode: "insensitive" } },
        { whatsapp: { contains: termo, mode: "insensitive" } },
        {
          carros: {
            some: {
              OR: [
                { placa: { contains: termoPlaca } },
                { modelo: { contains: termo, mode: "insensitive" } },
                { marca: { contains: termo, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    const [clientes, totalItems] = await prisma.$transaction([
      prisma.clientes.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          carros: true,
          ordens_servico: {
            select: {
              id: true,
              valor_total: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.clientes.count({ where }),
    ]);

    const data = clientes.map((cliente) => {
      const totalGasto = cliente.ordens_servico
        .filter((os) => os.status === "ENTREGUE")
        .reduce((soma, os) => soma + Number(os.valor_total), 0);

      const { ordens_servico, ...resto } = cliente;
      return {
        ...resto,
        carros: cliente.carros,
        totalAtendimentos: ordens_servico.length,
        totalGasto,
      };
    });

    return {
      data,
      meta: {
        totalItems,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  /**
   * Busca um cliente por ID com histórico completo de ordens de serviço e veículos
   */
  static async getClientById(clientId: string, empresaId: string) {
    const cliente = await prisma.clientes.findFirst({
      where: {
        id: clientId,
        empresa_id: empresaId,
      },
      include: {
        carros: true,
        ordens_servico: {
          orderBy: { createdAt: "desc" },
          include: {
            itens: {
              include: {
                servico: true,
              },
            },
          },
        },
        pos_vendas: {
          orderBy: { data_contato: "desc" },
        },
      },
    });

    return cliente;
  }

  /**
   * Cria um cliente e opcionalmente seus carros vinculados
   */
  static async createClient(empresaId: string, data: CriarClienteInput) {
    return prisma.$transaction(async (tx) => {
      const novoCliente = await tx.clientes.create({
        data: {
          nome: data.nome,
          whatsapp: data.whatsapp,
          ativo: data.ativo ?? true,
          empresa_id: empresaId,
        },
      });

      if (data.carros && data.carros.length > 0) {
        for (const carro of data.carros) {
          const placaLimpa = carro.placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

          await tx.carros.create({
            data: {
              marca: carro.marca,
              modelo: carro.modelo,
              ano: carro.ano,
              cor: carro.cor,
              placa: placaLimpa,
              cliente_id: novoCliente.id,
              empresa_id: empresaId,
            },
          });
        }
      }

      return tx.clientes.findUnique({
        where: { id: novoCliente.id },
        include: { carros: true },
      });
    });
  }

  /**
   * Atualiza dados cadastrais do cliente
   */
  static async updateClient(id: string, empresaId: string, data: Partial<CriarClienteInput>) {
    const clienteExistente = await prisma.clientes.findFirst({
      where: { id, empresa_id: empresaId },
    });

    if (!clienteExistente) {
      throw new Error("Cliente não encontrado nesta oficina.");
    }

    const clienteAtualizado = await prisma.clientes.update({
      where: { id },
      data: {
        nome: data.nome,
        whatsapp: data.whatsapp,
        ativo: data.ativo,
      },
      include: {
        carros: true,
      },
    });

    return clienteAtualizado;
  }
}