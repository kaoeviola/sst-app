"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DocumentType = "APR" | "PT" | "APR_PT";
type ChipKey = "risks" | "epis" | "epcs";

type BasicData = {
  servicoExecutar: string;
  empresa: string;
  contexto: "OBRA" | "ATIVIDADE";
  obraCliente: string;
  enderecoObra: string;
  localExecucao: string;
  setor: string;
  responsavelArea: string;
  responsavelExecucao: string;
  dataPrevista: string;
  horaInicio: string;
  horaFim: string;
  revisao: string;
};

type Procedure = {
  id: string;
  nome: string;
  atividade: string;
  risco: string;
  medidas: string;
};

type ReviewData = {
  procedures: Procedure[];
  risks: string[];
  epis: string[];
  epcs: string[];
  measures: string[];
  observations: string;
  sesmt: string;
  colaboradores: string;
  signers: Array<{ role: string; name: string }>;
  status: "Rascunho" | "Em revisao" | "Aprovado";
};

const SIGNER_ROLES = [
  "Tecnico de seguranca",
  "Supervisor / responsavel",
  "Engenheiro de seguranca",
  "Responsavel pela execucao"
];

const documentOptions: Array<{ value: DocumentType; title: string; subtitle: string; description: string }> = [
  {
    value: "APR",
    title: "APR",
    subtitle: "Analise Preliminar de Risco",
    description: "Identifica riscos, EPIs, EPCs e medidas preventivas antes da atividade."
  },
  {
    value: "PT",
    title: "PT",
    subtitle: "Permissao de Trabalho",
    description: "Registra responsaveis, condicoes de liberacao e controles para executar."
  },
  {
    value: "APR_PT",
    title: "APR + PT",
    subtitle: "Analise e permissao juntas",
    description: "Monta um rascunho integrado para revisar riscos e liberar o trabalho."
  }
];

const chipSuggestions: Record<ChipKey, string[]> = {
  risks: [
    "Queda de nivel",
    "Choque eletrico",
    "Queda de materiais",
    "Ruido",
    "Projecao de particulas",
    "Piso escorregadio",
    "Poeira/fumos",
    "Gases/vapores",
    "Corte/perfuracao",
    "Condicoes climaticas",
    "Falta de treinamento",
    "Outros"
  ],
  epis: [
    "Capacete com jugular",
    "Oculos de seguranca",
    "Protetor auricular",
    "Botina de seguranca",
    "Luvas adequadas",
    "Cinto paraquedista",
    "Talabarte com absorvedor de energia",
    "Trava-quedas",
    "Mascara/PFF2",
    "Uniforme/camisa manga longa",
    "Outros"
  ],
  epcs: [
    "Isolamento da area",
    "Fita zebrada/cones",
    "Guarda-corpo",
    "Linha de vida",
    "Sistema de ancoragem",
    "Ventilacao/exaustao",
    "Sinalizacao",
    "Bloqueio de energias",
    "Protecao de maquinas",
    "Extintor/equipamento de combate a incendio",
    "Outros"
  ]
};

const emptyBasicData: BasicData = {
  servicoExecutar: "",
  empresa: "",
  contexto: "OBRA",
  obraCliente: "",
  enderecoObra: "",
  localExecucao: "",
  setor: "",
  responsavelArea: "",
  responsavelExecucao: "",
  dataPrevista: "",
  horaInicio: "",
  horaFim: "",
  revisao: "00"
};

const emptyReview: ReviewData = {
  procedures: [],
  risks: [],
  epis: [],
  epcs: [],
  measures: [],
  observations: "",
  sesmt: "",
  colaboradores: "",
  signers: [],
  status: "Rascunho"
};

function labelForType(type: DocumentType | null) {
  if (!type) return "Documento";
  return type === "APR_PT" ? "APR + PT" : type;
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function newProcedure(index: number): Procedure {
  return {
    id: `${Date.now()}-${index}`,
    nome: `Procedimento ${index + 1}`,
    atividade: "",
    risco: "",
    medidas: ""
  };
}

export function DocumentGenerator() {
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [basicData, setBasicData] = useState<BasicData>(emptyBasicData);
  const [basicConfirmed, setBasicConfirmed] = useState(false);
  const [basicError, setBasicError] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [draftGenerated, setDraftGenerated] = useState(false);
  const [review, setReview] = useState<ReviewData>(emptyReview);
  const [customChip, setCustomChip] = useState<Record<ChipKey, string>>({ risks: "", epis: "", epcs: "" });
  const [newMeasure, setNewMeasure] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("Escolha o documento para iniciar o fluxo guiado.");
  const [signerDraft, setSignerDraft] = useState({ role: SIGNER_ROLES[0], name: "" });

  const hasMinimumBasicData = Boolean(
    basicData.servicoExecutar && basicData.empresa && basicData.localExecucao
      && (basicData.contexto === "ATIVIDADE" || basicData.obraCliente)
  );

  const previewTitle = useMemo(() => {
    if (documentType === "APR") return "APR - Analise Preliminar de Risco";
    if (documentType === "PT") return "PT - Permissao de Trabalho";
    if (documentType === "APR_PT") return "APR + PT - Rascunho tecnico";
    return "Documento de seguranca";
  }, [documentType]);

  function updateBasicData(field: keyof BasicData, value: string) {
    setBasicData((current) => ({ ...current, [field]: value }));
    setBasicConfirmed(false);
  }

  function confirmBasicData() {
    if (!hasMinimumBasicData) {
      setBasicError("Preencha empresa, obra/cliente, local e os dois responsaveis para continuar.");
      return;
    }

    setBasicError("");
    setBasicConfirmed(true);
    setMessage("Dados confirmados. Agora descreva a atividade para gerar o rascunho.");
  }

  function applyLocalDraft() {
    const text = activityDescription.toLowerCase();
    const height = text.includes("altura") || text.includes("telhado") || text.includes("escada") || text.includes("calha");
    const electricity = text.includes("eletric") || text.includes("energia") || text.includes("painel");
    const hotWork = text.includes("solda") || text.includes("corte") || text.includes("quente");

    const procedures: Procedure[] = [
      {
        id: "preparacao-area",
        nome: "Preparacao da area",
        atividade: "Isolar, sinalizar e organizar a area de trabalho antes do inicio.",
        risco: "Acesso de pessoas nao autorizadas e interferencia com outras atividades.",
        medidas: "Utilizar fita zebrada, cones, comunicacao previa e liberar apenas equipe autorizada."
      },
      {
        id: "checagem-controles",
        nome: "Conferencia de EPIs e controles",
        atividade: "Verificar EPIs, EPCs, ferramentas e condicoes do local.",
        risco: "Inicio da atividade sem protecao adequada.",
        medidas: "Conferir checklist de EPIs, pontos de ancoragem, bloqueios e condicoes ambientais."
      },
      {
        id: "execucao-monitorada",
        nome: "Execucao monitorada",
        atividade: activityDescription || "Executar a atividade conforme procedimento combinado.",
        risco: height ? "Queda de nivel e queda de materiais." : "Exposicao aos riscos da atividade.",
        medidas: "Manter comunicacao, supervisao e interrupcao imediata em condicao insegura."
      }
    ];

    setReview({
      procedures,
      risks: unique([
        ...(height ? ["Queda de nivel", "Queda de materiais", "Condicoes climaticas"] : []),
        ...(electricity ? ["Choque eletrico"] : []),
        ...(hotWork ? ["Projecao de particulas"] : []),
        "Falta de treinamento"
      ]),
      epis: unique([
        "Capacete com jugular",
        "Oculos de seguranca",
        "Botina de seguranca",
        "Luvas adequadas",
        ...(height ? ["Cinto paraquedista", "Talabarte com absorvedor de energia", "Trava-quedas"] : []),
        ...(hotWork ? ["Protetor auricular"] : [])
      ]),
      epcs: unique([
        "Isolamento da area",
        "Sinalizacao",
        ...(height ? ["Linha de vida", "Sistema de ancoragem"] : []),
        ...(electricity ? ["Bloqueio de energias"] : []),
        ...(hotWork ? ["Extintor/equipamento de combate a incendio"] : [])
      ]),
      measures: unique([
        "Verificar condicoes do local antes do inicio",
        "Isolar e sinalizar a area",
        "Conferir EPIs antes da atividade",
        "Garantir trabalhador treinado/autorizado",
        ...(height ? ["Nao iniciar em condicao climatica insegura", "Manter ferramentas amarradas em altura"] : []),
        ...(electricity ? ["Bloquear energias perigosas"] : []),
        "Manter APR/PT visivel no local"
      ]),
      observations: "Documento gerado como rascunho tecnico. Revisao humana obrigatoria antes do uso em campo.",
      sesmt: "",
      colaboradores: "",
      signers: [],
      status: "Rascunho"
    });
  }

  async function generateDraft() {
    if (!activityDescription.trim()) {
      setMessage("Descreva a atividade antes de gerar o rascunho.");
      return;
    }

    setIsGenerating(true);
    setMessage("Gerando sugestoes...");

    try {
      if (documentType !== "PT") {
        const response = await fetch("/api/ia/gerar-apr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            descricaoAtividade: activityDescription,
            local: basicData.localExecucao,
            contextoEmpresa: basicData.empresa
          })
        });

        if (response.ok) {
          const payload = await response.json();
          const apr = payload.apr;
          if (apr) {
            setReview((current) => ({
              ...current,
              procedures:
                apr.etapas?.map((step: { descricao: string; riscos?: string[]; medidasPreventivas?: string[] }, index: number) => ({
                  id: `ia-${index}`,
                  nome: `Procedimento ${index + 1}`,
                  atividade: step.descricao,
                  risco: step.riscos?.join("; ") ?? "",
                  medidas: step.medidasPreventivas?.join("; ") ?? ""
                })) ?? current.procedures,
              risks: unique([...(apr.riscosGerais?.map((risk: { descricao: string }) => risk.descricao) ?? []), ...current.risks]),
              epis: unique([...(apr.episNecessarios ?? []), ...current.epis]),
              epcs: unique([...(apr.epcsNecessarios ?? []), ...current.epcs]),
              measures: unique([
                ...(apr.etapas?.flatMap((step: { medidasPreventivas: string[] }) => step.medidasPreventivas) ?? []),
                ...current.measures
              ]),
              observations: apr.observacoes ?? current.observations
            }));
            setDraftGenerated(true);
            setMessage("Rascunho gerado. Revise cada bloco antes de usar em campo.");
            return;
          }
        }
      }

      applyLocalDraft();
      setDraftGenerated(true);
      setMessage("Rascunho local preparado para revisao.");
    } catch {
      applyLocalDraft();
      setDraftGenerated(true);
      setMessage("A IA nao respondeu agora. Usei sugestoes locais para manter o fluxo.");
    } finally {
      setIsGenerating(false);
    }
  }

  function updateProcedure(id: string, field: keyof Omit<Procedure, "id">, value: string) {
    setReview((current) => ({
      ...current,
      procedures: current.procedures.map((procedure) => (procedure.id === id ? { ...procedure, [field]: value } : procedure))
    }));
  }

  function addProcedure() {
    setReview((current) => ({ ...current, procedures: [...current.procedures, newProcedure(current.procedures.length)] }));
  }

  function removeProcedure(id: string) {
    setReview((current) => ({ ...current, procedures: current.procedures.filter((procedure) => procedure.id !== id) }));
  }

  function toggleChip(key: ChipKey, value: string) {
    setReview((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value]
    }));
  }

  function addCustomChip(key: ChipKey) {
    const value = customChip[key].trim();
    if (!value) return;

    setReview((current) => ({ ...current, [key]: unique([...current[key], value]) }));
    setCustomChip((current) => ({ ...current, [key]: "" }));
  }

  function addMeasure() {
    const value = newMeasure.trim();
    if (!value) return;

    setReview((current) => ({ ...current, measures: unique([...current.measures, value]) }));
    setNewMeasure("");
  }

  function addSigner() {
    const name = signerDraft.name.trim();
    if (!name) return;

    setReview((current) => ({
      ...current,
      signers: [...current.signers, { role: signerDraft.role, name }]
    }));
    setSignerDraft((current) => ({ ...current, name: "" }));
  }

  function removeSigner(index: number) {
    setReview((current) => ({
      ...current,
      signers: current.signers.filter((_, signerIndex) => signerIndex !== index)
    }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-background p-6">
        <p className="text-sm font-medium text-primary">Documentos de seguranca</p>
        <h1 className="mt-2 text-3xl font-semibold">Gerar APR/PT</h1>
               <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
           Monte o documento por partes: cabeçalho, descrição da atividade, conteúdo técnico e assinaturas.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {documentOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setDocumentType(option.value);
              setMessage("Documento selecionado. Confirme os dados da empresa e obra para continuar.");
            }}
            className={cn(
              "rounded-lg border bg-background p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm",
              documentType === option.value ? "border-primary bg-primary/10 ring-2 ring-primary/20" : ""
            )}
          >
            <div className="text-2xl font-semibold">{option.title}</div>
            <div className="mt-1 font-medium">{option.subtitle}</div>
            <p className="mt-3 text-sm text-muted-foreground">{option.description}</p>
          </button>
        ))}
      </section>

      {documentType && (
        <section className="animate-in grid gap-6 duration-500 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="space-y-5">
            <ProgressiveCard title="Cabeçalho e contexto" description="Esses dados aparecem no topo do documento. Informe os dados da obra somente quando a atividade acontecer em uma obra.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Empresa" value={basicData.empresa} onChange={(value) => updateBasicData("empresa", value)} />
                <Field label="Serviço a executar" value={basicData.servicoExecutar} onChange={(value) => updateBasicData("servicoExecutar", value)} />
                <div className="md:col-span-2">
                  <Label>Contexto do trabalho</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border bg-muted/30 p-1">
                    {(["OBRA", "ATIVIDADE"] as const).map((contexto) => (
                      <button
                        key={contexto}
                        type="button"
                        onClick={() => updateBasicData("contexto", contexto)}
                        className={cn(
                          "rounded px-3 py-2 text-sm transition-colors",
                          basicData.contexto === contexto ? "bg-background font-medium text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {contexto === "OBRA" ? "Em uma obra" : "Outra atividade"}
                      </button>
                    ))}
                  </div>
                </div>
                {basicData.contexto === "OBRA" && <Field label="Nome da obra / cliente" value={basicData.obraCliente} onChange={(value) => updateBasicData("obraCliente", value)} />}
                {basicData.contexto === "OBRA" && <Field label="Endereco da obra" value={basicData.enderecoObra} onChange={(value) => updateBasicData("enderecoObra", value)} />}
                <Field label={basicData.contexto === "OBRA" ? "Local / pavimento" : "Local de execucao"} value={basicData.localExecucao} onChange={(value) => updateBasicData("localExecucao", value)} />
                <Field label="Setor, se aplicavel" value={basicData.setor} onChange={(value) => updateBasicData("setor", value)} />
                <Field label="Data prevista" type="date" value={basicData.dataPrevista} onChange={(value) => updateBasicData("dataPrevista", value)} />
                <Field label="Hora inicio" type="time" value={basicData.horaInicio} onChange={(value) => updateBasicData("horaInicio", value)} />
                <Field label="Hora fim" type="time" value={basicData.horaFim} onChange={(value) => updateBasicData("horaFim", value)} />
                <Field label="Revisao" value={basicData.revisao} onChange={(value) => updateBasicData("revisao", value)} />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Número da APR e número de páginas serão gerados automaticamente na emissão do PDF.</p>
              {basicError && <p className="mt-3 text-sm text-destructive">{basicError}</p>}
              <div className="mt-4">
                <Button type="button" onClick={confirmBasicData}>
                  Confirmar dados
                </Button>
              </div>
            </ProgressiveCard>

            {basicConfirmed && (
              <ProgressiveCard title="Descricao da atividade" description="Escreva como se estivesse explicando para outro tecnico o que sera feito.">
                <Label htmlFor="activityDescription">Descreva a atividade</Label>
                <textarea
                  id="activityDescription"
                  value={activityDescription}
                  onChange={(event) => setActivityDescription(event.target.value)}
                  placeholder="Ex: Limpeza de calhas em altura no galpao B, com uso de escada extensiva, cinto paraquedista e isolamento da area."
                  className="mt-2 min-h-40 w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  A IA vai usar essa descricao para sugerir riscos, EPIs, procedimentos e medidas preventivas.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button type="button" onClick={generateDraft} disabled={isGenerating}>
                    {isGenerating ? "Gerando..." : "Gerar rascunho com IA"}
                  </Button>
                  <span className="text-sm text-muted-foreground">{message}</span>
                </div>
              </ProgressiveCard>
            )}

            {draftGenerated && (
              <>
                <ProgressiveCard title="Procedimentos / etapas da atividade" description="Edite as etapas sugeridas ou adicione novas.">
                  <div className="space-y-3">
                    {review.procedures.map((procedure, index) => (
                      <div key={procedure.id} className="rounded-lg border bg-muted/30 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="font-medium">Procedimento {index + 1}</p>
                          <button type="button" onClick={() => removeProcedure(procedure.id)} className="text-sm text-muted-foreground hover:text-destructive">
                            Remover
                          </button>
                        </div>
                        <div className="grid gap-3">
                          <Input value={procedure.nome} onChange={(event) => updateProcedure(procedure.id, "nome", event.target.value)} />
                          <InlineArea value={procedure.atividade} onChange={(value) => updateProcedure(procedure.id, "atividade", value)} placeholder="Atividade da etapa" />
                          <InlineArea value={procedure.risco} onChange={(value) => updateProcedure(procedure.id, "risco", value)} placeholder="Risco potencial" />
                          <InlineArea value={procedure.medidas} onChange={(value) => updateProcedure(procedure.id, "medidas", value)} placeholder="Medidas preventivas" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" onClick={addProcedure} className="mt-4">
                    Adicionar novo procedimento
                  </Button>
                </ProgressiveCard>

                <ProgressiveCard title="Riscos, EPIs e EPCs" description="Marque, remova ou adicione itens customizados.">
                  <div className="space-y-5">
                    <ChipEditor title="Riscos" itemKey="risks" selected={review.risks} customChip={customChip} setCustomChip={setCustomChip} onToggle={toggleChip} onAdd={addCustomChip} />
                    <ChipEditor title="EPIs" itemKey="epis" selected={review.epis} customChip={customChip} setCustomChip={setCustomChip} onToggle={toggleChip} onAdd={addCustomChip} />
                    <ChipEditor title="EPCs" itemKey="epcs" selected={review.epcs} customChip={customChip} setCustomChip={setCustomChip} onToggle={toggleChip} onAdd={addCustomChip} />
                  </div>
                </ProgressiveCard>

                <ProgressiveCard title="Medidas preventivas e observacoes" description="Revise as medidas antes de encaminhar para aprovacao.">
                  <div className="space-y-2">
                    {review.measures.map((measure) => (
                      <div key={measure} className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        <span>{measure}</span>
                        <button
                          type="button"
                          onClick={() => setReview((current) => ({ ...current, measures: current.measures.filter((item) => item !== measure) }))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input value={newMeasure} onChange={(event) => setNewMeasure(event.target.value)} placeholder="Adicionar medida preventiva" />
                    <Button type="button" variant="outline" onClick={addMeasure}>
                      Adicionar
                    </Button>
                  </div>
                  <Label htmlFor="observations" className="mt-4 block">Observacoes</Label>
                  <InlineArea
                    id="observations"
                    value={review.observations}
                    onChange={(value) => setReview((current) => ({ ...current, observations: value }))}
                    placeholder="Observacoes gerais do rascunho"
                  />
                </ProgressiveCard>

                <ProgressiveCard title="Responsaveis e assinaturas" description="Separe a funcao de quem assina e selecione uma pessoa cadastrada ou adicione um nome rapidamente.">
                  <div className="space-y-3">
                    {review.signers.map((signer, index) => (
                      <div key={`${signer.role}-${index}`} className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-3 text-sm">
                        <div>
                          <p className="font-medium">{signer.name}</p>
                          <p className="text-xs text-muted-foreground">{signer.role}</p>
                        </div>
                        <button type="button" onClick={() => removeSigner(index)} className="text-sm text-muted-foreground hover:text-destructive">Remover</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto]">
                    <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={signerDraft.role} onChange={(event) => setSignerDraft((current) => ({ ...current, role: event.target.value }))}>
                      {SIGNER_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <Input value={signerDraft.name} onChange={(event) => setSignerDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nome da pessoa que vai assinar" />
                    <Button type="button" variant="outline" onClick={addSigner}>Adicionar</Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">A assinatura e o envio para assinatura serao configurados na proxima etapa.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["Rascunho", "Em revisao", "Aprovado"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setReview((current) => ({ ...current, status }))}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition-colors",
                          review.status === status ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button type="button" disabled title="Salvar rascunho sera implementado depois">
                      Salvar rascunho
                    </Button>
                    <Button type="button" variant="outline" disabled title="Exportacao em PDF sera implementada depois">
                      Gerar PDF
                    </Button>
                    <Button type="button" variant="secondary" disabled title="Fluxo de revisao sera implementado depois">
                      Enviar para revisao
                    </Button>
                  </div>
                </ProgressiveCard>
              </>
            )}
          </div>

          <DocumentPreview
            title={previewTitle}
            documentType={documentType}
            basicData={basicData}
            activityDescription={activityDescription}
            review={review}
          />
        </section>
      )}
    </div>
  );
}

function ProgressiveCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2" />
    </div>
  );
}

function InlineArea({ value, onChange, placeholder, id }: { value: string; onChange: (value: string) => void; placeholder?: string; id?: string }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function ChipEditor({
  title,
  itemKey,
  selected,
  customChip,
  setCustomChip,
  onToggle,
  onAdd
}: {
  title: string;
  itemKey: ChipKey;
  selected: string[];
  customChip: Record<ChipKey, string>;
  setCustomChip: Dispatch<SetStateAction<Record<ChipKey, string>>>;
  onToggle: (key: ChipKey, value: string) => void;
  onAdd: (key: ChipKey) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <div className="flex flex-wrap gap-2">
        {chipSuggestions[itemKey].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(itemKey, item)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              selected.includes(item) ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={customChip[itemKey]}
          onChange={(event) => setCustomChip((current) => ({ ...current, [itemKey]: event.target.value }))}
          placeholder={`Adicionar ${title.toLowerCase()}`}
        />
        <Button type="button" variant="outline" onClick={() => onAdd(itemKey)}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}

function DocumentPreview({
  title,
  documentType,
  basicData,
  activityDescription,
  review
}: {
  title: string;
  documentType: DocumentType | null;
  basicData: BasicData;
  activityDescription: string;
  review: ReviewData;
}) {
  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="border-b pb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{labelForType(documentType)} - Rascunho tecnico</p>
          <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
          <p className="mt-2 text-xs text-muted-foreground">Documento gerado como rascunho tecnico. Revise e aprove antes do uso em campo.</p>
        </div>
        <PreviewSection title="Dados da empresa/obra">
           <PreviewPair label="Empresa" value={basicData.empresa} />
           <PreviewPair label="Servico" value={basicData.servicoExecutar} />
           {basicData.contexto === "OBRA" && <PreviewPair label="Obra / Cliente" value={basicData.obraCliente} />}
           {basicData.contexto === "OBRA" && <PreviewPair label="Endereco" value={basicData.enderecoObra} />}
          <PreviewPair label="Local" value={basicData.localExecucao} />
          <PreviewPair label="Setor" value={basicData.setor} />
          <PreviewPair label="Data e horario" value={`${basicData.dataPrevista || "-"} ${basicData.horaInicio || ""} - ${basicData.horaFim || ""}`} />
        </PreviewSection>
        <PreviewSection title="Descricao da atividade">
          <p className="text-sm text-muted-foreground">{activityDescription || "A descricao aparecera aqui conforme voce preencher."}</p>
        </PreviewSection>
        <PreviewSection title="Procedimentos">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {(review.procedures.length ? review.procedures : [newProcedure(0)]).map((procedure) => (
              <li key={procedure.id}>
                <span className="font-medium text-foreground">{procedure.nome}</span>
                <div>{procedure.atividade || "Atividade da etapa"}</div>
                <div>Risco: {procedure.risco || "A definir"}</div>
                <div>Medidas: {procedure.medidas || "A definir"}</div>
              </li>
            ))}
          </ol>
        </PreviewSection>
        <PreviewList title="Riscos" items={review.risks} />
        <PreviewList title="EPIs" items={review.epis} />
        <PreviewList title="EPCs" items={review.epcs} />
        <PreviewList title="Medidas preventivas" items={review.measures} />
        <PreviewSection title="Responsaveis e aprovacao">
           {review.signers.length > 0 ? review.signers.map((signer, index) => <PreviewPair key={`${signer.role}-${index}`} label={signer.role} value={signer.name} />) : <PreviewPair label="Assinaturas" value="A definir" />}
          <div className="mt-2 rounded-md bg-muted px-3 py-2 text-sm">Status: {review.status}</div>
        </PreviewSection>
      </div>
    </aside>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b py-4 last:border-b-0">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function PreviewPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value || "-"}</span>
    </div>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <PreviewSection title={title}>
      <div className="flex flex-wrap gap-2">
        {(items.length ? items : ["A definir"]).map((item) => (
          <span key={item} className="rounded-full bg-muted px-2.5 py-1 text-xs">
            {item}
          </span>
        ))}
      </div>
    </PreviewSection>
  );
}
