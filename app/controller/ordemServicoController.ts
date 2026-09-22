import { FastifyReply, FastifyRequest } from "fastify";
import { OrdemServicoService } from "../services/ordemServicoService";
import {
  criarOrdemServicoSchema,
  atualizarStatusOSSchema,
} from "../models/ordemServicoModel";
import { UserPayload } from "../interface/userPayload";

export class OrdemServicoController {
  /**
   * Visão Mista da Home: Agendados para hoje + Pátio em andamento
   */
  static async listarPatioHoje(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const patio = await OrdemServicoService.listarPatioHoje(user.empresaId);

      return res.status(200).send({
        success: true,
        data: patio,
      });
    } catch (error: any) {
      return res.status(500).send({
        success: false,
        message: error.message || "Erro ao carregar visão do pátio",
      });
    }
  }

  /**
   * Tela Dedicada de Agendamentos Futuros
   */
  static async listarAgendamentos(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const { dataInicio, dataFim } = req.query as {
        dataInicio?: string;
        dataFim?: string;
      };

      const inicio = dataInicio ? new Date(dataInicio) : undefined;
      const fim = dataFim ? new Date(dataFim) : undefined;

      const agendamentos = await OrdemServicoService.listarAgendamentos(
        user.empresaId,
        inicio,
        fim
      );

      return res.status(200).send({
        success: true,
        data: agendamentos,
      });
    } catch (error: any) {
      return res.status(500).send({
        success: false,
        message: error.message || "Erro ao listar agendamentos",
      });
    }
  }

  /**
   * Criar nova OS (Check-in rápido imediato ou agendamento)
   */
  static async criarOS(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const data = criarOrdemServicoSchema.parse(req.body);

      const novaOS = await OrdemServicoService.criarOrdemServico(user.empresaId, data);

      return res.status(201).send({
        success: true,
        message:
          data.status === "AGENDADO"
            ? "Agendamento criado com sucesso!"
            : "Entrada no pátio confirmada com sucesso!",
        data: novaOS,
      });
    } catch (error: any) {
      return res.status(400).send({
        success: false,
        message: error.message || "Erro ao processar ordem de serviço",
      });
    }
  }

  /**
   * Buscar detalhes de uma Ordem de Serviço
   */
  static async buscarPorId(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const { id } = req.params as { id: string };

      const os = await OrdemServicoService.buscarPorId(id, user.empresaId);
      if (!os) {
        return res.status(404).send({
          success: false,
          message: "Ordem de serviço não encontrada.",
        });
      }

      return res.status(200).send({
        success: true,
        data: os,
      });
    } catch (error: any) {
      return res.status(500).send({
        success: false,
        message: error.message || "Erro ao buscar ordem de serviço",
      });
    }
  }

  /**
   * Atualizar status da OS (Avançar fase, Confirmar entrada ou Entregar/Pagar)
   */
  static async atualizarStatus(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = req.user as UserPayload;
      const { id } = req.params as { id: string };
      const data = atualizarStatusOSSchema.parse(req.body);

      const osAtualizada = await OrdemServicoService.atualizarStatus(
        id,
        user.empresaId,
        data
      );

      return res.status(200).send({
        success: true,
        message: "Status atualizado com sucesso!",
        data: osAtualizada,
      });
    } catch (error: any) {
      return res.status(400).send({
        success: false,
        message: error.message || "Erro ao atualizar status da ordem de serviço",
      });
    }
  }
}
