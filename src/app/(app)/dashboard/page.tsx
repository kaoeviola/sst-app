import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  ["APR abertas", "0"],
  ["PT em andamento", "0"],
  ["Assinaturas pendentes", "0"],
  ["Itens offline", "0"]
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Visao geral da operacao SST.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
