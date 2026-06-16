import { llm } from "../src/lib/llm";
import type { LLMModel } from "../src/lib/llm";
import { existsSync, readFileSync } from "node:fs";

function loadEnvLocal() {
  if (!existsSync(".env.local")) {
    return;
  }

  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    process.env[key] ??= value;
  }
}

loadEnvLocal();

async function testProvider(name: string, model: LLMModel) {
  console.log(`\n=== Testando ${name} (${model}) ===`);

  try {
    const response = await llm.generate(
      {
        model,
        systemPrompt: "Voce e um assistente sucinto.",
        userPrompt: "Diga ola em 5 palavras.",
        temperature: 0.3
      },
      { primary: model }
    );

    console.log("OK:", response.content);
    console.log(
      `Tokens: ${response.usage.inputTokens}+${response.usage.outputTokens}, Custo: $${response.usage.estimatedCostUSD.toFixed(
        6
      )}, Latencia: ${response.latencyMs}ms`
    );
  } catch (error) {
    console.log("ERRO:", (error as Error).message);
  }
}

async function main() {
  await testProvider("OpenAI", "openai/gpt-4.1-mini");
  await testProvider("Mistral", "mistral/mistral-large-latest");
  await testProvider("Groq", "groq/llama-3.3-70b-versatile");
  await testProvider("NVIDIA", "nvidia/meta-llama-3.1-70b-instruct");
}

main();
