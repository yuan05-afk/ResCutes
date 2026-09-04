"use client";

import { useState } from "react";
import { PawPrint } from "lucide-react";

const BOOT_KEY = "rescutes-app-booted";

export function markAppBooted() {
  try {
    sessionStorage.setItem(BOOT_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function clearAppBooted() {
  try {
    sessionStorage.removeItem(BOOT_KEY);
  } catch {
    /* ignore */
  }
}

function hasBooted() {
  try {
    return sessionStorage.getItem(BOOT_KEY) === "1";
  } catch {
    return false;
  }
}

/** Full-screen loader for cold / hard navigations only. */
export function RootLoadingGate() {
  const [booted] = useState(() =>
    typeof window === "undefined" ? false : hasBooted(),
  );

  if (booted) return null;

  return (
    <div className="flex min-h-[100svh] w-full items-center justify-center bg-bone px-4">
      <div className="flex flex-col items-center gap-3 text-evergreen">
        <PawPrint className="h-10 w-10 animate-pulse" />
        <p className="text-sm text-graphite/70">Loading ResCutes...</p>
      </div>
    </div>
  );
}
