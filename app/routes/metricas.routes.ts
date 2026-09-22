import { FastifyInstance } from "fastify";
import { MetricasController } from "../controller/metricasController";

export const metricasRoutes = async (app: FastifyInstance) => {
  app.get("/metricas/resumo-dia", MetricasController.resumoDia);
};
