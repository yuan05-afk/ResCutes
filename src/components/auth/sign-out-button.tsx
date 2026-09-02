"use client";

import { hexclaveClientApp } from "@/stack/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-full h-12"
      onClick={() => void hexclaveClientApp.redirectToSignOut()}
    >
      Sign Out
    </Button>
  );
}
