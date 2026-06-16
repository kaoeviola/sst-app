export type LLMProviderName = "openai" | "mistral" | "groq" | "nvidia";

export type LLMModel =
  | "openai/gpt-4.1-mini"
  | "openai/gpt-4o-mini"
  | "mistral/mistral-large-latest"
  | "mistral/mistral-small-latest"
  | "groq/llama-3.3-70b-versatile"
  | "groq/llama-3.1-8b-instant"
  | "nvidia/meta-llama-3.1-70b-instruct";

export interface LLMRequest {
  model: LLMModel;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LLMResponse {
  content: string;
  parsedJson?: unknown;
  model: LLMModel;
  provider: LLMProviderName;
  usage: {
    inputTokens: number;
    outputTokens: number;
    estimatedCostUSD: number;
  };
  latencyMs: number;
}

export interface LLMProvider {
  name: LLMProviderName;
  generate(req: LLMRequest): Promise<LLMResponse>;
  isAvailable(): boolean;
}

export class LLMError extends Error {
  provider: LLMProviderName;
  retryable: boolean;
  originalError?: unknown;

  constructor(message: string, provider: LLMProviderName, retryable: boolean, originalError?: unknown) {
    super(message);
    this.name = "LLMError";
    this.provider = provider;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}
