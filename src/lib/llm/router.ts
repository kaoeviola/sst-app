import type { LLMModel, LLMProvider, LLMRequest, LLMResponse } from "./types";
import { LLMError } from "./types";
import { GroqProvider } from "./providers/groq";
import { MistralProvider } from "./providers/mistral";
import { NvidiaProvider } from "./providers/nvidia";
import { OpenAIProvider } from "./providers/openai";
import { logLLMCall } from "./logger";

export type RouteConfig = {
  primary: LLMModel;
  fallback?: readonly LLMModel[];
};

const providers: Record<string, LLMProvider> = {
  openai: new OpenAIProvider(),
  mistral: new MistralProvider(),
  groq: new GroqProvider(),
  nvidia: new NvidiaProvider()
};

function providerForModel(model: LLMModel): LLMProvider {
  const providerName = model.split("/")[0];
  const provider = providers[providerName];

  if (!provider) {
    throw new Error(`No provider configured for model ${model}`);
  }

  return provider;
}

export async function route(request: LLMRequest, config: RouteConfig): Promise<LLMResponse> {
  const models = [config.primary, ...(config.fallback ?? [])];
  const failures: string[] = [];

  for (const model of models) {
    const provider = providerForModel(model);
    const attemptRequest = { ...request, model };

    console.log(JSON.stringify({ timestamp: new Date().toISOString(), event: "llm_attempt", provider: provider.name, model }));

    if (!provider.isAvailable()) {
      failures.push(`${model}: provider unavailable`);
      continue;
    }

    try {
      const response = await provider.generate(attemptRequest);
      logLLMCall(response, { agentName: "llm-router" });
      return response;
    } catch (error) {
      const retryable = error instanceof LLMError ? error.retryable : false;
      failures.push(`${model}: ${(error as Error).message}`);

      if (!retryable) {
        break;
      }
    }
  }

  throw new Error(`All LLM providers failed: ${failures.join(" | ")}`);
}
