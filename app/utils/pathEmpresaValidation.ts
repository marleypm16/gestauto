import { FastifyRequest, FastifyReply } from "fastify";
import { UserPayload } from "../interface/userPayload";

/**
 * Utilitário para validar se o usuário autenticado pertence à empresa alvo do path/body
 */
export async function validateEmpresaAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  empresaId: string
): Promise<boolean> {
  const user = request.user as UserPayload | undefined;

  if (!user || !user.id) {
    reply.code(401).send({
      success: false,
      message: "Usuário não autenticado",
    });
    return false;
  }

  if (user.empresaId !== empresaId) {
    reply.code(403).send({
      success: false,
      message: "Acesso negado para esta empresa",
    });
    return false;
  }

  return true;
}

/**
 * Extrai empresaId do path e valida acesso imediato
 */
export async function getValidatedEmpresaId(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<string | null> {
  const { empresaId } = request.params as { empresaId?: string };

  if (!empresaId) {
    reply.code(400).send({
      success: false,
      message: "ID da empresa é obrigatório no path",
    });
    return null;
  }

  const isValid = await validateEmpresaAccess(request, reply, empresaId);
  return isValid ? empresaId : null;
}