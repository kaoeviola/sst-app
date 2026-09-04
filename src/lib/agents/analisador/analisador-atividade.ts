import { BaseAgent } from "../core/base-agent";
import type { AgentContext, AgentError } from "../core/types";
import { buildAnalisadorPrompt } from "./prompt";
import { AnaliseAtividadeSchema, type AnaliseAtividade, type AnalisadorInput } from "./schema";

export class AnalisadorAtividadeAgent extends BaseAgent<AnalisadorInput, AnaliseAtividade> {
  constructor() {
    super({
      name: "analisador-atividade",
      preset: "classificacao",
      maxRetries: 2,
      schema: AnaliseAtividadeSchema,
      validator: (output) => {
        const errors: AgentError[] = [];
        const tiposAltoRisco = ["ALTURA", "CONFINADO", "QUENTE", "ELETRICO", "ESCAVACAO"];
        const deveSerAltoRisco = tiposAltoRisco.includes(output.tipoPrincipal);

        if (deveSerAltoRisco && !output.altoRisco) {
          errors.push({
            code: "INCONSISTENCY",
            message: `tipoPrincipal=${output.tipoPrincipal} deveria ter altoRisco=true`,
            severity: "ERROR",
            field: "altoRisco"
          });
        }

        return errors;
      }
    });
  }

  protected buildPrompt(input: AnalisadorInput, context: AgentContext, previousErrors?: AgentError[]) {
    return buildAnalisadorPrompt(input, previousErrors);
  }
}
