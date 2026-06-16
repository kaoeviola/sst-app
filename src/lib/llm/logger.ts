import type { LLMResponse } from "./types";

export function logLLMCall(response: LLMResponse, context: { agentName: string; documentId?: string }) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      agent: context.agentName,
      model: response.model,
      provider: response.provider,
      tokens: response.usage,
      cost: response.usage.estimatedCostUSD,
      latency: response.latencyMs,
      documentId: context.documentId
    })
  );
}
