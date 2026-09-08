import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Default unit + workflow tests.
 * Workflow suites only delete known test fixture rows (never full demo wipe).
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
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
