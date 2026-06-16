import type { LLMModel } from "../types";

export const PRICING_USD_PER_1M_TOKENS: Record<LLMModel, { input: number; output: number }> = {
  "openai/gpt-4.1-mini": { input: 0.4, output: 1.6 },
  "openai/gpt-4o-mini": { input: 0.15, output: 0.6 },
  "mistral/mistral-large-latest": { input: 2.0, output: 6.0 },
  "mistral/mistral-small-latest": { input: 0.2, output: 0.6 },
  "groq/llama-3.3-70b-versatile": { input: 0.59, output: 0.79 },
  "groq/llama-3.1-8b-instant": { input: 0.05, output: 0.08 },
  "nvidia/meta-llama-3.1-70b-instruct": { input: 0.2, output: 0.2 }
};

export function calculateCost(model: LLMModel, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING_USD_PER_1M_TOKENS[model];
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}

export function parseJsonIfNeeded(content: string, jsonMode?: boolean): unknown | undefined {
  if (!jsonMode) {
    return undefined;
  }

  try {
    return JSON.parse(content);
  } catch {
    return undefined;
  }
}

export function retryableFromError(error: unknown): boolean {
  const candidate = error as { status?: number; code?: string; message?: string };
  const status = candidate.status;
  const code = candidate.code?.toLowerCase();
  const message = candidate.message?.toLowerCase() ?? "";

  return (
    status === 429 ||
    Boolean(status && status >= 500) ||
    code === "etimedout" ||
    code === "timeout" ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
}

export function providerModel(model: LLMModel): string {
  if (model === "nvidia/meta-llama-3.1-70b-instruct") {
    return "meta/llama-3.1-70b-instruct";
  }

  return model.split("/").slice(1).join("/");
}
