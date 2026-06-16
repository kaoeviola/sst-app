import { consensus } from "./consensus";
import { route } from "./router";

export { consensus, route };
export { LLM_PRESETS } from "./presets";
export type { LLMModel, LLMProviderName, LLMRequest, LLMResponse } from "./types";
export type { RouteConfig } from "./router";

export const llm = {
  generate: route,
  consensus
};
