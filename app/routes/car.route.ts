import { FastifyInstance } from "fastify";
import { CarroController } from "../controller/carroController";

export const carRoutes = (app: FastifyInstance) => {
  // Busca rápida de veículo pela placa (Auto-complete no check-in)
  app.get("/carros/placa/:placa", CarroController.buscarPorPlaca);

  // Adicionar carro a um cliente existente
  app.post("/clientes/:clientId/carros", CarroController.createCarro);

  // Atualizar dados de um carro
  app.put("/carros/:id", CarroController.updateCarro);

  // Excluir carro
  app.delete("/carros/:id", CarroController.deleteCarro);
};