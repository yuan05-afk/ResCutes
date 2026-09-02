"use client";

import { useEffect } from "react";
import { AppRoutePrefetcher } from "@/components/layout/AppRoutePrefetcher";
import {
  NavigationPendingProvider,
  PendingPageSlot,
} from "@/components/layout/NavigationPending";
import { markAppBooted } from "@/components/layout/RootLoadingGate";
import { WebSidebar } from "@/components/layout/web-sidebar";
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
      <div className="flex min-h-screen md:h-dvh md:overflow-hidden bg-bone">
        <WebSidebar userName={userName} userEmail={userEmail} userRoles={userRoles} />
        <main className="flex flex-1 min-h-0 flex-col overflow-hidden">
          <PendingPageSlot>{children}</PendingPageSlot>
        </main>
      </div>
    </NavigationPendingProvider>
  );
}
