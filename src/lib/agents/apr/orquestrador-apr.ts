import { AnalisadorAtividadeAgent } from "../analisador/analisador-atividade";
import type { AnaliseAtividade } from "../analisador/schema";
import type { AgentContext, AgentError } from "../core/types";
import { RevisorDeterministico } from "../revisor/revisor-deterministico";
import { RevisorTecnicoLLMAgent } from "../revisor/revisor-tecnico-llm";
import type { RevisaoLLM } from "../revisor/schema";
import { GeradorAPRAgent } from "./gerador-apr";
import type { APRGerado } from "./schema";

export interface OrquestradorAPRInput {
  descricaoAtividade: string;
  local: string;
  contextoEmpresa?: string;
  episDisponiveis?: string[];
}

export interface OrquestradorAPRResult {
  success: boolean;
  rascunhoGerado: boolean;
  aprovadoRevisaoAutomatizada: boolean;
  requerRevisaoHumana: boolean;
  apr?: APRGerado;
  analise?: AnaliseAtividade;
  revisaoLLM?: RevisaoLLM;
  problemasRevisaoAutomatizada: AgentError[];
  errosRevisorDeterministico: AgentError[];
  erros: AgentError[];
  custoTotalUSD: number;
  latenciaTotalMs: number;
}

function problemasRevisaoLLM(revisaoLLM?: RevisaoLLM): AgentError[] {
  return (
    revisaoLLM?.problemas.map((problema) => ({
      code: `REVISAO_LLM_${problema.categoria}`,
      message: problema.sugestao ? `${problema.descricao} Sugestao: ${problema.sugestao}` : problema.descricao,
      severity: problema.severidade === "BAIXO" ? ("WARNING" as const) : ("ERROR" as const)
    })) ?? []
  );
}

export async function orquestrarGeracaoAPR(
  input: OrquestradorAPRInput,
  context: AgentContext
): Promise<OrquestradorAPRResult> {
  const startTime = Date.now();
  let custoTotal = 0;

  const analisador = new AnalisadorAtividadeAgent();
  const resultAnalise = await analisador.run(
    {
      descricaoAtividade: input.descricaoAtividade,
      local: input.local,
      contextoEmpresa: input.contextoEmpresa
    },
    { ...context, documentType: "APR" }
  );
  custoTotal += resultAnalise.metadata.costUSD;

  if (!resultAnalise.success || !resultAnalise.data) {
    return {
      success: false,
      rascunhoGerado: false,
      aprovadoRevisaoAutomatizada: false,
      requerRevisaoHumana: false,
      erros: resultAnalise.errors || [],
      problemasRevisaoAutomatizada: [],
      errosRevisorDeterministico: [],
      custoTotalUSD: custoTotal,
      latenciaTotalMs: Date.now() - startTime
    };
  }

  const analise = resultAnalise.data;
  const gerador = new GeradorAPRAgent();
  let apr: APRGerado | undefined;
  let errosFinais: AgentError[] = [];
  let errosDeterministico: AgentError[] = [];
  let revisaoLLM: RevisaoLLM | undefined;
  const maxRevisoes = 2;

  for (let tentativa = 1; tentativa <= maxRevisoes + 1; tentativa++) {
    const resultAPR = await gerador.run(
      {
        descricaoAtividade: input.descricaoAtividade,
        local: input.local,
        analise,
        contextoEmpresa: input.contextoEmpresa,
        episDisponiveis: input.episDisponiveis
      },
      { ...context, documentType: "APR", attempt: tentativa }
    );
    custoTotal += resultAPR.metadata.costUSD;

    if (!resultAPR.success || !resultAPR.data) {
      errosFinais = resultAPR.errors || [];
      break;
    }

    apr = resultAPR.data;

    const revDet = new RevisorDeterministico();
    const resDet = revDet.revisar(analise, apr);
    errosDeterministico = resDet.erros;

    const revLLM = new RevisorTecnicoLLMAgent();
    const resRevLLM = await revLLM.run(
      { descricaoAtividade: input.descricaoAtividade, analise, apr },
      { ...context, documentType: "APR", attempt: tentativa }
    );
    custoTotal += resRevLLM.metadata.costUSD;

    if (resRevLLM.success && resRevLLM.data) {
      revisaoLLM = resRevLLM.data;
    }

    const problemasCriticos = revisaoLLM?.problemas.filter((problema) => problema.severidade === "CRITICO") || [];
    const aprovado = resDet.aprovado && problemasCriticos.length === 0;

    if (aprovado || tentativa > maxRevisoes) {
      errosFinais = [];
      break;
    }
  }

  const problemasAutomatizados = [...errosDeterministico, ...problemasRevisaoLLM(revisaoLLM), ...errosFinais];
  const rascunhoGerado = Boolean(apr);
  const aprovadoRevisaoAutomatizada = rascunhoGerado && problemasAutomatizados.every((problema) => problema.severity !== "ERROR");

  return {
    success: rascunhoGerado,
    rascunhoGerado,
    aprovadoRevisaoAutomatizada,
    requerRevisaoHumana: rascunhoGerado,
    apr,
    analise,
    revisaoLLM,
    problemasRevisaoAutomatizada: problemasAutomatizados,
    errosRevisorDeterministico: errosDeterministico,
    erros: errosFinais,
    custoTotalUSD: custoTotal,
    latenciaTotalMs: Date.now() - startTime
  };
}
