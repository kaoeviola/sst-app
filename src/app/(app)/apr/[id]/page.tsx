import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { dbForCompany } from "@/lib/db";

export default async function AprPage({ params }: Readonly<{ params: { id: string } }>) {
  const session = await auth();
  if (!session) notFound();

  const apr = await dbForCompany(session.user.companyId).apr.findUnique({
    where: { id: params.id },
    include: { obra: true }
  });

  if (!apr) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">{apr.titulo}</h1>
      <p className="text-muted-foreground">{apr.obra.nome}</p>
      <p>{apr.descricao}</p>
    </div>
  );
}
