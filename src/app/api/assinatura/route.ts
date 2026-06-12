import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { buildSignatureHash, createTimestamp } from "@/lib/crypto";
import { dbForCompany } from "@/lib/db";

const schema = z
  .object({
    funcionarioId: z.string().min(1),
    aprId: z.string().optional(),
    ptId: z.string().optional(),
    assinaturaSvg: z.string().min(10)
  })
  .refine((data) => data.aprId || data.ptId, {
    message: "Informe aprId ou ptId."
  });

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const timestamp = createTimestamp();
  const hash = buildSignatureHash({
    companyId: session.user.companyId,
    funcionarioId: parsed.data.funcionarioId,
    assinaturaSvg: parsed.data.assinaturaSvg,
    timestamp
  });

  const assinatura = await dbForCompany(session.user.companyId).assinatura.create({
    data: {
      companyId: session.user.companyId,
      funcionarioId: parsed.data.funcionarioId,
      aprId: parsed.data.aprId,
      ptId: parsed.data.ptId,
      assinaturaSvg: parsed.data.assinaturaSvg,
      timestamp,
      hash
    }
  });

  return NextResponse.json(assinatura, { status: 201 });
}
