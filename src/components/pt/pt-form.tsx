"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveOfflineDraft } from "@/lib/offline/sync";

const schema = z.object({
  obraId: z.string().min(1),
  titulo: z.string().min(3),
  escopo: z.string().min(10)
});

type FormValues = z.infer<typeof schema>;

export function PtForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      obraId: "",
      titulo: "",
      escopo: ""
    }
  });

  async function onSubmit(values: FormValues) {
    const response = await fetch("/api/pt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      await saveOfflineDraft("pt", values);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="obraId">ID da obra</Label>
        <Input id="obraId" {...form.register("obraId")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="titulo">Titulo</Label>
        <Input id="titulo" {...form.register("titulo")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="escopo">Escopo</Label>
        <Input id="escopo" {...form.register("escopo")} />
      </div>
      <Button type="submit">Salvar PT</Button>
    </form>
  );
}
