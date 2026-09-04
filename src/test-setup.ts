import { config } from "dotenv";
import { vi } from "vitest";

config({ path: ".env.local" });

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));
