import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { mobileCorsOptions, withMobileCors } from "@/lib/mobile/cors";
import { bearerToken, verifyMobileToken } from "@/lib/mobile/auth";
import { publicMobileUser } from "@/lib/mobile/user";

export function OPTIONS() {
  return mobileCorsOptions();
}

export async function GET(request: Request) {
  const token = bearerToken(request);

  if (!token) {
    return withMobileCors(NextResponse.json({ error: "Token ausente." }, { status: 401 }));
  }

  try {
    const claims = await verifyMobileToken(token, "access");
    const user = await prisma.user.findUnique({ where: { id: claims.sub } });

    if (!user || user.companyId !== claims.companyId) {
      return withMobileCors(NextResponse.json({ error: "Sessao invalida." }, { status: 401 }));
    }

    return withMobileCors(NextResponse.json({ user: publicMobileUser(user) }));
  } catch {
    return withMobileCors(NextResponse.json({ error: "Token invalido ou expirado." }, { status: 401 }));
  }
}
