"use client";

import { Logo } from "@/components/ui/logo";
import { AdminExperienceSwitcher } from "@/components/layout/admin-experience-switcher";

export function WebMobileHeader({
  isAdministrator = false,
}: {
  isAdministrator?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between gap-2 border-b border-sage/20 bg-bone/95 px-4 py-3 backdrop-blur-md md:hidden">
      <Logo size="md" />
      {isAdministrator ? <AdminExperienceSwitcher variant="web" /> : null}
    </header>
  );
}
