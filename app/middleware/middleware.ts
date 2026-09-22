import { FastifyReply, FastifyRequest } from "fastify";
import { UserPayload } from "../interface/userPayload";

const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const cookieToken = request.cookies.accessToken;
  const headerToken = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  const token = cookieToken || headerToken;

  if (!token) {
    return reply.code(401).send({
      success: false,
      error: "Token não fornecido",
      message: "Token de acesso não encontrado. Faça login para continuar.",
    });
  }

  try {
    const decoded = await request.jwtVerify<UserPayload>();

    if (!decoded.id || !decoded.empresaId) {
      return reply.code(401).send({
        success: false,
        error: "Token inválido",
        message: "Token de acesso malformado ou incompleto.",
      });
    }

    request.user = decoded;
    (request as any).empresaId = decoded.empresaId;
  } catch (error) {
    return reply.code(401).send({
      success: false,
      error: "Token inválido",
      message: "Token de acesso expirado ou inválido.",
    });
  }
};

export default authMiddleware;
