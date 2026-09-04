import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { mobileCorsOptions, withMobileCors } from "@/lib/mobile/cors";
import { issueMobileTokens, verifyMobileToken } from "@/lib/mobile/auth";
import { publicMobileUser } from "@/lib/mobile/user";

const schema = z.object({ refreshToken: z.string().min(1) });

export function OPTIONS() {
  return mobileCorsOptions();
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return withMobileCors(NextResponse.json({ error: "Refresh token ausente." }, { status: 400 }));
  }

  try {
    const token = await verifyMobileToken(parsed.data.refreshToken, "refresh");
    const user = await prisma.user.findUnique({ where: { id: token.sub } });

    if (!user || user.companyId !== token.companyId) {
      return withMobileCors(NextResponse.json({ error: "Sessao invalida." }, { status: 401 }));
    }

    const publicUser = publicMobileUser(user);
    const tokens = await issueMobileTokens(publicUser);
    return withMobileCors(NextResponse.json({ ...tokens, user: publicUser }));
  } catch {
    return withMobileCors(NextResponse.json({ error: "Refresh token invalido ou expirado." }, { status: 401 }));
  }
}
