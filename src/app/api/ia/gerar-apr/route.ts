import { NextResponse } from "next/server";
import { z } from "zod";

import { aprPrompt, openai } from "@/lib/ia";

const schema = z.object({
  atividade: z.string().min(3),
  local: z.string().optional(),
  riscos: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: aprPrompt(parsed.data) }]
  });

  return NextResponse.json(JSON.parse(completion.choices[0]?.message.content ?? "{}"));
}
