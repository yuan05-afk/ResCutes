import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  detail?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  detail,
  href,
  hrefLabel,
  className,
  children,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-sage/25 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-graphite/55">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-graphite">
            {value}
          </p>
          {detail && (
            <p className="mt-1 text-sm text-graphite/60">{detail}</p>
          )}
          {href && hrefLabel && (
            <a
              href={href}
              className="mt-2 inline-block text-sm font-medium text-evergreen hover:underline"
            >
              {hrefLabel}
            </a>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-evergreen/8">
            <Icon className="h-5 w-5 text-evergreen" />
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
