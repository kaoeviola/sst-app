import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("admin123", 12);

  const company = await prisma.company.upsert({
    where: { cnpj: "00000000000000" },
    update: {},
    create: {
      name: "Empresa Demo",
      cnpj: "00000000000000"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "Admin Demo",
      passwordHash,
      role: "ADMIN",
      companyId: company.id
    }
  });

  console.log("Seed concluido:");
  console.log("  Empresa:", company.name, "(id:", company.id, ")");
  console.log("  Usuario:", user.email, "/ senha: admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
