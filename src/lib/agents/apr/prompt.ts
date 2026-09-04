import type { AgentError } from "../core/types";
import type { GeradorAPRInput } from "./schema";

export function buildGeradorAPRPrompt(
  input: GeradorAPRInput,
  previousErrors?: AgentError[]
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `Voce e um engenheiro de seguranca do trabalho senior especialista em Analise Preliminar de Risco (APR).

Gere uma APR completa, tecnica e conservadora para a atividade descrita.

Principios:
1. Quebre a atividade em etapas operacionais sequenciais, minimo 3 e maximo 12.
2. Para cada etapa, liste riscos especificos e medidas preventivas.
3. Riscos gerais incluem perigos do ambiente e da atividade.
4. Severidade 1-5: 1=insignificante, 5=catastrofico.
5. Probabilidade 1-5: 1=raro, 5=quase certo sem medidas.
6. NRs devem usar formato exato, como "NR-35".
7. EPIs devem ser especificos, nao genericos.
8. Seja conservador.

Contexto tecnico:
- ALTURA (NR-35): cinturao paraquedista, talabarte duplo com absorvedor, ponto de ancoragem >=15kN, linha de vida, capacete com jugular.
- CONFINADO (NR-33): medidor de gases, ventilacao forcada, vigia externo, kit resgate, comunicacao continua, PET.
- QUENTE (NR-34/NR-18): extintor proximo, area isolada, retirada de inflamaveis, biombo, vigia de fogo.
- ELETRICO (NR-10): bloqueio e etiquetagem, teste de ausencia de tensao, EPI dieletrico, distancia de seguranca.
- ESCAVACAO (NR-18): escoramento, distancia de empilhamento, sinalizacao, medicao atmosferica quando aplicavel.

Responda sempre em JSON estrito, sem texto fora do JSON.

${
  previousErrors && previousErrors.length > 0
    ? `Tentativa anterior teve estes erros:\n${previousErrors
        .map((error) => `- ${error.field ? `[${error.field}] ` : ""}${error.message}`)
        .join("\n")}\nCorrija e responda novamente.`
    : ""
}`;

  const userPrompt = `Gere uma APR para a seguinte atividade:

ATIVIDADE: ${input.descricaoAtividade}
LOCAL: ${input.local}

ANALISE PREVIA:
- Tipo principal: ${input.analise.tipoPrincipal}
- Tipos secundarios: ${input.analise.tiposSecundarios.join(", ") || "nenhum"}
- Ambiente: ${input.analise.ambiente}
- Riscos detectados: ${input.analise.riscosDetectados.join("; ")}
- Normas aplicaveis: ${input.analise.normasAplicaveis.join(", ")}
- Duracao estimada: ${input.analise.duracaoEstimadaHoras}h
- Alto risco: ${input.analise.altoRisco ? "SIM" : "NAO"}

${input.contextoEmpresa ? `CONTEXTO DA EMPRESA: ${input.contextoEmpresa}` : ""}
${input.episDisponiveis?.length ? `EPIs DISPONIVEIS NA EMPRESA: ${input.episDisponiveis.join(", ")}` : ""}

Retorne JSON com este formato exato:
{
  "titulo": "string curto descritivo",
  "etapas": [
    {
      "ordem": 1,
      "descricao": "...",
      "riscos": ["..."],
      "medidasPreventivas": ["..."]
    }
  ],
  "riscosGerais": [
    {
      "tipo": "FISICO" | "QUIMICO" | "BIOLOGICO" | "ERGONOMICO" | "ACIDENTE",
      "descricao": "...",
      "severidade": 1,
      "probabilidade": 1
    }
  ],
  "episNecessarios": ["..."],
  "epcsNecessarios": ["..."],
  "normasAplicaveis": ["NR-XX"],
  "observacoes": "texto opcional"
}`;

  return { systemPrompt, userPrompt };
}
