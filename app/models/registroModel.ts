import { z } from "zod";

export const registroModel = z.object({
  nome: z.string().min(2, "Nome do proprietário deve ter no mínimo 2 caracteres"),
  email: z.string().email("Digite um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  nomeFantasia: z.string().min(2, "Nome da oficina deve ter no mínimo 2 caracteres"),
  razaoSocial: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ deve conter no mínimo 14 dígitos"),
  whatsapp: z.string().min(10, "WhatsApp com DDD é obrigatório"),
});

export type RegistroInput = z.infer<typeof registroModel>;