import { FastifyInstance } from "fastify";
import { ServicoController } from "../controller/servicoController";

export const servicoRoutes = async (app: FastifyInstance) => {
  // Listar serviços do catálogo da oficina
  app.get("/servicos", ServicoController.listarServicos);

  // Buscar serviço por ID
  app.get("/servicos/:id", ServicoController.buscarPorId);

  // Criar novo serviço
  app.post("/servicos", ServicoController.criarServico);

  // Atualizar serviço existente
  app.put("/servicos/:id", ServicoController.atualizarServico);

  // Desativar serviço (Soft delete)
  app.delete("/servicos/:id", ServicoController.desativarServico);
};
