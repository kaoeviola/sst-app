import { llm, LLM_PRESETS, type LLMModel, type LLMRequest } from "../../llm";
import { logAgentCall } from "./persistence";
import type { AgentConfig, AgentContext, AgentError, AgentResult } from "./types";

function sanitizeAgentError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("json") || message.includes("parse")) {
    return "LLM_RESPONSE_INVALID";
  }

  if (
    message.includes("openai") ||
    message.includes("mistral") ||
    message.includes("groq") ||
    message.includes("nvidia") ||
    message.includes("provider") ||
    message.includes("api")
  ) {
    return "LLM_PROVIDER_ERROR";
  }

  if (error instanceof Error) {
    return "LLM_CALL_FAILED";
  }

  return "UNKNOWN_AGENT_ERROR";
}

export abstract class BaseAgent<TInput, TOutput> {
  constructor(protected config: AgentConfig<TInput, TOutput>) {}

  protected abstract buildPrompt(
    input: TInput,
    context: AgentContext,
    previousErrors?: AgentError[]
  ): {
    systemPrompt: string;
    userPrompt: string;
  };

  async run(input: TInput, context: AgentContext): Promise<AgentResult<TOutput>> {
    const maxRetries = this.config.maxRetries ?? 2;
    const preset = LLM_PRESETS[this.config.preset];
    let lastErrors: AgentError[] = [];
    let totalCost = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let lastModel: LLMModel = preset.primary;
    let lastProvider = "";
    let lastLatency = 0;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      const { systemPrompt, userPrompt } = this.buildPrompt(input, context, lastErrors);
      const request: LLMRequest = {
        model: preset.primary,
        systemPrompt,
        userPrompt,
        temperature: 0.3,
        jsonMode: true
      };

      try {
        const response = await llm.generate(request, preset);
        totalCost += response.usage.estimatedCostUSD;
        totalInputTokens += response.usage.inputTokens;
        totalOutputTokens += response.usage.outputTokens;
        lastModel = response.model;
        lastProvider = response.provider;
        lastLatency = response.latencyMs;

        let parsed: unknown;
        try {
          parsed = response.parsedJson ?? JSON.parse(response.content);
        } catch {
          lastErrors = [{ code: "JSON_PARSE_ERROR", message: "Resposta nao e JSON valido", severity: "ERROR" }];
          continue;
        }

        const schemaResult = this.config.schema.safeParse(parsed);
        if (!schemaResult.success) {
          lastErrors = schemaResult.error.issues.map((issue) => ({
            code: "SCHEMA_VALIDATION",
            message: `${issue.path.join(".")}: ${issue.message}`,
            severity: "ERROR" as const,
            field: issue.path.join(".")
          }));
          continue;
        }

        const data = schemaResult.data;
        if (this.config.validator) {
          const customErrors = this.config.validator(data);
          const blockingErrors = customErrors.filter((error) => error.severity === "ERROR");
          if (blockingErrors.length > 0) {
            lastErrors = customErrors;
            continue;
          }
        }

        await logAgentCall({
          agentName: this.config.name,
          model: response.model,
          provider: response.provider,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          costUSD: totalCost,
          latencyMs: response.latencyMs,
          status: "SUCCESS",
          documentType: context.documentType,
          documentId: context.documentId,
          companyId: context.companyId,
          userId: context.userId
        });

        return {
          success: true,
          data,
          metadata: {
            agentName: this.config.name,
            model: response.model,
            provider: response.provider,
            latencyMs: lastLatency,
            costUSD: totalCost,
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            attempts: attempt
          }
        };
      } catch (error) {
        const sanitizedError = sanitizeAgentError(error);
        lastErrors = [{ code: "LLM_ERROR", message: sanitizedError, severity: "ERROR" }];
        await logAgentCall({
          agentName: this.config.name,
          model: lastModel,
          provider: lastProvider || "unknown",
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          costUSD: totalCost,
          latencyMs: lastLatency,
          status: "ERROR",
          errorMessage: sanitizedError,
          documentType: context.documentType,
          documentId: context.documentId,
          companyId: context.companyId,
          userId: context.userId
        });
      }
    }

    return {
      success: false,
      errors: [
        ...lastErrors,
        { code: "MAX_RETRIES", message: `Falhou apos ${maxRetries + 1} tentativas`, severity: "ERROR" }
      ],
      metadata: {
        agentName: this.config.name,
        model: lastModel,
        provider: lastProvider || "unknown",
        latencyMs: lastLatency,
        costUSD: totalCost,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        attempts: maxRetries + 1
      }
    };
  }
}
