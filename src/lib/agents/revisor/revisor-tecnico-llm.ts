import { BaseAgent } from "../core/base-agent";
import type { AgentContext, AgentError } from "../core/types";
import { buildRevisorPrompt } from "./prompt";
import { RevisaoLLMSchema, type RevisaoLLM, type RevisorInput } from "./schema";

export class RevisorTecnicoLLMAgent extends BaseAgent<RevisorInput, RevisaoLLM> {
  constructor() {
    super({
      name: "revisor-tecnico-llm",
      preset: "validacaoTecnica",
      maxRetries: 1,
      schema: RevisaoLLMSchema
    });
  }

  protected buildPrompt(input: RevisorInput, context: AgentContext, previousErrors?: AgentError[]) {
    return buildRevisorPrompt(input, previousErrors);
  }
}
