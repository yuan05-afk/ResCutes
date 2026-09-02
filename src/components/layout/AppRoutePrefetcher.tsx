"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  bindAppPrefetchRouter,
  configurePrefetchRoutes,
  markRouteVisited,
  prioritizeRoute,
  rewarmAllRoutes,
  rewarmRoutes,
} from "@/lib/app-prefetch-engine";
import { prefetchOrderForPath } from "@/lib/app-nav";

export function AppRoutePrefetcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    bindAppPrefetchRouter({
      prefetch: (href, options) => {
        router.prefetch(href, options as never);
      },
    });
  }, [router]);

  useEffect(() => {
    configurePrefetchRoutes(prefetchOrderForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    markRouteVisited(pathname);
  }, [pathname]);

  return null;
}

export function prefetchRouteNow(_router: ReturnType<typeof useRouter>, href: string) {
  prioritizeRoute(href);
}

export function invalidatePrefetch(href?: string) {
  if (href) rewarmRoutes([href]);
  else rewarmAllRoutes();
}
