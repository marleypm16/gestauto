import { FastifyInstance } from "fastify";
import { ClientController } from "../controller/clientController";

export const clientRoutes = (app: FastifyInstance) => {
  // Listar clientes com busca e paginação
  app.get("/clientes", ClientController.getClients);

  // Detalhes de um cliente específico com veículos e histórico
  app.get("/clientes/:id", ClientController.getClientById);

  // Cadastrar novo cliente (com veículos opcionais)
  app.post("/clientes", ClientController.createClient);

  // Atualizar cliente
  app.put("/clientes/:id", ClientController.updateClient);
};