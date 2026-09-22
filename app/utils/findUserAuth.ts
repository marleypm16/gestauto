import prisma from "../plugin/postgres";
import bcrypt from "bcryptjs";

export const findUserAuth = async (email: string, senha: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        empresa: true,
      },
    });

    if (!user || !user.ativo || !user.empresa.ativo) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    return null;
  }
};