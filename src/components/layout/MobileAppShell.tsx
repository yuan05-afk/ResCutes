"use client";

import { useEffect } from "react";
import { AppRoutePrefetcher } from "@/components/layout/AppRoutePrefetcher";
import {
  NavigationPendingProvider,
  PendingPageSlot,
} from "@/components/layout/NavigationPending";
import { markAppBooted } from "@/components/layout/RootLoadingGate";
import { MobileNav } from "@/components/layout/mobile-nav";

export function MobileAppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    markAppBooted();
  }, []);

  return (
    <NavigationPendingProvider>
      <AppRoutePrefetcher />
      <div className="min-h-[100dvh] bg-bone md:bg-[#e8e6df]">
        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-mobile flex-col overflow-hidden bg-bone shadow-elevated md:my-4 md:min-h-0 md:max-h-[calc(100dvh-2rem)] md:rounded-2xl md:border md:border-sage/20">
          <div className="rc-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-20">
            <PendingPageSlot>{children}</PendingPageSlot>
          </div>
          <MobileNav />
        </div>
      </div>
    </NavigationPendingProvider>
  );
}
