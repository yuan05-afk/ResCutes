# ResCutes

ResCutes connects citizens, rescuers, shelters, and veterinarians through one coordinated workflow—from animal reporting to safe shelter intake and medical clearance.

The app has two interfaces from one codebase:

- **Mobile (PWA)** — citizens report animals and track cases; rescuers accept assignments and update rescue progress.
- **Web dashboard** — shelter staff verify cases, assign rescuers, route to shelters, complete intake; veterinarians record examinations and medical clearance.

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
npm run dev      # Start local dev server (http://localhost:3000)
npm run lint     # Run ESLint
npm test         # Run Vitest unit/integration tests
```

Other scripts in `package.json` (for example `npm run test:watch`, `npm run db:push`, `npm run db:seed`) are for database work and extended testing when that milestone is active.

---

## Build warning

**Do not run `npm run build` while `npm run dev` is running.** This project previously hit `.next` chunk corruption when build and dev overlapped.

If you need to test a production build:

1. Stop the dev server (`Ctrl+C`)
2. Run `npm run build`
3. Delete the `.next` folder
4. Restart with `npm run dev`

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch strategy, commit conventions, pull requests, and team workflow.
