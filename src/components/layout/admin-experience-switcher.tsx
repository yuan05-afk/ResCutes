"use client";

import Link from "next/link";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefetchRouteNow } from "@/components/layout/AppRoutePrefetcher";
import { useNavigationPending } from "@/components/layout/NavigationPending";
import { useRouter } from "next/navigation";

interface AdminExperienceSwitcherProps {
  variant: "web" | "mobile";
  className?: string;
}

export function AdminExperienceSwitcher({
  variant,
  className,
}: AdminExperienceSwitcherProps) {
  const router = useRouter();
  const { startPending } = useNavigationPending();

  const href = variant === "web" ? "/mobile" : "/dashboard";
  const label = variant === "web" ? "Open mobile app" : "Open dashboard";
  const buttonText = variant === "web" ? "Mobile app" : "Dashboard";
  const Icon = variant === "web" ? Smartphone : Monitor;

  const openInNewTab = variant === "web";

  return (
    <Link
      href={href}
      prefetch={!openInNewTab}
      {...(openInNewTab
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      onMouseEnter={
        openInNewTab ? undefined : () => prefetchRouteNow(router, href)
      }
      onClick={openInNewTab ? undefined : () => startPending(href)}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        "border-evergreen/30 bg-evergreen text-white hover:bg-evergreen/90",
        className,
      )}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{buttonText}</span>
    </Link>
  );
}
