import { prisma } from "@/lib/db/client";

const TENANT_MODELS = new Set([
  "Obra",
  "Funcionario",
  "Atividade",
  "Apr",
  "Pt",
  "Assinatura",
  "SyncEvent"
]);

type TenantArgs = {
  args: {
    where?: Record<string, unknown>;
    data?: Record<string, unknown> | Array<Record<string, unknown>>;
  };
  model?: string;
  operation: string;
  query: (args: TenantArgs["args"]) => Promise<unknown>;
};

export function dbForCompany(companyId: string) {
  return prisma.$extends({
    name: "companyScope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: TenantArgs) {
          if (!model || !TENANT_MODELS.has(model)) {
            return query(args);
          }

          if (operation.startsWith("find") || operation === "count" || operation === "aggregate") {
            args.where = { ...(args.where ?? {}), companyId };
          }

          if (operation === "create") {
            args.data = { ...(args.data ?? {}), companyId };
          }

          if (operation === "createMany" && Array.isArray(args.data)) {
            args.data = args.data.map((item) => ({ ...item, companyId }));
          }

          if (operation.startsWith("update") || operation.startsWith("delete")) {
            args.where = { ...(args.where ?? {}), companyId };
          }

          return query(args);
        }
      }
    } as any
  });
}
