"use client";

import { useEffect } from "react";
import { AppRoutePrefetcher } from "@/components/layout/AppRoutePrefetcher";
import {
  NavigationPendingProvider,
  PendingPageSlot,
} from "@/components/layout/NavigationPending";
import { markAppBooted } from "@/components/layout/RootLoadingGate";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AdminDemoBar } from "@/components/layout/admin-experience-switcher";
import { MobileDeviceFrame, useMobileShellFrame } from "@/components/layout/mobile-device-frame";
import { cn } from "@/lib/utils";

function MobileAppContent({
  children,
  isAdministrator,
}: {
  children: React.ReactNode;
  isAdministrator: boolean;
}) {
  const { isFramed } = useMobileShellFrame();

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col bg-bone",
        "h-[100dvh] max-w-mobile mx-auto",
        isFramed && "h-full max-w-none",
      )}
    >
      {isAdministrator ? <AdminDemoBar variant="mobile" /> : null}

      <div
        className={cn(
          "rc-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain",
          !isFramed && "pb-20",
        )}
      >
        <PendingPageSlot>{children}</PendingPageSlot>
      </div>

      <MobileNav />
    </div>
  );
}

export function MobileAppShell({
  children,
  isAdministrator = false,
}: {
  children: React.ReactNode;
  isAdministrator?: boolean;
}) {
  useEffect(() => {
    markAppBooted();
  }, []);

  return (
    <NavigationPendingProvider>
      <AppRoutePrefetcher />
      <MobileDeviceFrame>
        <MobileAppContent isAdministrator={isAdministrator}>
          {children}
        </MobileAppContent>
      </MobileDeviceFrame>
    </NavigationPendingProvider>
  );
}
