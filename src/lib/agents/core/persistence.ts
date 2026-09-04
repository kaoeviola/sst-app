import { prisma } from "../../db";

export async function logAgentCall(data: {
  agentName: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  latencyMs: number;
  status: "SUCCESS" | "ERROR" | "RETRY";
  errorMessage?: string;
  documentType?: "APR" | "PT";
  documentId?: string;
  companyId: string;
  userId?: string;
}) {
  try {
    await prisma.lLMCallLog.create({ data });
  } catch {
    console.warn("Failed to persist LLM call log", {
      agentName: data.agentName,
      status: data.status
    });
  }
}
