"use client";

import { Logo } from "@/components/ui/logo";
import { AdminExperienceSwitcher } from "@/components/layout/admin-experience-switcher";

export function WebMobileHeader({
  isAdministrator = false,
  notificationSlot,
}: {
  isAdministrator?: boolean;
  notificationSlot?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center border-b border-sage/20 bg-bone/95 px-4 py-3 backdrop-blur-md md:hidden">
      <div className="mr-auto">
        <Logo size="md" />
      </div>
      <div className="flex items-center gap-1.5">
        {notificationSlot}
        {isAdministrator ? (
          <AdminExperienceSwitcher variant="web" />
        ) : null}
      </div>
    </header>
  );
}
