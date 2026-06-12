import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";

const schema = z.object({
  companyName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (existingUser) {
    return NextResponse.json({ error: "E-mail ja cadastrado." }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const company = await prisma.company.create({
    data: {
      name: parsed.data.companyName,
      users: {
        create: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role: "ADMIN"
        }
      }
    }
  });

  return NextResponse.json({ companyId: company.id }, { status: 201 });
}
