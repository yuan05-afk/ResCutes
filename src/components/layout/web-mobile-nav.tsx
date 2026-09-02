"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  PawPrint,
  Settings,
  User,
} from "lucide-react";
import { prefetchRouteNow } from "@/components/layout/AppRoutePrefetcher";
import { useNavigationPending } from "@/components/layout/NavigationPending";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, match: "/dashboard" },
  { href: "/rescue-cases", label: "Cases", icon: ClipboardList, match: "/rescue-cases" },
  { href: "/animals", label: "Animals", icon: PawPrint, match: "/animals" },
  { href: "/settings", label: "Settings", icon: Settings, match: "/settings" },
  { href: "/profile", label: "Profile", icon: User, match: "/profile" },
];

export function WebMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { startPending } = useNavigationPending();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-sage/25 bg-white/95 backdrop-blur-md safe-bottom md:hidden"
      aria-label="Dashboard navigation"
    >
      <div className="mx-auto flex max-w-[1440px] items-end justify-around px-1 pb-1.5 pt-1">
        {navItems.map((item) => {
          const isActive =
            item.match === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.match);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onTouchStart={() => prefetchRouteNow(router, item.href)}
              onMouseEnter={() => prefetchRouteNow(router, item.href)}
              onClick={() => startPending(item.href)}
              className={cn(
                "flex min-h-[44px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5",
                isActive ? "text-evergreen" : "text-graphite/45",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
              <span className="text-[10px] font-medium leading-none sm:text-[11px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
