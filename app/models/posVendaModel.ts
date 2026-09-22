import { z } from "zod";

export const atualizarStatusPosVendaSchema = z.object({
  status: z.enum(["PENDENTE", "CONTATADO", "REAGENDADO", "IGNORADO"], {
    errorMap: () => ({
      message: "Status inválido. Deve ser: PENDENTE, CONTATADO, REAGENDADO ou IGNORADO.",
    }),
  }),
  observacoes: z.string().optional(),
});

export type AtualizarStatusPosVendaInput = z.infer<typeof atualizarStatusPosVendaSchema>;
