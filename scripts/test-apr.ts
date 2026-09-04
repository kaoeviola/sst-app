import { existsSync, readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

import { orquestrarGeracaoAPR } from "../src/lib/agents";

function ensureExplicitTestRun() {
  if (process.env.NODE_ENV === "production") {
    console.log("Teste APR/LLM bloqueado: nao execute este script em producao.");
    process.exit(1);
  }

  if (process.env.ALLOW_LLM_TESTS !== "true") {
    console.log("Teste APR/LLM nao executado.");
    console.log("Para rodar conscientemente, defina ALLOW_LLM_TESTS=true em ambiente local.");
    process.exit(1);
  }
}

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

async function getDemoContext() {
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@demo.com" },
      select: { id: true, companyId: true }
    });

    if (user) {
      return { companyId: user.companyId, userId: user.id };
    }
  } finally {
    await prisma.$disconnect();
  }

  return { companyId: "test-company-id", userId: "test-user-id" };
}

async function main() {
  loadEnvLocal();
  ensureExplicitTestRun();
  console.log("=== Teste controlado de geracao de APR ===\n");

  const context = await getDemoContext();
  const result = await orquestrarGeracaoAPR(
    {
      descricaoAtividade:
        "Limpeza de calhas no telhado do galpao B, altura aproximada de 15 metros, com uso de extensao e mangueira de agua, em dia ensolarado.",
      local: "Galpao B - Filial Curitiba"
    },
    context
  );

  const quantidadeEtapas = result.apr?.etapas.length ?? 0;
  const quantidadeRiscos = result.apr?.riscosGerais.length ?? 0;
  const quantidadeProblemas = result.problemasRevisaoAutomatizada.length;

  console.log("=== RESUMO TECNICO ===");
  console.log("Success:", result.success);
  console.log("Rascunho gerado:", result.rascunhoGerado);
  console.log("Aprovado revisao automatizada:", result.aprovadoRevisaoAutomatizada);
  console.log("Quantidade de etapas:", quantidadeEtapas);
  console.log("Quantidade de riscos:", quantidadeRiscos);
  console.log("Quantidade de problemas:", quantidadeProblemas);
}

main().catch(() => {
  console.error("Teste APR/LLM falhou com erro interno.");
  process.exit(1);
});
