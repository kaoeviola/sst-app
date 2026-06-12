import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { dbForCompany } from "@/lib/db";

const createAprSchema = z.object({
  obraId: z.string().min(1),
  titulo: z.string().min(3),
  descricao: z.string().min(10),
  riscos: z.array(z.string()).default([]),
  medidas: z.array(z.string()).default([])
});

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const aprs = await dbForCompany(session.user.companyId).apr.findMany({
    include: { obra: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(aprs);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const parsed = createAprSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const apr = await dbForCompany(session.user.companyId).apr.create({
    data: {
      companyId: session.user.companyId,
      obraId: parsed.data.obraId,
      titulo: parsed.data.titulo,
      descricao: parsed.data.descricao,
      riscos: parsed.data.riscos,
      medidas: parsed.data.medidas
    }
  });

  return NextResponse.json(apr, { status: 201 });
}
