import { FastifyInstance } from "fastify";
import { EmpresaController } from "../controller/empresaController";

const empresaRoutes = async (app: FastifyInstance) => {
  app.get("/empresas", EmpresaController.getEmpresas);
  app.get("/empresas/me", EmpresaController.getEmpresaUser);
};

export default empresaRoutes;
