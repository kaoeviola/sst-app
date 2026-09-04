import type { AgentError } from "../core/types";
import type { AnalisadorInput } from "./schema";

export function buildAnalisadorPrompt(
  input: AnalisadorInput,
  previousErrors?: AgentError[]
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `Voce e um engenheiro de seguranca do trabalho senior brasileiro com 20 anos de experiencia em industria pesada, construcao civil, petroquimica e mineracao. Voce e especialista em Normas Regulamentadoras brasileiras.

Sua tarefa e analisar e classificar uma atividade, identificando tipo, riscos e normas aplicaveis. Voce nao gera APR nem PT nesta etapa.

Criterios de classificacao:
- ALTURA: trabalho a partir de 2m de diferenca de nivel (NR-35)
- CONFINADO: ventilacao restrita, acesso limitado ou atmosfera perigosa (NR-33)
- QUENTE: soldagem, corte, esmerilhamento, chama aberta ou fagulha (NR-34, NR-18)
- ELETRICO: instalacoes e servicos em eletricidade (NR-10)
- ESCAVACAO: aberturas no solo, valas ou fundacoes (NR-18)
- GERAL: atividade sem enquadramento especifico em risco grave

Regras:
1. Se houver sobreposicao de tipos, marque o de maior severidade como principal e os outros como secundarios.
2. Seja conservador: na duvida, classifique como mais arriscado.
3. Normas aplicaveis devem usar formato exato: "NR-35", "NR-10", "NR-18".
4. altoRisco=true se tipoPrincipal for ALTURA, CONFINADO, QUENTE, ELETRICO ou ESCAVACAO.
5. Responda sempre em JSON estrito, sem texto fora do JSON.

${
  previousErrors && previousErrors.length > 0
    ? `Tentativa anterior teve estes erros:\n${previousErrors
        .map((error) => `- ${error.field ? `[${error.field}] ` : ""}${error.message}`)
        .join("\n")}\nCorrija e responda novamente em JSON estrito.`
    : ""
}`;

  const userPrompt = `Analise a seguinte atividade:

Descricao: ${input.descricaoAtividade}
${input.local ? `Local: ${input.local}` : ""}
${input.contextoEmpresa ? `Contexto da empresa: ${input.contextoEmpresa}` : ""}

Retorne JSON com este formato exato:
{
  "tipoPrincipal": "ALTURA" | "CONFINADO" | "QUENTE" | "ELETRICO" | "ESCAVACAO" | "GERAL",
  "tiposSecundarios": [],
  "ambiente": "INTERNO" | "EXTERNO" | "URBANO" | "INDUSTRIAL" | "RURAL" | "SUBTERRANEO",
  "riscosDetectados": ["risco 1", "risco 2"],
  "normasAplicaveis": ["NR-XX"],
  "duracaoEstimadaHoras": 1,
  "altoRisco": true,
  "justificativaClassificacao": "texto explicando a classificacao"
}`;

  return { systemPrompt, userPrompt };
}
