import { auth } from "@/lib/auth";
import { dbForCompany } from "@/lib/db";

export default async function AtividadesPage() {
  const session = await auth();
  const atividades = session
    ? await dbForCompany(session.user.companyId).atividade.findMany({ orderBy: { nome: "asc" } })
    : [];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Atividades</h1>
      <div className="rounded-lg border bg-background">
        {atividades.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Nenhuma atividade cadastrada.</p>
        ) : (
          atividades.map((atividade) => (
            <div key={atividade.id} className="border-b p-4 last:border-b-0">
              <p className="font-medium">{atividade.nome}</p>
              <p className="text-sm text-muted-foreground">{atividade.descricao}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
