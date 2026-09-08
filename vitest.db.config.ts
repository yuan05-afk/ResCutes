process.env.ALLOW_DESTRUCTIVE_DB_TESTS = "1";

import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Destructive DB workflow tests only.
 * Point DATABASE_URL at a dedicated Neon branch before running:
 *   npm run test:db
 */
export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/lib/data/veterinary-workflow.test.ts",
      "src/lib/data/rescuer-workflow.test.ts",
      "src/lib/data/handoff-intake.test.ts",
      "src/lib/data/integration.test.ts",
      "src/lib/data/report-sync.test.ts",
    ],
    setupFiles: ["src/test-setup.ts"],
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./src/test-shims/server-only.ts"),
    },
  },
});
