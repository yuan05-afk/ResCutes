import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Integration suites call clearWorkflowDataForTests() which can wipe the Neon
 * pointed at by DATABASE_URL. Keep them opt-in via ALLOW_DESTRUCTIVE_DB_TESTS=1
 * on a dedicated branch only - never the shared demo DB.
 */
const allowDestructiveDb = process.env.ALLOW_DESTRUCTIVE_DB_TESTS === "1";

const destructiveDbTests = [
  "src/lib/data/veterinary-workflow.test.ts",
  "src/lib/data/rescuer-workflow.test.ts",
  "src/lib/data/handoff-intake.test.ts",
  "src/lib/data/integration.test.ts",
  "src/lib/data/report-sync.test.ts",
];

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: allowDestructiveDb ? undefined : destructiveDbTests,
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
