import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

export function DashboardHeader({
  title,
  subtitle,
  children,
  compact = true,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1
          className={cn(
            "font-bold tracking-tight text-graphite break-words",
            compact ? "text-lg md:text-xl" : "text-2xl md:text-[28px]",
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-xs text-graphite/55 sm:text-sm break-words">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          {children}
        </div>
      )}
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
        <header className="shrink-0 border-b border-sage/20 bg-bone/90 px-4 py-3 md:px-6">
          {header}
        </header>
      ) : null}
      <div
        className={cn(
          "flex min-w-0 flex-col overflow-x-hidden px-4 py-3 md:px-6 md:py-4",
          fitViewport
            ? "lg:min-h-0 lg:flex-1 lg:overflow-hidden"
            : "lg:min-h-0 lg:flex-1 lg:overflow-y-auto",
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
        "lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
