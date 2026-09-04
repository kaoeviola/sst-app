import { BaseAgent } from "../core/base-agent";
import type { AgentContext, AgentError } from "../core/types";
import { buildGeradorAPRPrompt } from "./prompt";
import { APRGeradoSchema, type APRGerado, type GeradorAPRInput } from "./schema";

export class GeradorAPRAgent extends BaseAgent<GeradorAPRInput, APRGerado> {
  constructor() {
    super({
      name: "gerador-apr",
      preset: "geracaoDocumento",
      maxRetries: 2,
      schema: APRGeradoSchema,
      validator: (output) => {
        const errors: AgentError[] = [];
        const ordens = output.etapas.map((etapa) => etapa.ordem).sort((a, b) => a - b);

        for (let index = 0; index < ordens.length; index++) {
          if (ordens[index] !== index + 1) {
            errors.push({
              code: "INVALID_SEQUENCE",
              message: `Etapas devem ter ordem sequencial comecando em 1. Encontrado: ${ordens.join(",")}`,
              severity: "ERROR",
              field: "etapas"
            });
            break;
          }
        }

        return errors;
      }
    });
  }

  protected buildPrompt(input: GeradorAPRInput, context: AgentContext, previousErrors?: AgentError[]) {
    return buildGeradorAPRPrompt(input, previousErrors);
  }
}
