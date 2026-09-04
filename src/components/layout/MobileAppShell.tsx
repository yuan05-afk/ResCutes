"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppRoutePrefetcher } from "@/components/layout/AppRoutePrefetcher";
import {
  NavigationPendingProvider,
  PendingPageSlot,
} from "@/components/layout/NavigationPending";
import { markAppBooted } from "@/components/layout/RootLoadingGate";
import { MobileNav } from "@/components/layout/mobile-nav";
import {
  MobileDeviceFrame,
  useMobileShellFrame,
} from "@/components/layout/mobile-device-frame";
import { cn } from "@/lib/utils";

/** Screens that must fill the shell without page-level scrolling. */
function isViewportLockedPath(pathname: string) {
  return (
    pathname === "/mobile" ||
    pathname === "/mobile/adoption" ||
    pathname.startsWith("/mobile/adoption/") ||
    pathname.startsWith("/mobile/assignments/") ||
    /^\/mobile\/cases\/[^/]+$/.test(pathname)
  );
}

export function MobileAppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    markAppBooted();
  }, []);

  return (
    <NavigationPendingProvider>
      <AppRoutePrefetcher />
      <MobileDeviceFrame>
        <MobileAppContent>{children}</MobileAppContent>
      </MobileDeviceFrame>
    </NavigationPendingProvider>
  );
}

function MobileAppContent({ children }: { children: React.ReactNode }) {
  const { isFramed } = useMobileShellFrame();
  const pathname = usePathname();
  const lockViewport = isViewportLockedPath(pathname);

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col bg-bone",
        isFramed
          ? "h-full min-h-full max-h-full"
          : "mx-auto h-[100dvh] max-w-mobile",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-x-hidden overscroll-contain",
          lockViewport ? "overflow-hidden" : "rc-scroll overflow-y-auto",
          isFramed ? "mockup-notch-pad" : "safe-top",
          /* Reserve space for fixed bottom nav when not framed */
          !isFramed && "pb-[4.75rem]",
        )}
      >
        <PendingPageSlot>{children}</PendingPageSlot>
      </div>

      <MobileNav />
    </div>
  );
}
