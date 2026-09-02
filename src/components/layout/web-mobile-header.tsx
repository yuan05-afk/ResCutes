"use client";

import { Logo } from "@/components/ui/logo";

export function WebMobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center border-b border-sage/20 bg-bone/95 px-4 py-3 backdrop-blur-md md:hidden">
      <Logo size="md" />
    </header>
  );
}
