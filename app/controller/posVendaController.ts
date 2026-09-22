import { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { atualizarStatusPosVendaSchema } from "../models/posVendaModel";
import { PosVendaService } from "../services/posVendaService";
import { TemplateService } from "../services/templateService";
import { StatusPosVenda } from "../generated/prisma";

export class PosVendaController {
  static async listarPendentes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const empresaId = request.user?.empresaId;
      if (!empresaId) {
        return reply.status(401).send({ message: "Não autorizado." });
      }

      const query = request.query as {
        status?: StatusPosVenda;
        apenasAteHoje?: string;
      };

      const apenasAteHoje = query.apenasAteHoje !== "false";

      const contatos = await PosVendaService.listarPendentes(empresaId, {
        status: query.status,
        apenasAteHoje,
      });

      return reply.status(200).send(contatos);
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({
        message: "Erro ao buscar contatos de pós-venda.",
        error: error.message,
      });
    }
  }

  static async atualizarStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const empresaId = request.user?.empresaId;
      if (!empresaId) {
        return reply.status(401).send({ message: "Não autorizado." });
      }

      const { id } = request.params;
      const dadosValidados = atualizarStatusPosVendaSchema.parse(request.body);

      const atualizado = await PosVendaService.atualizarStatus(id, empresaId, dadosValidados);
      return reply.status(200).send(atualizado);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: "Dados inválidos.",
          errors: error.errors.map((e) => ({
            campo: e.path.join("."),
            mensagem: e.message,
          })),
        });
      }

      request.log.error(error);
      return reply.status(400).send({
        message: error.message || "Erro ao atualizar status do pós-venda.",
      });
    }
  }

  static async gerarWhatsAppLink(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const empresaId = request.user?.empresaId;
      if (!empresaId) {
        return reply.status(401).send({ message: "Não autorizado." });
      }

      const { id } = request.params;

      const linkData = await TemplateService.gerarLinkWhatsApp({
        empresaId,
        tipo: "POS_VENDA_RECALL",
        posVendaId: id,
      });

      return reply.status(200).send(linkData);
    } catch (error: any) {
      request.log.error(error);
      return reply.status(400).send({
        message: error.message || "Erro ao gerar link de WhatsApp.",
      });
    }
  }
}
