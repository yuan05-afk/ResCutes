"use client";

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  PawPrint,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigationPending } from "@/components/layout/NavigationPending";

type KpiAccent = "evergreen" | "rescue" | "ochre" | "sage";

export type KpiIconName = "paw" | "activity" | "alert" | "stethoscope";

const kpiIcons = {
  paw: PawPrint,
  activity: Activity,
  alert: AlertCircle,
  stethoscope: Stethoscope,
} as const;

const accentStyles: Record<
  KpiAccent,
  { icon: string; ring: string; footer: string }
> = {
  evergreen: {
    icon: "bg-evergreen/10 text-evergreen",
    ring: "group-hover:ring-evergreen/15",
    footer: "text-evergreen",
  },
  rescue: {
    icon: "bg-rescue/10 text-rescue",
    ring: "group-hover:ring-rescue/15",
    footer: "text-rescue",
  },
  ochre: {
    icon: "bg-ochre/12 text-ochre",
    ring: "group-hover:ring-ochre/15",
    footer: "text-ochre",
  },
  sage: {
    icon: "bg-sage/25 text-evergreen",
    ring: "group-hover:ring-sage/30",
    footer: "text-evergreen",
  },
};

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: KpiIconName;
  detail?: string;
  href?: string;
  hrefLabel?: string;
  accent?: KpiAccent;
  className?: string;
  children?: React.ReactNode;
}

export function KpiCard({
  label,
  value,
  icon: iconName,
  detail,
  href,
  hrefLabel = "View details",
  accent = "evergreen",
  className,
  children,
}: KpiCardProps) {
  const { startPending } = useNavigationPending();
  const styles = accentStyles[accent];
  const isClickable = Boolean(href);
  const Icon = iconName ? kpiIcons[iconName] : null;

  const card = (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-sage/20 bg-white p-4 shadow-card ring-1 ring-transparent transition-all duration-200",
        isClickable &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-sage/35 hover:shadow-card-hover",
        isClickable && styles.ring,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-graphite/45">
            {label}
          </p>
          <p className="mt-1.5 text-[1.75rem] font-bold leading-none tracking-tight text-graphite">
            {value}
          </p>
          {detail ? (
            <p className="mt-1.5 text-xs leading-snug text-graphite/55 line-clamp-2">
              {detail}
            </p>
          ) : null}
        </div>

        {Icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
              styles.icon,
            )}
          >
            <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-3 flex-1">{children}</div> : null}

      {isClickable ? (
        <p
          className={cn(
            "flex items-center gap-1 pt-3 text-xs font-semibold transition-colors",
            !children && "mt-auto",
            styles.footer,
            "group-hover:underline",
          )}
        >
          <span>{hrefLabel}</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
        </p>
      ) : null}
    </article>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      prefetch
      onClick={() => startPending(href)}
      className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen/40 focus-visible:ring-offset-2"
      aria-label={`${label}: ${value}. ${hrefLabel}`}
    >
      {card}
    </Link>
  );
}
