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
            "font-bold tracking-tight text-graphite",
            compact ? "text-lg md:text-xl" : "text-2xl md:text-[28px]",
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-xs text-graphite/55 sm:text-sm">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-3">{children}</div>}
    </div>
  );
}

/** Full-viewport page shell — content fits one screen; scroll only inside designated panels. */
export function PageShell({
  children,
  className,
  header,
}: {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-[1440px] min-h-0 flex-1 flex-col overflow-hidden">
      {header ? (
        <header className="shrink-0 border-b border-sage/20 bg-bone/90 px-4 py-3 md:px-6">
          {header}
        </header>
      ) : null}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3 md:px-6 md:py-4",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Scrollable panel inside a viewport-fitted page (tables, long lists). */
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
        "min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain",
        className,
      )}
    >
      {children}
    </div>
  );
}
