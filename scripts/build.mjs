#!/usr/bin/env node
/**
 * Production build guard — refuses to build while dev server holds the port.
 */
import { spawn } from "node:child_process";
import net from "node:net";
import { cleanNextCache, isNextCacheCorrupt } from "./next-cache.mjs";

const DEV_PORT = Number(process.env.DEV_GUARD_PORT || 3000);
const HOST = process.env.HOST || "localhost";

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
  const devRunning = await isPortInUse(DEV_PORT, HOST);
  if (devRunning) {
    console.error("");
    console.error(`Dev server is still running on port ${DEV_PORT}.`);
    console.error("Stop it with Ctrl+C before running npm run build.");
    console.error("Building while dev runs corrupts .next on this project.");
    console.error("");
    process.exit(1);
  }

  if (isNextCacheCorrupt()) {
    cleanNextCache("Removing broken .next before production build...");
  }

  const nextBin = process.platform === "win32" ? "next.cmd" : "next";
  const child = spawn(nextBin, ["build"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
