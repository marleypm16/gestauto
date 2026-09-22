import { FastifyInstance } from "fastify";
import { OrdemServicoController } from "../controller/ordemServicoController";

export const ordemServicoRoutes = async (app: FastifyInstance) => {
  // Visão Mista da Home: Agendados para hoje + Boxes ativos no pátio
  app.get("/patio/hoje", OrdemServicoController.listarPatioHoje);

  // Tela dedicada de agendamentos futuros
  app.get("/agendamentos", OrdemServicoController.listarAgendamentos);

  // Criação de OS (Check-in rápido de portão ou Agendamento)
  app.post("/ordens-servico", OrdemServicoController.criarOS);

  // Detalhes de uma Ordem de Serviço
  app.get("/ordens-servico/:id", OrdemServicoController.buscarPorId);

  // Atualização de status (Confirmar entrada, Avançar fase, Entregar/Receber)
  app.patch("/ordens-servico/:id/status", OrdemServicoController.atualizarStatus);
};
