import { FastifyReply, FastifyRequest } from "fastify";
import { criarCarroModel } from "../models/criarCarro";
import { CarroService } from "../services/carroService";
import { UserPayload } from "../interface/userPayload";

export class CarroController {
  static async buscarPorPlaca(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as UserPayload;
      const { placa } = request.params as { placa: string };

      if (!placa) {
        return reply.status(400).send({ success: false, message: "Placa é obrigatória" });
      }

      const carro = await CarroService.buscarPorPlaca(placa, user.empresaId);

      if (!carro) {
        return reply.status(404).send({
          success: false,
          message: "Veículo não encontrado",
        });
      }

      return reply.status(200).send({
        success: true,
        data: carro,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        message: error.message || "Erro ao buscar veículo por placa",
      });
    }
  }

  static async createCarro(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as UserPayload;
      const { clientId } = request.params as { clientId: string };
      const data = criarCarroModel.parse(request.body);

      const novoCarro = await CarroService.createCarro(clientId, user.empresaId, data);
      return reply.status(201).send({
        success: true,
        message: "Veículo cadastrado com sucesso",
        data: novoCarro,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message || "Erro ao cadastrar veículo",
      });
    }
  }

  static async updateCarro(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as UserPayload;
      const { id } = request.params as { id: string };
      const data = request.body as any;

      const carroAtualizado = await CarroService.updateCarro(id, user.empresaId, data);
      return reply.send({
        success: true,
        message: "Veículo atualizado com sucesso",
        data: carroAtualizado,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message || "Erro ao atualizar veículo",
      });
    }
  }

  static async deleteCarro(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as UserPayload;
      const { id } = request.params as { id: string };

      const resultado = await CarroService.deleteCarro(id, user.empresaId);
      return reply.send({
        success: true,
        message: resultado.message,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        message: error.message || "Erro ao excluir veículo",
      });
    }
  }
}