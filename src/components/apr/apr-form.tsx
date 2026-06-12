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
  descricao: z.string().min(10)
});

type FormValues = z.infer<typeof schema>;

export function AprForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      obraId: "",
      titulo: "",
      descricao: ""
    }
  });

  async function onSubmit(values: FormValues) {
    const response = await fetch("/api/apr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      await saveOfflineDraft("apr", values);
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
        <Label htmlFor="descricao">Descricao da atividade</Label>
        <Input id="descricao" {...form.register("descricao")} />
      </div>
      <Button type="submit">Salvar APR</Button>
    </form>
  );
}
