import { z } from "zod";

export const atualizarTemplateSchema = z.object({
  texto: z
    .string({
      required_error: "O texto do template é obrigatório.",
    })
    .min(5, "O texto do template deve ter no mínimo 5 caracteres.")
    .max(1500, "O texto do template não pode exceder 1500 caracteres."),
});

export const tipoTemplateParamSchema = z.object({
  tipo: z.enum(["CONFIRMACAO_AGENDAMENTO", "CARRO_PRONTO", "POS_VENDA_RECALL"], {
    errorMap: () => ({
      message:
        "Tipo de template inválido. Deve ser: CONFIRMACAO_AGENDAMENTO, CARRO_PRONTO ou POS_VENDA_RECALL.",
    }),
  }),
});

export type AtualizarTemplateInput = z.infer<typeof atualizarTemplateSchema>;
export type TipoTemplateParam = z.infer<typeof tipoTemplateParamSchema>;
