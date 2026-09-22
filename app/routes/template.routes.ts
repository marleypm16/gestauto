import { FastifyInstance } from "fastify";
import { TemplateController } from "../controller/templateController";

export const templateRoutes = async (app: FastifyInstance) => {
  app.get("/templates-whatsapp", TemplateController.listar);
  app.put("/templates-whatsapp/:tipo", TemplateController.atualizar);
  app.get("/ordens-servico/:id/whatsapp-link", TemplateController.gerarLinkOS);
};
