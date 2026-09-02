"use client";

import { useEffect } from "react";
import { AppRoutePrefetcher } from "@/components/layout/AppRoutePrefetcher";
import {
  NavigationPendingProvider,
  PendingPageSlot,
} from "@/components/layout/NavigationPending";
import { markAppBooted } from "@/components/layout/RootLoadingGate";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileDeviceFrame, useMobileShellFrame } from "@/components/layout/mobile-device-frame";
import { cn } from "@/lib/utils";

function MobileAppContent({ children }: { children: React.ReactNode }) {
  const { isFramed } = useMobileShellFrame();

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
          "rc-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain",
          isFramed ? "mockup-notch-pad" : "safe-top pb-20",
        )}
      >
        <PendingPageSlot>{children}</PendingPageSlot>
      </div>

      <MobileNav />
    </div>
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
