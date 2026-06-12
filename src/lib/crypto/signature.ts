import { createHash } from "crypto";

export function createTimestamp() {
  return new Date();
}

export function hashPayload(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function buildSignatureHash(input: {
  companyId: string;
  funcionarioId: string;
  assinaturaSvg: string;
  timestamp: Date;
}) {
  return hashPayload({
    companyId: input.companyId,
    funcionarioId: input.funcionarioId,
    assinaturaSvg: input.assinaturaSvg,
    timestamp: input.timestamp.toISOString()
  });
}
