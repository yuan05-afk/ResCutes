"use client";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline" className="w-full rounded-full">
        Sign Out
      </Button>
    </form>
  );
}
