-- CreateTable
CREATE TABLE "LLMCallLog" (
    "id" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "costUSD" DOUBLE PRECISION NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "documentType" TEXT,
    "documentId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "LLMCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LLMCallLog_companyId_createdAt_idx" ON "LLMCallLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "LLMCallLog_agentName_status_idx" ON "LLMCallLog"("agentName", "status");

-- AddForeignKey
ALTER TABLE "LLMCallLog" ADD CONSTRAINT "LLMCallLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LLMCallLog" ADD CONSTRAINT "LLMCallLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
