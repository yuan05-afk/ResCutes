"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { rewarmRoutes } from "@/lib/app-prefetch-engine";
import { getNavigationGeneration } from "@/lib/navigation-generation";

type ActionResult = { error?: string; success?: boolean } | void;

/**
 * Clears pending when the server action returns, not when router.refresh() finishes.
 */
export function useActionPending() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const run = useCallback(
    async (
      action: () => Promise<ActionResult>,
      opts?: {
        refresh?: boolean;
        rewarm?: string[];
        onSuccess?: () => void;
      },
    ) => {
      setError(null);
      setPending(true);
      try {
        const res = await action();
        if (res && typeof res === "object" && "error" in res && res.error) {
          setError(res.error);
          return false;
        }
        opts?.onSuccess?.();
        if (opts?.refresh !== false) {
          const paths = new Set<string>(opts?.rewarm ?? []);
          if (pathname) paths.add(pathname.split("?")[0] || pathname);
          if (paths.size) rewarmRoutes([...paths]);

          const gen = getNavigationGeneration();
          const pathAtStart = pathname;
          startTransition(() => {
            if (getNavigationGeneration() !== gen) return;
            if (typeof window !== "undefined") {
              const here = window.location.pathname;
              const expected = (pathAtStart ?? "").split("?")[0] || "";
              if (expected && here !== expected && !here.startsWith(expected + "/")) {
                return;
              }
            }
            router.refresh();
          });
        }
        return true;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Something went wrong";
        setError(message);
        return false;
      } finally {
        setPending(false);
      }
    },
    [pathname, router, startTransition],
  );

  return { pending, error, setError, run };
}
