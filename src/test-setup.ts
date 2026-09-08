import { config } from "dotenv";
import { vi } from "vitest";

config({ path: ".env.local" });

if (
  process.env.ALLOW_DESTRUCTIVE_DB_TESTS === "1" &&
  process.env.DATABASE_URL?.includes("neon.tech")
) {
  console.warn(
    "[vitest] ALLOW_DESTRUCTIVE_DB_TESTS=1 with a Neon DATABASE_URL. Ensure this is a dedicated test branch, not the shared demo database.",
  );
}

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));
