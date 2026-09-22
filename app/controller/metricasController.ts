import { FastifyReply, FastifyRequest } from "fastify";
import { MetricasService } from "../services/metricasService";

export class MetricasController {
  static async resumoDia(request: FastifyRequest, reply: FastifyReply) {
    try {
      const empresaId = request.user?.empresaId;
      if (!empresaId) {
        return reply.status(401).send({ message: "Não autorizado." });
      }

      const resumo = await MetricasService.obterResumoDia(empresaId);
      return reply.status(200).send(resumo);
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({
        message: "Erro ao carregar métricas da oficina.",
        error: error.message,
      });
    }
  }
}
