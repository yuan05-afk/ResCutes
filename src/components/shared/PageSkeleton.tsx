"use client";

/** In-content soft-nav placeholder — shown only when navigation is slow. */
export function PageSkeleton({ message }: { message?: string }) {
  return (
    <div className="w-full space-y-4 p-4" aria-busy="true">
      <p className="text-sm text-graphite/60">{message ?? "Loading..."}</p>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-sage/20" />
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-xl bg-sage/15" />
        <div className="h-24 animate-pulse rounded-xl bg-sage/15" />
        <div className="h-24 animate-pulse rounded-xl bg-sage/15" />
      </div>
    </div>
  );
}
