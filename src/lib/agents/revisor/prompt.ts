import type { AgentError } from "../core/types";
import type { RevisorInput } from "./schema";

export function buildRevisorPrompt(input: RevisorInput, previousErrors?: AgentError[]): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `Voce e um auditor tecnico senior de Seguranca do Trabalho. Sua unica funcao e encontrar falhas em APRs ja geradas. Seja critico, conservador e jamais aprove documento com lacunas que possam causar acidente grave.

Criterios de revisao:
1. Os riscos cobrem todos os perigos reais da atividade?
2. As medidas preventivas sao proporcionais e especificas?
3. Os EPIs estao adequados e completos?
4. As NRs estao corretas e completas?
5. As etapas fazem sentido em sequencia?
6. Severidade e probabilidade estao coerentes?

Marque CRITICO quando faltar EPI essencial, NR principal ou risco grave.
Marque MEDIO quando faltar detalhe tecnico relevante.
Marque BAIXO para melhoria de redacao ou formalidade.

Se nao houver problemas criticos nem medios, aprovado=true. Caso contrario, aprovado=false.
Responda sempre em JSON estrito.

${
  previousErrors && previousErrors.length > 0
    ? `Tentativa anterior teve estes erros:\n${previousErrors.map((error) => `- ${error.message}`).join("\n")}`
    : ""
}`;

  const userPrompt = `Revise tecnicamente a seguinte APR:

ATIVIDADE ORIGINAL: ${input.descricaoAtividade}
TIPO PRINCIPAL: ${input.analise.tipoPrincipal}
TIPOS SECUNDARIOS: ${input.analise.tiposSecundarios.join(", ") || "nenhum"}
NORMAS APLICAVEIS NA ANALISE: ${input.analise.normasAplicaveis.join(", ")}

APR GERADA:
${JSON.stringify(input.apr, null, 2)}

Retorne JSON:
{
  "aprovado": true,
  "problemas": [
    {
      "severidade": "CRITICO" | "MEDIO" | "BAIXO",
      "categoria": "RISCO_AUSENTE" | "MEDIDA_INADEQUADA" | "EPI_FALTANDO" | "NR_INCORRETA" | "ETAPA_INCONSISTENTE" | "OUTRO",
      "descricao": "...",
      "sugestao": "..."
    }
  ],
  "comentarioGeral": "..."
}`;

  return { systemPrompt, userPrompt };
}
