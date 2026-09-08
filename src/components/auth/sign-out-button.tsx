"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";

function SignOutSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full rounded-full"
      disabled={pending}
    >
      {pending ? "Signing out..." : "Sign Out"}
    </Button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SignOutSubmit />
    </form>
  );
}
