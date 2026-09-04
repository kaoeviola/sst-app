import type { ZodSchema } from "zod";

import type { AgentError } from "./types";

export function validateWithSchema<T>(schema: ZodSchema<T>, value: unknown): { data?: T; errors: AgentError[] } {
  const result = schema.safeParse(value);

  if (result.success) {
    return { data: result.data, errors: [] };
  }

  return {
    errors: result.error.issues.map((issue) => ({
      code: "SCHEMA_VALIDATION",
      message: `${issue.path.join(".")}: ${issue.message}`,
      severity: "ERROR",
      field: issue.path.join(".")
    }))
  };
}
