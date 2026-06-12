import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { dbForCompany } from "@/lib/db";

const schema = z.object({
  type: z.enum(["apr", "pt", "assinatura"]),
  payload: z.unknown(),
  createdAt: z.string()
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

  const event = await dbForCompany(session.user.companyId).syncEvent.create({
    data: {
      companyId: session.user.companyId,
      entity: parsed.data.type,
      action: "UPSERT_FROM_OFFLINE",
      payload: parsed.data as Prisma.InputJsonValue
    }
  });

  return NextResponse.json(event, { status: 201 });
}
