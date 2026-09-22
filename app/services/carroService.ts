import prisma from "../plugin/postgres";
import { CriarCarroInput } from "../models/criarCarro";

export class CarroService {
  /**
   * Normaliza a placa (maiúsculas e sem pontuação/traços)
   */
  static normalizarPlaca(placa: string): string {
    return placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  }

  /**
   * Busca um carro pela placa na empresa com os dados do proprietário (Auto-complete)
   */
  static async buscarPorPlaca(placa: string, empresaId: string) {
    const placaLimpa = this.normalizarPlaca(placa);
    return prisma.carros.findFirst({
      where: {
        placa: placaLimpa,
        empresa_id: empresaId,
      },
      include: {
        cliente: true,
      },
    });
  }

  /**
   * Cadastra um novo carro vinculado ao cliente e à empresa
   */
  static async createCarro(clienteId: string, empresaId: string, data: CriarCarroInput) {
    const placaLimpa = this.normalizarPlaca(data.placa);

    // Verificar se a placa já existe para esta empresa
    const existente = await prisma.carros.findFirst({
      where: {
        placa: placaLimpa,
        empresa_id: empresaId,
      },
    });

    if (existente) {
      throw new Error(`A placa ${placaLimpa} já está cadastrada nesta oficina.`);
    }

    return prisma.carros.create({
      data: {
        marca: data.marca,
        modelo: data.modelo,
        ano: data.ano,
        cor: data.cor,
        placa: placaLimpa,
        cliente_id: clienteId,
        empresa_id: empresaId,
      },
      include: {
        cliente: true,
      },
    });
  }

  /**
   * Atualiza dados de um carro
   */
  static async updateCarro(id: string, empresaId: string, data: Partial<CriarCarroInput>) {
    const carroExistente = await prisma.carros.findFirst({
      where: { id, empresa_id: empresaId },
    });

    if (!carroExistente) {
      throw new Error("Veículo não encontrado");
    }

    const updateData: any = { ...data };
    if (data.placa) {
      updateData.placa = this.normalizarPlaca(data.placa);
    }

    return prisma.carros.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Exclui um carro
   */
  static async deleteCarro(id: string, empresaId: string) {
    const carroExistente = await prisma.carros.findFirst({
      where: { id, empresa_id: empresaId },
    });

    if (!carroExistente) {
      throw new Error("Veículo não encontrado");
    }

    await prisma.carros.delete({
      where: { id },
    });

    return { message: "Veículo excluído com sucesso" };
  }
}