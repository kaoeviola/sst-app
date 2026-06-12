import { auth } from "@/lib/auth";
import { dbForCompany } from "@/lib/db";

export default async function AssinaturasPage() {
  const session = await auth();
  const assinaturas = session
    ? await dbForCompany(session.user.companyId).assinatura.findMany({
        include: { funcionario: true },
        orderBy: { createdAt: "desc" }
      })
    : [];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Assinaturas</h1>
      <div className="rounded-lg border bg-background">
        {assinaturas.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Nenhuma assinatura registrada.</p>
        ) : (
          assinaturas.map((assinatura) => (
            <div key={assinatura.id} className="border-b p-4 last:border-b-0">
              <p className="font-medium">{assinatura.funcionario.nome}</p>
              <p className="text-sm text-muted-foreground">{assinatura.timestamp.toISOString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
