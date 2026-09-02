"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { pauseAppPrefetch, resumeAppPrefetch } from "@/lib/app-prefetch-engine";
import { bumpNavigationGeneration } from "@/lib/navigation-generation";
import { cn } from "@/lib/utils";

type Ctx = {
  pendingHref: string | null;
  startPending: (href: string) => void;
  navigate: (href: string) => void;
};

const NavigationPendingContext = createContext<Ctx | null>(null);

const NAV_TIMEOUT_MS = 12_000;
const PROGRESS_DELAY_MS = 320;
const SKELETON_DELAY_MS = 700;

function normalizePath(href: string) {
  try {
    if (href.startsWith("http")) {
      const u = new URL(href);
      href = u.pathname + u.search;
    }
  } catch {
    /* ignore */
  }
  const path = href.split("?")[0]?.split("#")[0] ?? href;
  return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
}

const LOADING_MESSAGES: Record<string, string> = {
  "/dashboard": "Loading operations overview...",
  "/rescue-cases": "Loading rescue cases...",
  "/animals": "Loading animals...",
  "/settings": "Loading settings...",
  "/profile": "Loading profile...",
  "/mobile": "Loading home...",
  "/mobile/nearby": "Loading nearby map...",
  "/mobile/cases": "Loading your cases...",
  "/mobile/report": "Loading report form...",
  "/mobile/profile": "Loading profile...",
};

export function NavigationPendingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingHref) {
      resumeAppPrefetch();
      return;
    }
    if (normalizePath(pendingHref) !== normalizePath(pathname)) return;
    setPendingHref(null);
    resumeAppPrefetch();
  }, [pathname, pendingHref]);

  useEffect(() => {
    if (!pendingHref) return;
    pauseAppPrefetch();
    bumpNavigationGeneration();

    const id = window.setTimeout(() => {
      const next = pendingHref;
      const here = normalizePath(window.location.pathname);
      if (next && normalizePath(next) !== here) {
        window.location.assign(next);
        return;
      }
      setPendingHref(null);
      resumeAppPrefetch();
    }, NAV_TIMEOUT_MS);

    return () => window.clearTimeout(id);
  }, [pendingHref]);

  const startPending = useCallback(
    (href: string) => {
      const next = normalizePath(href);
      if (!next || next === normalizePath(pathname)) return;
      bumpNavigationGeneration();
      pauseAppPrefetch();
      setPendingHref(next);
    },
    [pathname],
  );

  const navigate = useCallback(
    (href: string) => {
      const next = normalizePath(href);
      if (!next || next === normalizePath(pathname)) return;
      bumpNavigationGeneration();
      pauseAppPrefetch();
      setPendingHref(next);
      router.push(next);
    },
    [pathname, router],
  );

  const value = useMemo(
    () => ({ pendingHref, startPending, navigate }),
    [pendingHref, startPending, navigate],
  );

  return (
    <NavigationPendingContext.Provider value={value}>
      {children}
    </NavigationPendingContext.Provider>
  );
}

export function useNavigationPending() {
  const ctx = useContext(NavigationPendingContext);
  if (!ctx) {
    return {
      pendingHref: null,
      startPending: () => undefined,
      navigate: () => undefined,
    };
  }
  return ctx;
}

export function PendingPageSlot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { pendingHref } = useNavigationPending();
  const navigating = pendingHref !== null;
  const [showProgress, setShowProgress] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const loadingMessage = useMemo(() => {
    const dest = pendingHref ? normalizePath(pendingHref) : pathname;
    return LOADING_MESSAGES[dest] ?? "Loading...";
  }, [pendingHref, pathname]);

  useEffect(() => {
    if (!navigating) {
      setShowProgress(false);
      setShowSkeleton(false);
      return;
    }
    const progressId = window.setTimeout(() => setShowProgress(true), PROGRESS_DELAY_MS);
    const skeletonId = window.setTimeout(() => setShowSkeleton(true), SKELETON_DELAY_MS);
    return () => {
      window.clearTimeout(progressId);
      window.clearTimeout(skeletonId);
    };
  }, [navigating, pendingHref]);

  return (
    <div className={cn("relative flex h-full flex-1 flex-col min-h-0 overflow-hidden", showSkeleton && "min-h-[50vh]")}>
      {showProgress && navigating ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden bg-sage/20">
          <div className="rc-nav-progress h-full w-1/3 rounded-full bg-evergreen" />
        </div>
      ) : null}

      <div
        className={cn(
          "flex h-full min-h-0 flex-1 flex-col overflow-hidden",
        )}
        aria-busy={showSkeleton || undefined}
      >
        {children}
      </div>

      {showSkeleton && navigating ? (
        <div className="absolute inset-0 z-10 overflow-y-auto bg-bone">
          <PageSkeleton message={loadingMessage} />
        </div>
      ) : null}
    </div>
  );
}
