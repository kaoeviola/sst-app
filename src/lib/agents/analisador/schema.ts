import { z } from "zod";

export const TipoAtividadeEnum = z.enum(["ALTURA", "CONFINADO", "QUENTE", "ELETRICO", "ESCAVACAO", "GERAL"]);

export const AmbienteEnum = z.enum(["INTERNO", "EXTERNO", "URBANO", "INDUSTRIAL", "RURAL", "SUBTERRANEO"]);

export const AnaliseAtividadeSchema = z.object({
  tipoPrincipal: TipoAtividadeEnum,
  tiposSecundarios: z.array(TipoAtividadeEnum).max(4),
  ambiente: AmbienteEnum,
  riscosDetectados: z.array(z.string()).min(1).max(15),
  normasAplicaveis: z.array(z.string()).min(1).max(10),
  duracaoEstimadaHoras: z.number().min(0.25).max(168),
  altoRisco: z.boolean(),
  justificativaClassificacao: z.string().min(10).max(500)
});

export type AnaliseAtividade = z.infer<typeof AnaliseAtividadeSchema>;

export interface AnalisadorInput {
  descricaoAtividade: string;
  local?: string;
  contextoEmpresa?: string;
}
