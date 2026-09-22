import { z } from "zod";

export const criarOrdemServicoSchema = z.object({
  clienteId: z.string().uuid("ID do cliente inválido"),
  carroId: z.string().uuid("ID do veículo inválido"),
  status: z
    .enum(["AGENDADO", "AGUARDANDO_INICIO", "EM_EXECUCAO", "PRONTO_RETIRADA"])
    .default("AGUARDANDO_INICIO"),
  dataAgendamento: z.coerce.date().optional(),
  previsaoEntrega: z.coerce.date().optional(),
  observacoes: z.string().optional(),
  itens: z
    .array(
      z.object({
        servicoId: z.string().uuid("ID do serviço inválido"),
        precoAplicado: z.coerce.number().min(0, "O preço aplicado deve ser maior ou igual a zero"),
      })
    )
    .min(1, "Selecione pelo menos um serviço para a ordem de serviço"),
  valorTotal: z.coerce.number().min(0).optional(),
});

export const atualizarStatusOSSchema = z.object({
  status: z.enum([
    "AGENDADO",
    "AGUARDANDO_INICIO",
    "EM_EXECUCAO",
    "PRONTO_RETIRADA",
    "ENTREGUE",
    "CANCELADO",
  ]),
  metodoPagamento: z
    .enum(["PIX", "CARTAO_CREDITO", "CARTAO_DEBITO", "DINHEIRO", "A_RECEBER"])
    .optional(),
  observacoes: z.string().optional(),
});

export type CriarOrdemServicoInput = z.infer<typeof criarOrdemServicoSchema>;
export type AtualizarStatusOSInput = z.infer<typeof atualizarStatusOSSchema>;
