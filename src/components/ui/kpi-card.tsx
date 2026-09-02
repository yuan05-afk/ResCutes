import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { KpiCardLink } from "@/components/ui/kpi-card-link";

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
        "rounded-xl border border-sage/25 bg-white p-3.5 shadow-card transition-shadow hover:shadow-card-hover",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-graphite/50">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-graphite leading-none">
            {value}
          </p>
          {detail && (
            <p className="mt-1 text-xs text-graphite/55 line-clamp-1">{detail}</p>
          )}
          {href && hrefLabel && (
            <KpiCardLink href={href}>{hrefLabel}</KpiCardLink>
          )}
        </div>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-evergreen/8">
            <Icon className="h-4 w-4 text-evergreen" />
          </div>
        )}
      </div>
      {children && <div className="mt-2.5">{children}</div>}
    </div>
  );
}
