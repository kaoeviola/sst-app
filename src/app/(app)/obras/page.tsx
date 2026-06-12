import { auth } from "@/lib/auth";
import { dbForCompany } from "@/lib/db";

export default async function ObrasPage() {
  const session = await auth();
  const obras = session ? await dbForCompany(session.user.companyId).obra.findMany({ orderBy: { createdAt: "desc" } }) : [];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Obras</h1>
      <div className="rounded-lg border bg-background">
        {obras.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Nenhuma obra cadastrada.</p>
        ) : (
          obras.map((obra) => (
            <div key={obra.id} className="border-b p-4 last:border-b-0">
              <p className="font-medium">{obra.nome}</p>
              <p className="text-sm text-muted-foreground">{obra.endereco}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
