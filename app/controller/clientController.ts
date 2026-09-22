import { FastifyReply, FastifyRequest } from "fastify";
import { ClientService } from "../services/clientService";
import { criarClienteModel } from "../models/criarCliente";
import { getClientesQuerySchema } from "../models/buscarClientes";
import { UserPayload } from "../interface/userPayload";

export class ClientController {
  static async getClients(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const params = getClientesQuerySchema.parse(req.query);

      const clientes = await ClientService.getClients(user.empresaId, params);

      return res.status(200).send({
        success: true,
        ...clientes,
      });
    } catch (error: any) {
      return res.status(500).send({
        success: false,
        message: error.message || "Erro ao listar clientes",
      });
    }
  }

  static async getClientById(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const { id } = req.params as { id: string };

      const client = await ClientService.getClientById(id, user.empresaId);

      if (!client) {
        return res.status(404).send({
          success: false,
          message: "Cliente não encontrado",
        });
      }

      return res.status(200).send({
        success: true,
        data: client,
      });
    } catch (error: any) {
      return res.status(500).send({
        success: false,
        message: error.message || "Erro ao buscar detalhes do cliente",
      });
    }
  }

  static async createClient(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const data = criarClienteModel.parse(req.body);

      const newClient = await ClientService.createClient(user.empresaId, data);

      return res.status(201).send({
        success: true,
        message: "Cliente cadastrado com sucesso",
        data: newClient,
      });
    } catch (error: any) {
      return res.status(400).send({
        success: false,
        message: error.message || "Erro ao cadastrar cliente",
      });
    }
  }

  static async updateClient(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const { id } = req.params as { id: string };
      const data = req.body as any;

      const updatedClient = await ClientService.updateClient(id, user.empresaId, data);

      return res.status(200).send({
        success: true,
        message: "Cliente atualizado com sucesso",
        data: updatedClient,
      });
    } catch (error: any) {
      return res.status(400).send({
        success: false,
        message: error.message || "Erro ao atualizar cliente",
      });
    }
  }
}