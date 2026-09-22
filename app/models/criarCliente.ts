import { z } from "zod";

export const criarClienteModel = z.object({
  nome: z.string().min(2, "Nome do cliente deve ter no mínimo 2 caracteres"),
  whatsapp: z.string().min(10, "WhatsApp com DDD é obrigatório"),
  ativo: z.boolean().default(true),
  carros: z
    .array(
      z.object({
        marca: z.string().min(1, "Marca do carro é obrigatória"),
        modelo: z.string().min(1, "Modelo do carro é obrigatório"),
        ano: z.number().int().min(1900, "Ano inválido").max(new Date().getFullYear() + 1, "Ano no futuro"),
        cor: z.string().min(1, "Cor é obrigatória"),
        placa: z.string().min(7, "Placa deve ter no mínimo 7 caracteres"),
      })
    )
    .optional(),
});

export type CriarClienteInput = z.infer<typeof criarClienteModel>;