"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const STEP_MS = 900;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sequential router.prefetch queue — heaviest routes first, one at a time.
 * Pauses while a navigation is in flight (per Next.js + Neon perf guide).
 */
export function useRoutePrefetch(routes: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const pausedRef = useRef(false);
  const pathAtStartRef = useRef(pathname);

  useEffect(() => {
    pathAtStartRef.current = pathname;
    pausedRef.current = true;
    const timer = setTimeout(() => {
      pausedRef.current = false;
    }, 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function pump(queue: string[]) {
      while (queue.length && !cancelled && !pausedRef.current) {
        const href = queue.shift()!;
        if (href === pathname) continue;
        try {
          router.prefetch(href);
        } catch {
          queue.push(href);
          await sleep(1200);
          continue;
        }
        await sleep(STEP_MS);
      }
    }

    const ordered = [...routes].sort((a, b) => {
      const weight = (href: string) => {
        if (href === "/dashboard") return 0;
        if (href === "/rescue-cases") return 1;
        if (href === "/animals") return 2;
        return 3;
      };
      return weight(a) - weight(b);
    });

    void pump(ordered);

    return () => {
      cancelled = true;
    };
  }, [pathname, router, routes]);
}
