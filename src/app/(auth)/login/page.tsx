import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse o SST para gerenciar APR, PT e assinaturas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Ainda nao tem conta?{" "}
          <Link href="/register" className="font-medium text-primary">
            Cadastre-se
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
