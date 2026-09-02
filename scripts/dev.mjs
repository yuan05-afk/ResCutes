#!/usr/bin/env node
/**
 * Safe dev server launcher for ResCutes.
 *
 * Fixes the common "must run dev:clean after every change" loop caused by:
 * - Two `next dev` processes sharing one `.next` folder (ports 3000 + 3001)
 * - `npm run build` overlapping with `npm run dev`
 * - Deleting `.next` while the dev server is still running
 */
import { spawn } from "node:child_process";
import net from "node:net";
import { cleanNextCache, isNextCacheCorrupt } from "./next-cache.mjs";

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "localhost";
const forceClean = process.argv.includes("--clean");
const useWebpack = process.argv.includes("--webpack");

function isPortInUse(port, host) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", (err) => {
      resolve(err.code === "EADDRINUSE");
    });
    tester.once("listening", () => {
      tester.close(() => resolve(false));
    });
    tester.listen(port, host);
  });
}

async function main() {
  const portBusy = await isPortInUse(PORT, HOST);
  if (portBusy) {
    console.error("");
    console.error(`Port ${PORT} is already in use.`);
    console.error(
      "Stop the other server first (Ctrl+C in that terminal), then run dev again.",
    );
    console.error(
      "Running two Next.js dev servers on the same project corrupts the .next cache.",
    );
    console.error("");
    process.exit(1);
  }

  if (forceClean) {
    cleanNextCache("Cleaning .next (--clean requested)...");
  } else if (isNextCacheCorrupt()) {
    cleanNextCache(
      "Detected a broken .next cache (often from build+dev overlap). Cleaning automatically...",
    );
  }

  const nextBin = process.platform === "win32" ? "next.cmd" : "next";
  const args = ["dev", "--port", String(PORT), "--hostname", HOST];

  // Turbopack is faster; pass --webpack to opt out if something breaks.
  if (!useWebpack) {
    args.push("--turbopack");
  }

  console.log("");
  console.log(`Starting ResCutes dev server at http://${HOST}:${PORT}`);
  if (!useWebpack) {
    console.log("(Turbopack enabled — use npm run dev:webpack if you hit issues)");
  }
  console.log("");

  const child = spawn(nextBin, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
