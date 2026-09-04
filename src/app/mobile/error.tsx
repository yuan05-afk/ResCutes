"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MobileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[mobile]", error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="text-lg font-bold text-graphite">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-graphite/65">
        We could not load this screen. Check your connection and try again. Your
        draft reports on this device are still saved.
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <Button type="button" className="min-h-11 w-full" onClick={reset}>
          Try again
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full"
          asChild
        >
          <Link href="/mobile">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
