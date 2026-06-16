import Groq from "groq-sdk";

import type { LLMProvider, LLMRequest, LLMResponse } from "../types";
import { LLMError } from "../types";
import { calculateCost, parseJsonIfNeeded, providerModel, retryableFromError } from "./base";

export class GroqProvider implements LLMProvider {
  name = "groq" as const;

  isAvailable(): boolean {
    return Boolean(process.env.GROQ_API_KEY);
  }

  async generate(req: LLMRequest): Promise<LLMResponse> {
    const startedAt = Date.now();
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    try {
      const response = await client.chat.completions.create({
        model: providerModel(req.model),
        messages: [
          { role: "system", content: req.systemPrompt },
          { role: "user", content: req.userPrompt }
        ],
        temperature: req.temperature,
        max_tokens: req.maxTokens,
        response_format: req.jsonMode ? { type: "json_object" } : undefined
      });
      const content = response.choices[0]?.message.content ?? "";
      const inputTokens = response.usage?.prompt_tokens ?? 0;
      const outputTokens = response.usage?.completion_tokens ?? 0;

      return {
        content,
        parsedJson: parseJsonIfNeeded(content, req.jsonMode),
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
      throw new LLMError(`Groq request failed: ${(error as Error).message}`, this.name, retryableFromError(error), error);
    }
  }
}
