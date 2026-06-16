import type { LLMModel, LLMRequest, LLMResponse } from "./types";
import { route } from "./router";

export async function consensus(
  request: LLMRequest,
  models: LLMModel[]
): Promise<{ responses: LLMResponse[]; recommended: LLMResponse }> {
  const responses = await Promise.all(models.map((model) => route({ ...request, model }, { primary: model })));

  // TODO: implementar comparacao semantica na v2.
  return { responses, recommended: responses[0] };
}
