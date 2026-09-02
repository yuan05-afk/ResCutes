"use client";

import Link from "next/link";
import { useNavigationPending } from "@/components/layout/NavigationPending";

export function KpiCardLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const { startPending } = useNavigationPending();

  return (
    <Link
      href={href}
      prefetch
      onClick={() => startPending(href)}
      className="mt-2 inline-block text-sm font-medium text-evergreen hover:underline"
    >
      {children}
    </Link>
  );
}
