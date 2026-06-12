import Link from "next/link";

import { RegisterForm } from "@/components/forms/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Crie a empresa e o primeiro usuario administrador.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Ja tem conta?{" "}
          <Link href="/login" className="font-medium text-primary">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
