export const LLM_PRESETS = {
  classificacao: {
    primary: "groq/llama-3.3-70b-versatile" as const,
    fallback: ["openai/gpt-4.1-mini", "mistral/mistral-small-latest"] as const
  },
  geracaoDocumento: {
    primary: "openai/gpt-4.1-mini" as const,
    fallback: ["mistral/mistral-large-latest", "groq/llama-3.3-70b-versatile"] as const
  },
  validacaoTecnica: {
    primary: "mistral/mistral-large-latest" as const,
    fallback: ["openai/gpt-4.1-mini", "nvidia/meta-llama-3.1-70b-instruct"] as const
  },
  enriquecimentoLegal: {
    primary: "nvidia/meta-llama-3.1-70b-instruct" as const,
    fallback: ["openai/gpt-4.1-mini", "mistral/mistral-large-latest"] as const
  }
};
