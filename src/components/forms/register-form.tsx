"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  companyName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "",
      name: "",
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      setError("Nao foi possivel criar a conta.");
      return;
    }

    router.push("/login");
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="companyName">Empresa</Label>
        <Input id="companyName" {...form.register("companyName")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" autoComplete="name" {...form.register("name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        Criar conta
      </Button>
    </form>
  );
}
