import { FastifyInstance } from "fastify";
import authMiddleware from "../middleware/middleware";
import { clientRoutes } from "./client.routes";
import { carRoutes } from "./car.route";
import { servicoRoutes } from "./servico.routes";
import { ordemServicoRoutes } from "./ordemServico.routes";
import { posVendaRoutes } from "./posVenda.routes";
import { templateRoutes } from "./template.routes";
import { metricasRoutes } from "./metricas.routes";

const authenticatedRoutes = (app: FastifyInstance) => {
  app.addHook("onRequest", authMiddleware);
  app.register(clientRoutes);
  app.register(servicoRoutes);
  app.register(carRoutes);
  app.register(ordemServicoRoutes);
  app.register(posVendaRoutes);
  app.register(templateRoutes);
  app.register(metricasRoutes);
};

export default authenticatedRoutes;