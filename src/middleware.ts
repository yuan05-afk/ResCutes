import { neonAuth } from "@/lib/auth/server";

/**
 * Neon Auth middleware:
 * - Validates the session cookie
 * - Refreshes session tokens (Set-Cookie) where Next.js allows it
 * - Redirects unauthenticated users to /login
 *
 * Without this, getSession() in Server Components can throw when a refresh
 * tries to write cookies during RSC render (common when opening /mobile in a new tab).
 */
export default neonAuth.middleware({
  loginUrl: "/login",
});

export const config = {
  matcher: [
    "/mobile/:path*",
    "/dashboard/:path*",
    "/animals/:path*",
    "/rescue-cases/:path*",
    "/medical/:path*",
    "/adoption/:path*",
    "/shelters/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/unauthorized",
  ],
};
