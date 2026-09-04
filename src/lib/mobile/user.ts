import type { User } from "@prisma/client";

export function publicMobileUser(user: Pick<User, "id" | "name" | "email" | "role" | "companyId">) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId
  };
}
