import { z } from "zod";

export const loginModel = z.object({
  email: z.string().email("Digite um e-mail válido").min(1, "E-mail é obrigatório"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginModel>;