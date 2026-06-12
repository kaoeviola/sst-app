import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { dbForCompany } from "@/lib/db";

const createPtSchema = z.object({
  obraId: z.string().min(1),
  titulo: z.string().min(3),
  escopo: z.string().min(10),
  validadeAte: z.string().datetime().optional(),
  controles: z.array(z.string()).default([])
});

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const pts = await dbForCompany(session.user.companyId).pt.findMany({
    include: { obra: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(pts);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const parsed = createPtSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const pt = await dbForCompany(session.user.companyId).pt.create({
    data: {
      companyId: session.user.companyId,
      obraId: parsed.data.obraId,
      titulo: parsed.data.titulo,
      escopo: parsed.data.escopo,
      validadeAte: parsed.data.validadeAte ? new Date(parsed.data.validadeAte) : undefined,
      controles: parsed.data.controles
    }
  });

  return NextResponse.json(pt, { status: 201 });
}
