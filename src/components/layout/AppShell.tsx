"use client";

import { useEffect } from "react";
import { AppRoutePrefetcher } from "@/components/layout/AppRoutePrefetcher";
import {
  NavigationPendingProvider,
  PendingPageSlot,
} from "@/components/layout/NavigationPending";
import { markAppBooted } from "@/components/layout/RootLoadingGate";
import { WebSidebar } from "@/components/layout/web-sidebar";
import { WebMobileHeader } from "@/components/layout/web-mobile-header";
import { WebMobileNav } from "@/components/layout/web-mobile-nav";
import type { Role } from "@/lib/auth/permissions";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userRoles: Role[];
}

export function AppShell({ children, userName, userEmail, userRoles }: AppShellProps) {
  useEffect(() => {
    markAppBooted();
  }, []);

  return (
    <NavigationPendingProvider>
      <AppRoutePrefetcher />
      <div className="flex h-[100dvh] bg-bone lg:overflow-hidden">
        <WebSidebar userName={userName} userEmail={userEmail} userRoles={userRoles} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <WebMobileHeader />
          {/*
            Mobile / narrow: main is the ONLY vertical scroll container.
            lg+: pages manage scroll inside PageShell (fitted layout).
          */}
          <main className="app-main-pad flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden lg:overflow-hidden">
            <PendingPageSlot>{children}</PendingPageSlot>
          </main>
          <WebMobileNav />
        </div>
      </div>
    </NavigationPendingProvider>
  );
}
