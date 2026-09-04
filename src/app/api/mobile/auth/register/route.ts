import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { mobileCorsOptions, withMobileCors } from "@/lib/mobile/cors";
import { issueMobileTokens } from "@/lib/mobile/auth";
import { publicMobileUser } from "@/lib/mobile/user";

const schema = z.object({
  companyName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export function OPTIONS() {
  return mobileCorsOptions();
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return withMobileCors(NextResponse.json({ error: "Dados de cadastro invalidos." }, { status: 400 }));
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (existingUser) {
    return withMobileCors(NextResponse.json({ error: "E-mail ja cadastrado." }, { status: 409 }));
  }

  const user = await prisma.$transaction(async (transaction) => {
    const company = await transaction.company.create({ data: { name: parsed.data.companyName } });

    return transaction.user.create({
      data: {
        companyId: company.id,
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
        role: "ADMIN"
      }
    });
  });

  const publicUser = publicMobileUser(user);
  const tokens = await issueMobileTokens(publicUser);

  return withMobileCors(NextResponse.json({ ...tokens, user: publicUser }, { status: 201 }));
}
