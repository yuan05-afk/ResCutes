"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  PawPrint,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { hexclaveClientApp } from "@/stack/client";
import { Logo } from "@/components/ui/logo";
import type { Role } from "@/lib/auth/permissions";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { prefetchRouteNow } from "@/components/layout/AppRoutePrefetcher";
import { useNavigationPending } from "@/components/layout/NavigationPending";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rescue-cases", label: "Rescue Cases", icon: ClipboardList },
  { href: "/animals", label: "Animals", icon: PawPrint },
  { href: "/settings", label: "Settings", icon: Settings },
];

function userInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface WebSidebarProps {
  userName: string;
  userEmail: string;
  userRoles: Role[];
}

export function WebSidebar({ userName, userEmail, userRoles }: WebSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { startPending } = useNavigationPending();
  const primaryRole = userRoles[0];
  const isProfileActive = pathname.startsWith("/profile");

  return (
    <aside
      className="hidden md:flex w-[260px] shrink-0 flex-col sticky top-0 self-start min-h-[100dvh] bg-evergreen text-white"
      aria-label="Main navigation"
    >
      <div className="shrink-0 px-5 py-6 border-b border-white/10">
        <Logo variant="light" size="lg" />
      </div>

      <nav className="rc-scroll flex-1 min-h-0 overflow-y-auto px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onMouseEnter={() => prefetchRouteNow(router, item.href)}
              onClick={() => startPending(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <Link
          href="/profile"
          prefetch
          onMouseEnter={() => prefetchRouteNow(router, "/profile")}
          onClick={() => startPending("/profile")}
          className={cn(
            "group flex items-center gap-3 rounded-xl p-3 transition-colors",
            isProfileActive
              ? "bg-white/15 ring-1 ring-white/20"
              : "bg-white/10 hover:bg-white/15",
          )}
          aria-current={isProfileActive ? "page" : undefined}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
            {userInitials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-[11px] text-white/55 truncate">
              {primaryRole ? ROLE_LABELS[primaryRole] : "Staff"}
            </p>
            <p className="text-[10px] text-white/40 truncate mt-0.5">
              {userEmail}
            </p>
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              isProfileActive
                ? "text-white"
                : "text-white/40 group-hover:translate-x-0.5 group-hover:text-white/70",
            )}
            aria-hidden
          />
        </Link>

        <button
          type="button"
          onClick={() => void hexclaveClientApp.redirectToSignOut()}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  );
}
