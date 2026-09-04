/** Dashboard routes, heaviest first for sequential prefetch. */
export const DASHBOARD_PREFETCH_RANK: { href: string; weight: number }[] = [
  { href: "/dashboard", weight: 10 },
  { href: "/rescue-cases", weight: 9 },
  { href: "/animals", weight: 7 },
  { href: "/medical", weight: 7 },
  { href: "/adoption", weight: 6 },
  { href: "/shelters", weight: 5 },
  { href: "/settings", weight: 3 },
  { href: "/profile", weight: 2 },
];

export const DASHBOARD_ROUTE_HREFS = DASHBOARD_PREFETCH_RANK.map((r) => r.href);

/** Mobile PWA routes. Home map is heaviest. */
export const MOBILE_PREFETCH_RANK: { href: string; weight: number }[] = [
  { href: "/mobile", weight: 10 },
  { href: "/mobile/adoption", weight: 8 },
  { href: "/mobile/cases", weight: 7 },
  { href: "/mobile/report", weight: 5 },
  { href: "/mobile/profile", weight: 3 },
];

export const MOBILE_ROUTE_HREFS = MOBILE_PREFETCH_RANK.map((r) => r.href);

export function prefetchOrderForPath(pathname: string): string[] {
  const ranked = pathname.startsWith("/mobile")
    ? MOBILE_PREFETCH_RANK
    : DASHBOARD_PREFETCH_RANK;
  const hrefs = ranked.map((r) => r.href);
  const all = pathname.startsWith("/mobile")
    ? MOBILE_ROUTE_HREFS
    : DASHBOARD_ROUTE_HREFS;
  return [...hrefs, ...all.filter((h) => !hrefs.includes(h))];
}
