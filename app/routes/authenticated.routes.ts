import { FastifyInstance } from "fastify";
import authMiddleware from "../middleware/middleware";
import { clientRoutes } from "./client.routes";
import { carRoutes } from "./car.route";
import { servicoRoutes } from "./servico.routes";

const authenticatedRoutes = (app: FastifyInstance) => {
  app.addHook("onRequest", authMiddleware);
  app.register(clientRoutes);
  app.register(servicoRoutes);
  app.register(carRoutes);
};

export default authenticatedRoutes;