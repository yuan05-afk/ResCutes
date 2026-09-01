import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  children,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-graphite md:text-[28px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-graphite/60">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-[1400px] p-6 md:p-8 space-y-8", className)}>
      {children}
    </div>
  );
}
