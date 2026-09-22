import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ServicoService } from "../services/servicoService";
import { UserPayload } from "../interface/userPayload";

const criarServicoSchema = z.object({
  nome: z.string().min(2, "Nome do serviço deve ter no mínimo 2 caracteres"),
  descricao: z.string().optional(),
  precoBase: z.coerce.number().min(0, "Preço base deve ser maior ou igual a zero"),
  duracaoMinutos: z.coerce.number().int().min(1).default(60),
  tempoPosVenda: z.coerce.number().int().min(0).default(30),
  ativo: z.boolean().default(true),
});

const atualizarServicoSchema = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  precoBase: z.coerce.number().min(0).optional(),
  duracaoMinutos: z.coerce.number().int().min(1).optional(),
  tempoPosVenda: z.coerce.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});

export class ServicoController {
  static async criarServico(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const data = criarServicoSchema.parse(req.body);

      const servico = await ServicoService.criarServico(user.empresaId, data);
      return res.status(201).send({
        success: true,
        message: "Serviço cadastrado com sucesso",
        data: servico,
      });
    } catch (error: any) {
      return res.status(400).send({
        success: false,
        message: error.message || "Erro ao cadastrar serviço",
      });
    }
  }

  static async listarServicos(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const { todos } = req.query as { todos?: string };
      const apenasAtivos = todos !== "true";

      const servicos = await ServicoService.listarServicos(user.empresaId, apenasAtivos);
      return res.status(200).send({
        success: true,
        data: servicos,
      });
    } catch (error: any) {
      return res.status(500).send({
        success: false,
        message: error.message || "Erro ao listar serviços",
      });
    }
  }

  static async buscarPorId(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const { id } = req.params as { id: string };

      const servico = await ServicoService.buscarPorId(id, user.empresaId);
      if (!servico) {
        return res.status(404).send({
          success: false,
          message: "Serviço não encontrado",
        });
      }

      return res.status(200).send({
        success: true,
        data: servico,
      });
    } catch (error: any) {
      return res.status(500).send({
        success: false,
        message: error.message || "Erro ao buscar serviço",
      });
    }
  }

  static async atualizarServico(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const { id } = req.params as { id: string };
      const data = atualizarServicoSchema.parse(req.body);

      const servicoAtualizado = await ServicoService.atualizarServico(id, user.empresaId, data);
      return res.status(200).send({
        success: true,
        message: "Serviço atualizado com sucesso",
        data: servicoAtualizado,
      });
    } catch (error: any) {
      return res.status(400).send({
        success: false,
        message: error.message || "Erro ao atualizar serviço",
      });
    }
  }

  static async desativarServico(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const { id } = req.params as { id: string };

      await ServicoService.desativarServico(id, user.empresaId);
      return res.status(200).send({
        success: true,
        message: "Serviço desativado com sucesso",
      });
    } catch (error: any) {
      return res.status(400).send({
        success: false,
        message: error.message || "Erro ao desativar serviço",
      });
    }
  }
}