import type { AnaliseAtividade } from "../analisador/schema";
import type { APRGerado } from "../apr/schema";
import type { AgentError } from "../core/types";
import { aplicarRegrasDeterministicas } from "./regras-nr";

export class RevisorDeterministico {
  revisar(analise: AnaliseAtividade, apr: APRGerado): { aprovado: boolean; erros: AgentError[] } {
    const erros = aplicarRegrasDeterministicas(analise, apr);
    return {
      aprovado: erros.length === 0,
      erros
    };
  }
}
