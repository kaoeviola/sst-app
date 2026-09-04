import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { mobileCorsOptions, withMobileCors } from "@/lib/mobile/cors";
import { issueMobileTokens } from "@/lib/mobile/auth";
import { publicMobileUser } from "@/lib/mobile/user";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export function OPTIONS() {
  return mobileCorsOptions();
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return withMobileCors(NextResponse.json({ error: "E-mail ou senha invalidos." }, { status: 400 }));
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const validPassword = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;

  if (!user || !validPassword) {
    return withMobileCors(NextResponse.json({ error: "Credenciais invalidas." }, { status: 401 }));
  }

  const tokens = await issueMobileTokens(publicMobileUser(user));

  return withMobileCors(NextResponse.json({ ...tokens, user: publicMobileUser(user) }));
}
