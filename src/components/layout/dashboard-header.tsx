"use client";

import { cn } from "@/lib/utils";
import { PageHeaderNotifications } from "@/components/notifications/notification-slot-context";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  compact?: boolean;
  /** Hide the desktop notification bell (rare; default shows it). */
  hideNotifications?: boolean;
}

export function DashboardHeader({
  title,
  subtitle,
  children,
  compact = true,
  hideNotifications = false,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 sm:items-center">
      <div className="min-w-0 flex-1">
        <h1
          className={cn(
            "font-bold tracking-tight text-graphite break-words",
            compact ? "text-lg md:text-xl" : "text-xl md:text-2xl",
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-graphite/55 sm:text-sm break-words">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {children}
        {!hideNotifications ? <PageHeaderNotifications /> : null}
      </div>
    </div>
  );
}

/**
 * Page shell for dashboard routes.
 *
 * Scroll strategy (avoids nested scroll traps):
 * - Below lg: content grows naturally; only AppShell `<main>` scrolls.
 * - lg+: `fitViewport` locks height; body / PageScrollPanel scroll internally.
 */
export function PageShell({
  children,
  className,
  header,
  fitViewport = false,
}: {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  fitViewport?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-w-0 max-w-[1440px] flex-col",
        "lg:min-h-0 lg:flex-1",
        fitViewport && "lg:overflow-hidden",
      )}
    >
      {header ? (
        <header className="shrink-0 border-b border-sage/20 bg-bone/90 px-4 py-2.5 md:px-5 md:py-3">
          {header}
        </header>
      ) : null}
      <div
        className={cn(
          "flex min-w-0 flex-col overflow-x-hidden px-4 py-3 md:px-5 md:py-4",
          fitViewport
            ? "lg:min-h-0 lg:flex-1 lg:overflow-hidden"
            : "lg:min-h-0 lg:flex-1 lg:overflow-y-auto rc-scroll",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Scrollable panel inside a viewport-fitted page. lg+ only. */
export function PageScrollPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden rc-scroll",
        className,
      )}
    >
      {children}
    </div>
  );
}
