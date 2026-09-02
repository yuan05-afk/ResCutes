export { getAppSession } from "./stack-session";
export { requireAuth, requireRole, getSession } from "./session";
export type { AppSession, AppUser } from "./types";

/** @deprecated Use getAppSession() — kept for server actions during migration */
export async function auth() {
  const { getAppSession } = await import("./stack-session");
  return getAppSession();
}
