import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authConfig = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email }
        });

        if (!user) {
          return null;
        }

        const validPassword = await verifyPassword(parsed.data.password, user.passwordHash);

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        };
      }
    })
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");

      if (isAuthPage) {
        return true;
      }

      return Boolean(auth);
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.companyId = user.companyId;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as Role;
        session.user.companyId = token.companyId as string;
      }

      return session;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
