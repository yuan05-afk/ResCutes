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
      <div className="min-h-screen bg-bone md:bg-[#e8e6df]">
        <div className="mx-auto min-h-screen max-w-mobile w-full bg-bone shadow-elevated md:my-4 md:min-h-[calc(100vh-2rem)] md:rounded-2xl md:border md:border-sage/20 overflow-hidden relative pb-20 flex flex-col">
          <PendingPageSlot>{children}</PendingPageSlot>
          <MobileNav />
        </div>
      </div>
    </NavigationPendingProvider>
  );
}
