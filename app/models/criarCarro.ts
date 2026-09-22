import { z } from "zod";

export const criarCarroModel = z.object({
  marca: z.string().min(1, "Marca é obrigatória"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  ano: z.number().int().min(1900, "Ano inválido").max(new Date().getFullYear() + 1, "Ano inválido"),
  cor: z.string().min(1, "Cor é obrigatória"),
  placa: z.string().min(7, "Placa é obrigatória"),
});

export type CriarCarroInput = z.infer<typeof criarCarroModel>;
export default criarCarroModel;