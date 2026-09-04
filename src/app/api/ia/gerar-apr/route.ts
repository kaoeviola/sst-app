import { NextResponse } from "next/server";
import { z } from "zod";

import { orquestrarGeracaoAPR } from "@/lib/agents";
import { auth } from "@/lib/auth";
import { mobileAccessClaims } from "@/lib/mobile/auth";
import { mobileCorsOptions, withMobileCors } from "@/lib/mobile/cors";

const BodySchema = z.object({
  descricaoAtividade: z.string().min(5).max(2000),
  local: z.string().min(2).max(300),
  contextoEmpresa: z.string().max(3000).optional(),
  episDisponiveis: z.array(z.string()).max(50).optional()
});

const AVISO_REVISAO_HUMANA = "APR gerada por IA deve ser revisada por responsável técnico antes de uso oficial.";

function publicIssue(issue: { code: string; message: string; severity: "ERROR" | "WARNING"; field?: string }) {
  const sensitiveCodes = new Set(["LLM_ERROR", "JSON_PARSE_ERROR", "MAX_RETRIES"]);

  return {
    code: issue.code,
    message: sensitiveCodes.has(issue.code) ? "Nao foi possivel concluir a geracao do rascunho nesta tentativa." : issue.message,
    severity: issue.severity,
    field: issue.field
  };
}

export async function POST(req: Request) {
  const session = await auth();
  const mobileClaims = session?.user ? null : await mobileAccessClaims(req);

  if (!session?.user && !mobileClaims) {
    return withMobileCors(NextResponse.json({ error: "Nao autenticado" }, { status: 401 }));
  }

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return withMobileCors(NextResponse.json({ error: "Input invalido", issues: parsed.error.issues }, { status: 400 }));
  }

  const result = await orquestrarGeracaoAPR(parsed.data, {
    companyId: session?.user.companyId ?? mobileClaims!.companyId,
    userId: session?.user.id ?? mobileClaims!.sub!
  });

  const errosValidacao = result.problemasRevisaoAutomatizada.map(publicIssue);

  if (!result.success) {
    return withMobileCors(NextResponse.json(
      {
        success: false,
        error: "Nao foi possivel gerar o rascunho da APR.",
        issues: errosValidacao
      },
      { status: 502 }
    ));
  }

  return withMobileCors(NextResponse.json({
    success: true,
    status: "RASCUNHO_IA",
    aviso: AVISO_REVISAO_HUMANA,
    rascunhoGerado: result.rascunhoGerado,
    aprovadoRevisaoAutomatizada: result.aprovadoRevisaoAutomatizada,
    requerRevisaoHumana: result.requerRevisaoHumana,
    analise: result.analise ?? null,
    apr: result.apr ?? null,
    revisaoAutomatizada: {
      aprovado: result.aprovadoRevisaoAutomatizada,
      requerRevisaoHumana: result.requerRevisaoHumana,
      problemas: errosValidacao,
      deterministica: {
        aprovado: result.errosRevisorDeterministico.length === 0,
        erros: result.errosRevisorDeterministico.map(publicIssue)
      },
      llm: result.revisaoLLM ?? null
    },
    errosValidacao
  }));
}

export function OPTIONS() {
  return mobileCorsOptions();
}
