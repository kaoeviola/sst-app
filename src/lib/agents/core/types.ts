import type { ZodSchema } from "zod";

import type { LLM_PRESETS } from "../../llm/presets";

export interface AgentContext {
  companyId: string;
  userId: string;
  documentType?: "APR" | "PT";
  documentId?: string;
  attempt?: number;
}

export interface AgentResult<T> {
  success: boolean;
  data?: T;
  errors?: AgentError[];
  metadata: {
    agentName: string;
    model: string;
    provider: string;
    latencyMs: number;
    costUSD: number;
    inputTokens: number;
    outputTokens: number;
    attempts: number;
  };
}

export interface AgentError {
  code: string;
  message: string;
  severity: "ERROR" | "WARNING";
  field?: string;
}

export interface AgentConfig<TInput, TOutput> {
  name: string;
  preset: keyof typeof LLM_PRESETS;
  maxRetries?: number;
  validator?: (output: TOutput) => AgentError[];
  schema: ZodSchema<TOutput>;
}
