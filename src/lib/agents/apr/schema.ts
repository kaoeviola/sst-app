import { z } from "zod";

export const SeveridadeSchema = z.number().int().min(1).max(5);
export const ProbabilidadeSchema = z.number().int().min(1).max(5);

export const EtapaAPRSchema = z.object({
  ordem: z.number().int().min(1),
  descricao: z.string().min(10).max(300),
  riscos: z.array(z.string()).min(1).max(8),
  medidasPreventivas: z.array(z.string()).min(1).max(10)
});

export const RiscoGeralSchema = z.object({
  tipo: z.enum(["FISICO", "QUIMICO", "BIOLOGICO", "ERGONOMICO", "ACIDENTE"]),
  descricao: z.string().min(5).max(200),
  severidade: SeveridadeSchema,
  probabilidade: ProbabilidadeSchema
});

export const APRGeradoSchema = z.object({
  titulo: z.string().min(5).max(150),
  etapas: z.array(EtapaAPRSchema).min(3).max(12),
  riscosGerais: z.array(RiscoGeralSchema).min(1).max(15),
  episNecessarios: z.array(z.string()).min(1).max(20),
  epcsNecessarios: z.array(z.string()).max(15),
  normasAplicaveis: z.array(z.string()).min(1).max(10),
  observacoes: z.string().max(2000).optional()
});

export type APRGerado = z.infer<typeof APRGeradoSchema>;

export interface GeradorAPRInput {
  descricaoAtividade: string;
  local: string;
  analise: import("../analisador/schema").AnaliseAtividade;
  contextoEmpresa?: string;
  episDisponiveis?: string[];
}
