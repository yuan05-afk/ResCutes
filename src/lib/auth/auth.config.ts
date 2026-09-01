import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/lib/auth/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      roles: Role[];
    };
  }
  interface User {
    roles: Role[];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    roles: Role[];
  }
}

/**
 * Edge-safe auth config (no demo-store import).
 * Used by middleware and merged into the full NextAuth instance.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.roles = user.roles;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as Role[]) ?? [];
      }
      return session;
    },
  },
};
