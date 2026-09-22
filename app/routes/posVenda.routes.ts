import { FastifyInstance } from "fastify";
import { PosVendaController } from "../controller/posVendaController";

export const posVendaRoutes = async (app: FastifyInstance) => {
  app.get("/pos-venda/pendentes", PosVendaController.listarPendentes);
  app.patch("/pos-venda/:id/status", PosVendaController.atualizarStatus);
  app.get("/pos-venda/:id/whatsapp-link", PosVendaController.gerarWhatsAppLink);
};
