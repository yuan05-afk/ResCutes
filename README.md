# ResCutes

ResCutes connects citizens, rescuers, shelters, and veterinarians through one coordinated workflow from animal reporting to safe shelter intake and medical clearance.

The app has two interfaces from one codebase:

- **Mobile (PWA)** - citizens report animals and track cases; rescuers accept assignments and update rescue progress.
- **Web dashboard** - shelter staff verify cases, assign rescuers, route to shelters, complete intake; veterinarians record examinations and medical clearance.

This is a hackathon MVP. Neon PostgreSQL persistence is prepared in the codebase but **not yet wired for day-to-day development**; the app currently runs on an in-memory demo data store.

---

## Technology stack

| Area | Technology |
|------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS, Radix UI |
| Auth | Auth.js (`next-auth` v5 beta) |
| Database (planned) | Neon PostgreSQL, Drizzle ORM |
| Maps | Mapbox GL |
| File storage (optional) | Vercel Blob |
| Testing | Vitest, Playwright |
| Linting | ESLint |

---

## Requirements

- **Node.js** (LTS recommended)
- **npm**
- **Git**

---

## Installation

Clone the repository, switch to the integration branch, install dependencies, and configure environment variables.

```powershell
git clone https://github.com/Rapnunu/ResCutes.git
cd ResCutes
git checkout develop
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open the app at [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in values locally. **Never commit `.env.local` or real secrets.**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string. Optional for local MVP work; required when database persistence is enabled. |
| `AUTH_SECRET` | Secret used by Auth.js to sign sessions. Generate a long random string for local development (for example with `openssl rand -base64 32`). |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token for map views on dashboard and mobile. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for photo uploads. Optional if you are not testing upload flows. |

If maps or uploads are not configured, some UI features may be limited, but core demo workflows still run with seeded data.

---

## Demo accounts

All demo accounts use password **`demo1234`**.

| Email | Role |
|-------|------|
| `citizen@rescutes.demo` | Citizen |
| `rescuer@rescutes.demo` | Rescuer |
| `staff@rescutes.demo` | Shelter staff |
| `vet@rescutes.demo` | Veterinarian |
| `admin@rescutes.demo` | Administrator |

---

## Demo data and persistence

The MVP uses an **in-memory demo store** backed by `globalThis` in `src/lib/data/demo-store.ts`. Data survives across requests during a single dev server session but **resets when the server restarts**.

- Data created on one developer machine is **not** shared with teammates automatically.
- Neon migration and shared database seeding are **deferred**; Drizzle schema and scripts exist for a future milestone.

For repeatable demos, use the seeded accounts and cases (for example Luna) or follow the workflow from a fresh report.

---

## Useful commands

```powershell
npm run dev          # Start dev server (auto-fixes broken .next, blocks double-start)
npm run dev:clean    # Force-delete .next then start dev
npm run dev:webpack  # Dev without Turbopack (fallback if Turbopack misbehaves)
npm run lint         # Run ESLint
npm test             # Run Vitest unit/integration tests
```

Other scripts in `package.json` (for example `npm run test:watch`, `npm run db:push`, `npm run db:seed`) are for database work and extended testing when that milestone is active.

---

## Dev server / `.next` cache

If the app shows unstyled HTML, 404s on `/_next/static/...`, or `ENOENT` errors for `routes-manifest.json`, the `.next` folder is usually corrupted.

**Common causes**

1. **Two dev servers** on the same project (e.g. port 3000 and 3001) - only run one `npm run dev`.
2. **`npm run build` while dev is running** - `npm run build` now refuses if port 3000 is in use.
3. **Deleting `.next` while dev is still running** - stop dev first (`Ctrl+C`), then clean.

`npm run dev` automatically removes a broken `.next` on startup. Use `npm run dev:clean` only when you want a full reset.

---

## Build warning

**Do not run `npm run build` while `npm run dev` is running.** The build script blocks this when port 3000 is in use.

If you need to test a production build:

1. Stop the dev server (`Ctrl+C`)
2. Run `npm run build`
3. Restart with `npm run dev` (no manual `.next` delete needed in most cases)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch strategy, commit conventions, pull requests, and team workflow.
