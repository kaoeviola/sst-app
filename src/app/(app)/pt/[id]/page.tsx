import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { dbForCompany } from "@/lib/db";

export default async function PtPage({ params }: Readonly<{ params: { id: string } }>) {
  const session = await auth();
  if (!session) notFound();

  const pt = await dbForCompany(session.user.companyId).pt.findUnique({
    where: { id: params.id },
    include: { obra: true }
  });

  if (!pt) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">{pt.titulo}</h1>
      <p className="text-muted-foreground">{pt.obra.nome}</p>
      <p>{pt.escopo}</p>
    </div>
  );
}
