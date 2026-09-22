import { FastifyInstance } from "fastify";
import { AuthController } from "../auth/authController";
import authMiddleware from "../middleware/middleware";

const authRoutes = (app: FastifyInstance) => {
  app.post("/auth/register", AuthController.register);
  app.post("/auth/login", AuthController.login);
  app.post("/auth/logout", AuthController.logout);
  app.get("/auth/me", { preHandler: [authMiddleware] }, AuthController.me);
};

export default authRoutes;