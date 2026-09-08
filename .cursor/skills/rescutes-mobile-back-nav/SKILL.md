---
name: rescutes-mobile-back-nav
description: >-
  Keep ResCutes mobile detail/back navigation consistent with the Cases pattern
  (ChevronLeft icon button). Use when adding or editing mobile headers, back
  controls, adoption detail, case detail, assignment detail, or report flow
  headers.
---

# ResCutes mobile back navigation

## When to use

Any mobile screen that leaves a list/home and needs an in-app back control
(detail, application, report steps, assignment, adoption view).

## Required pattern (match Cases)

Reference: `src/app/mobile/cases/[id]/page.tsx`

```tsx
<header className="shrink-0 border-b border-sage/20 bg-white px-2 py-2.5">
  <div className="flex items-center gap-1">
    <Link // or <button type="button"> for in-flow state
      href={backHref}
      className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-graphite/70 active:bg-bone"
      aria-label="Back"
    >
      <ChevronLeft className="h-5 w-5" aria-hidden />
    </Link>
    <div className="min-w-0 flex-1 pr-3">
      <h1 className="truncate text-base font-bold text-graphite">
        {title}
      </h1>
      {/* optional subtitle / badges under the title */}
    </div>
  </div>
</header>
```

## Rules

1. **Icon back only** in mobile detail headers. Use `ChevronLeft` from `lucide-react`.
2. **Do not** use a text link labeled "Back" / evergreen text as the primary header back.
3. Tap target: `min-h-11 min-w-11`, `rounded-full`, `text-graphite/70`, `active:bg-bone`.
4. Always set `aria-label="Back"` (or a more specific label like `"Back to cases"`).
5. Mark the icon `aria-hidden`.
6. Header padding: `px-2 py-2.5` so the chevron aligns like Cases.
7. Title sits **beside** the chevron (same row), not below a text Back link.
8. Prefer OS/in-app back on detail screens; keep primary nav for top-level tabs only.
9. Form footers may still use a secondary Cancel/Back button for abandon-submit, but the **header** back must follow this chevron pattern when the screen is a pushed detail/flow step.

## Also used on

- `src/app/mobile/assignments/[id]/page.tsx`
- `src/app/mobile/report/report-flow.tsx` (header chevron)
- `src/app/mobile/adoption/adoption-mobile-client.tsx` (animal detail + application)

## Anti-patterns

- Evergreen bold "Back" text above the title
- Chevron without 44pt tap target
- Back control that only appears as "Back to list" at the bottom with no header chevron
