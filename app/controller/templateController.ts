import { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import {
  atualizarTemplateSchema,
  tipoTemplateParamSchema,
} from "../models/templateModel";
import { TemplateService } from "../services/templateService";
import { TipoTemplate } from "../generated/prisma";

export class TemplateController {
  static async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const empresaId = request.user?.empresaId;
      if (!empresaId) {
        return reply.status(401).send({ message: "Não autorizado." });
      }

      const templates = await TemplateService.listarTemplates(empresaId);
      return reply.status(200).send(templates);
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({
        message: "Erro ao buscar templates.",
        error: error.message,
      });
    }
  }

  static async atualizar(
    request: FastifyRequest<{ Params: { tipo: string } }>,
    reply: FastifyReply
  ) {
    try {
      const empresaId = request.user?.empresaId;
      if (!empresaId) {
        return reply.status(401).send({ message: "Não autorizado." });
      }

      const { tipo } = tipoTemplateParamSchema.parse(request.params);
      const { texto } = atualizarTemplateSchema.parse(request.body);

      const templateAtualizado = await TemplateService.atualizarTemplate(
        empresaId,
        tipo as TipoTemplate,
        texto
      );

      return reply.status(200).send(templateAtualizado);
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
        message: error.message || "Erro ao atualizar template.",
      });
    }
  }

  static async gerarLinkOS(
    request: FastifyRequest<{
      Params: { id: string };
      Querystring: { tipo?: TipoTemplate };
    }>,
    reply: FastifyReply
  ) {
    try {
      const empresaId = request.user?.empresaId;
      if (!empresaId) {
        return reply.status(401).send({ message: "Não autorizado." });
      }

      const { id } = request.params;
      const tipo = request.query?.tipo || "CARRO_PRONTO";

      const linkData = await TemplateService.gerarLinkWhatsApp({
        empresaId,
        tipo,
        ordemServicoId: id,
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
