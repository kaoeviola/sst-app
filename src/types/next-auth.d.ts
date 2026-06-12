import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    companyId: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      companyId: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    companyId: string;
  }
}
