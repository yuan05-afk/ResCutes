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
} from "lucide-react";
import { hexclaveClientApp } from "@/stack/client";
import { Logo } from "@/components/ui/logo";
import type { Role } from "@/lib/auth/permissions";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { useRoutePrefetch } from "@/components/layout/use-route-prefetch";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rescue-cases", label: "Rescue Cases", icon: ClipboardList },
  { href: "/animals", label: "Animals", icon: PawPrint },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface WebSidebarProps {
  userName: string;
  userRoles: Role[];
}

export function WebSidebar({ userName, userRoles }: WebSidebarProps) {
  const pathname = usePathname();
  const primaryRole = userRoles[0];
  useRoutePrefetch(navItems.map((item) => item.href));

  return (
    <aside
      className="hidden md:flex w-[260px] shrink-0 flex-col sticky top-0 self-start h-dvh bg-evergreen text-white"
      aria-label="Main navigation"
    >
      <div className="shrink-0 px-5 py-6 border-b border-white/10">
        <Logo variant="light" size="lg" />
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
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

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/10 p-4">
          <p className="text-sm font-semibold truncate">{userName}</p>
          <p className="text-xs text-white/60 mt-0.5">
            {primaryRole ? ROLE_LABELS[primaryRole] : "Staff"}
          </p>
          <button
            type="button"
            onClick={() => void hexclaveClientApp.redirectToSignOut()}
            className="mt-3 flex items-center gap-2 text-sm text-white/75 hover:text-white transition-colors min-h-[44px]"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
