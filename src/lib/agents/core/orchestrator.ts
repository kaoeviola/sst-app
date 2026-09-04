export interface OrchestrationStep<TIn, TOut> {
  agent: import("./base-agent").BaseAgent<TIn, TOut>;
  transformInput?: (previousOutputs: unknown[]) => TIn;
}

export class AgentChain {
  constructor(public steps: OrchestrationStep<unknown, unknown>[]) {}
}
