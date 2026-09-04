import Link from "next/link";

import { auth } from "@/lib/auth";

const navItems = [
  ["Dashboard", "/dashboard"],
  ["Obras", "/obras"],
  ["Funcionarios", "/funcionarios"],
  ["Atividades", "/atividades"],
  ["Gerar APR/PT", "/gerar-apr-pt"],
  ["APR", "/apr/novo"],
  ["PT", "/pt/novo"],
  ["Assinaturas", "/assinaturas"]
];

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/dashboard" className="text-lg font-semibold">
            SST
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-foreground">
                {label}
              </Link>
            ))}
          </nav>
          <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-8">{children}</section>
    </main>
  );
}
