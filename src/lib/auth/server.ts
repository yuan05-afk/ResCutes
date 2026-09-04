import { createNeonAuth } from "@neondatabase/auth/next/server";

export const neonAuth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    // lax keeps the session cookie on top-level navigations (including new tabs)
    sameSite: "lax",
  },
});
