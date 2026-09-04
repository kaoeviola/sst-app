import type { AnaliseAtividade } from "../analisador/schema";
import type { APRGerado } from "../apr/schema";
import type { AgentError } from "../core/types";

interface RegraNR {
  id: string;
  descricao: string;
  aplica: (analise: AnaliseAtividade, apr: APRGerado) => boolean;
  verifica: (apr: APRGerado) => { ok: boolean; mensagem?: string };
}

const REGRAS: RegraNR[] = [
  {
    id: "NR35_CITADA",
    descricao: "Atividade em altura deve citar NR-35",
    aplica: (analise) => analise.tipoPrincipal === "ALTURA" || analise.tiposSecundarios.includes("ALTURA"),
    verifica: (apr) => ({
      ok: apr.normasAplicaveis.some((norma) => norma.includes("NR-35")),
      mensagem: "Atividade em altura mas NR-35 nao esta em normasAplicaveis"
    })
  },
  {
    id: "NR35_EPI_CINTO",
    descricao: "Altura exige cinturao paraquedista",
    aplica: (analise) => analise.tipoPrincipal === "ALTURA" || analise.tiposSecundarios.includes("ALTURA"),
    verifica: (apr) => {
      const tem = apr.episNecessarios.some((epi) => /paraquedista|cintur[aã]o de seguran[cç]a tipo paraquedista/i.test(epi));
      return { ok: tem, mensagem: "Altura sem cinturao paraquedista nos EPIs" };
    }
  },
  {
    id: "NR10_CITADA",
    descricao: "Atividade eletrica deve citar NR-10",
    aplica: (analise) => analise.tipoPrincipal === "ELETRICO" || analise.tiposSecundarios.includes("ELETRICO"),
    verifica: (apr) => ({
      ok: apr.normasAplicaveis.some((norma) => norma.includes("NR-10")),
      mensagem: "Atividade eletrica mas NR-10 nao esta em normasAplicaveis"
    })
  },
  {
    id: "NR33_CITADA",
    descricao: "Espaco confinado deve citar NR-33",
    aplica: (analise) => analise.tipoPrincipal === "CONFINADO" || analise.tiposSecundarios.includes("CONFINADO"),
    verifica: (apr) => ({
      ok: apr.normasAplicaveis.some((norma) => norma.includes("NR-33")),
      mensagem: "Espaco confinado mas NR-33 nao esta em normasAplicaveis"
    })
  },
  {
    id: "NR33_MEDIDOR_GASES",
    descricao: "Confinado exige medidor de gases",
    aplica: (analise) => analise.tipoPrincipal === "CONFINADO" || analise.tiposSecundarios.includes("CONFINADO"),
    verifica: (apr) => {
      const tem = apr.episNecessarios
        .concat(apr.epcsNecessarios)
        .some((item) => /medidor.*g[aá]s|detector.*g[aá]s|multig[aá]s/i.test(item));
      return { ok: tem, mensagem: "Confinado sem medidor/detector de gases" };
    }
  },
  {
    id: "NR34_EXTINTOR_QUENTE",
    descricao: "Trabalho a quente exige extintor",
    aplica: (analise) => analise.tipoPrincipal === "QUENTE" || analise.tiposSecundarios.includes("QUENTE"),
    verifica: (apr) => {
      const tem = apr.epcsNecessarios.some((epc) => /extintor/i.test(epc));
      return { ok: tem, mensagem: "Trabalho a quente sem extintor nos EPCs" };
    }
  },
  {
    id: "ETAPAS_MIN",
    descricao: "Minimo 3 etapas",
    aplica: () => true,
    verifica: (apr) => ({
      ok: apr.etapas.length >= 3,
      mensagem: `APR tem apenas ${apr.etapas.length} etapas (minimo 3)`
    })
  }
];

export function aplicarRegrasDeterministicas(analise: AnaliseAtividade, apr: APRGerado): AgentError[] {
  const erros: AgentError[] = [];

  for (const regra of REGRAS) {
    if (regra.aplica(analise, apr)) {
      const resultado = regra.verifica(apr);

      if (!resultado.ok) {
        erros.push({
          code: `NR_VIOLATION_${regra.id}`,
          message: resultado.mensagem || regra.descricao,
          severity: "ERROR"
        });
      }
    }
  }

  return erros;
}
