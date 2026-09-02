"use client";

const STEP_MS = 900;

type PrefetchRouter = {
  prefetch: (href: string, options?: { kind?: string }) => void;
};

let routerRef: PrefetchRouter | null = null;
let running = false;
let paused = false;
let sequentialOrder: string[] = [];

const warmed = new Set<string>();
const queue: string[] = [];

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function enqueue(href: string, front = false) {
  if (warmed.has(href)) return;
  const idx = queue.indexOf(href);
  if (idx !== -1) {
    if (!front) return;
    queue.splice(idx, 1);
  }
  if (front) queue.unshift(href);
  else queue.push(href);
}

function fillQueue() {
  for (const href of sequentialOrder) enqueue(href);
}

async function pump() {
  if (running || !routerRef || paused) return;
  running = true;
  try {
    while (queue.length > 0 && routerRef && !paused) {
      const href = queue.shift()!;
      if (warmed.has(href)) continue;
      try {
        routerRef.prefetch(href);
        warmed.add(href);
      } catch {
        enqueue(href);
        await sleep(1200);
        continue;
      }
      await sleep(STEP_MS);
    }
  } finally {
    running = false;
    if (!paused && queue.length > 0) void pump();
  }
}

export function bindAppPrefetchRouter(router: PrefetchRouter) {
  routerRef = router;
  fillQueue();
  void pump();
}

export function configurePrefetchRoutes(hrefs: string[]) {
  sequentialOrder = hrefs;
  queue.length = 0;
  fillQueue();
  if (!paused) void pump();
}

export function pauseAppPrefetch() {
  paused = true;
}

export function resumeAppPrefetch() {
  if (!paused) return;
  paused = false;
  void pump();
}

export function markRouteVisited(href: string) {
  warmed.add(href);
}

export function prioritizeRoute(href: string) {
  if (paused) return;
  warmed.delete(href);
  enqueue(href, true);
  void pump();
}

export function rewarmRoutes(hrefs: string[]) {
  for (const href of hrefs) {
    warmed.delete(href);
    enqueue(href, true);
  }
  if (!paused) void pump();
}

export function rewarmAllRoutes() {
  warmed.clear();
  queue.length = 0;
  fillQueue();
  if (!paused) void pump();
}
