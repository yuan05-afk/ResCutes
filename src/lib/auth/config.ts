import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth/auth.config";
import { findAuthUser } from "@/lib/auth/demo-users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      id: "credentials",
      name: "Demo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = findAuthUser(email, password);
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        };
      },
    }),
  ],
});
