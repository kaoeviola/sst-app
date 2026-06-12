import { auth } from "@/lib/auth";
import { dbForCompany } from "@/lib/db";

export default async function FuncionariosPage() {
  const session = await auth();
  const funcionarios = session
    ? await dbForCompany(session.user.companyId).funcionario.findMany({ orderBy: { nome: "asc" } })
    : [];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Funcionarios</h1>
      <div className="rounded-lg border bg-background">
        {funcionarios.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Nenhum funcionario cadastrado.</p>
        ) : (
          funcionarios.map((funcionario) => (
            <div key={funcionario.id} className="border-b p-4 last:border-b-0">
              <p className="font-medium">{funcionario.nome}</p>
              <p className="text-sm text-muted-foreground">{funcionario.cargo}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
