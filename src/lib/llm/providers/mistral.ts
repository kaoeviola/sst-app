import type { LLMProvider, LLMRequest, LLMResponse } from "../types";
import { LLMError } from "../types";
import { calculateCost, parseJsonIfNeeded, providerModel, retryableFromError } from "./base";

export class MistralProvider implements LLMProvider {
  name = "mistral" as const;

  isAvailable(): boolean {
    return Boolean(process.env.MISTRAL_API_KEY);
  }

  async generate(req: LLMRequest): Promise<LLMResponse> {
    const startedAt = Date.now();

    try {
      const { Mistral } = await import("@mistralai/mistralai");
      const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY ?? "" });
      const response = await client.chat.complete({
        model: providerModel(req.model),
        messages: [
          { role: "system", content: req.systemPrompt },
          { role: "user", content: req.userPrompt }
        ],
        temperature: req.temperature,
        maxTokens: req.maxTokens,
        responseFormat: req.jsonMode ? { type: "json_object" } : undefined
      });
      const content = response.choices?.[0]?.message?.content;
      const text = Array.isArray(content) ? content.map((part) => ("text" in part ? part.text : "")).join("") : content ?? "";
      const inputTokens = response.usage?.promptTokens ?? 0;
      const outputTokens = response.usage?.completionTokens ?? 0;

      return {
        content: text,
        parsedJson: parseJsonIfNeeded(text, req.jsonMode),
        model: req.model,
        provider: this.name,
        usage: {
          inputTokens,
          outputTokens,
          estimatedCostUSD: calculateCost(req.model, inputTokens, outputTokens)
        },
        latencyMs: Date.now() - startedAt
      };
    } catch (error) {
      throw new LLMError(`Mistral request failed: ${(error as Error).message}`, this.name, retryableFromError(error), error);
    }
  }
}
