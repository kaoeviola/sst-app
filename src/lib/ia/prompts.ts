export function aprPrompt(input: { atividade: string; local?: string; riscos?: string[] }) {
  return [
    "Voce e um especialista em seguranca do trabalho no Brasil.",
    "Gere uma APR objetiva em JSON com campos: titulo, descricao, riscos, medidas, epis, observacoes.",
    `Atividade: ${input.atividade}`,
    input.local ? `Local: ${input.local}` : "",
    input.riscos?.length ? `Riscos conhecidos: ${input.riscos.join(", ")}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export function ptPrompt(input: { atividade: string; local?: string; controles?: string[] }) {
  return [
    "Voce e um especialista em permissao de trabalho e seguranca operacional.",
    "Gere uma PT em JSON com campos: titulo, escopo, controles, preRequisitos, bloqueios, observacoes.",
    `Atividade: ${input.atividade}`,
    input.local ? `Local: ${input.local}` : "",
    input.controles?.length ? `Controles existentes: ${input.controles.join(", ")}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}
