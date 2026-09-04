import { z } from "zod";

export const RevisaoLLMSchema = z.object({
  aprovado: z.boolean(),
  problemas: z
    .array(
      z.object({
        severidade: z.enum(["CRITICO", "MEDIO", "BAIXO"]),
        categoria: z.enum([
          "RISCO_AUSENTE",
          "MEDIDA_INADEQUADA",
          "EPI_FALTANDO",
          "NR_INCORRETA",
          "ETAPA_INCONSISTENTE",
          "OUTRO"
        ]),
        descricao: z.string().min(10).max(500),
        sugestao: z.string().max(500).optional()
      })
    )
    .max(15),
  comentarioGeral: z.string().max(1000)
});

export type RevisaoLLM = z.infer<typeof RevisaoLLMSchema>;

export interface RevisorInput {
  descricaoAtividade: string;
  analise: import("../analisador/schema").AnaliseAtividade;
  apr: import("../apr/schema").APRGerado;
}
