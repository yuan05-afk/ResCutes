# ResCutes

ResCutes connects citizens, rescuers, shelters, and veterinarians through one coordinated workflow from animal reporting to safe shelter intake and medical clearance.

The app has two interfaces from one codebase:

- **Mobile (PWA)** - citizens report animals and track cases; rescuers accept assignments and update rescue progress.
- **Web dashboard** - shelter staff verify cases, assign rescuers, route to shelters, complete intake; veterinarians record examinations and medical clearance.

This is a hackathon MVP. Web dashboard and mobile (`/mobile`) share one Next.js app, Neon PostgreSQL, and Neon Auth.

---

## Technology stack

| Area | Technology |
|------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS, Radix UI |
| Auth | Neon Auth (`@neondatabase/auth`) |
| Database | Neon PostgreSQL, Drizzle ORM |
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
| `DATABASE_URL` | Neon PostgreSQL connection string. **Required** for web and mobile data. |
| `NEON_AUTH_BASE_URL` | Neon Auth project URL (from Neon console). **Required** for login. |
| `NEON_AUTH_COOKIE_SECRET` | Cookie signing secret for Neon Auth sessions. Generate a long random string. |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token for dashboard and mobile maps. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for report photo uploads. Recommended in production. |

If maps or uploads are not configured, some UI features may be limited.

---

## Deploy on Vercel

Web and mobile ship from the same Next.js project (`/` dashboard, `/mobile` app). One Vercel project covers both.

1. Push this repo to GitHub.
2. In Vercel: **Add New Project** → import the repo → Framework Preset **Next.js** → Root Directory `.`
   - Install/authorize the [Vercel GitHub App](https://github.com/apps/vercel) on the repo owner if prompted.
   - Set the Production Branch to the branch you ship from (`main` or `develop`).
3. Set Environment Variables (Production + Preview) to match `.env.example`:
   - `DATABASE_URL`
   - `NEON_AUTH_BASE_URL`
   - `NEON_AUTH_COOKIE_SECRET`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `BLOB_READ_WRITE_TOKEN` (create a Blob store in the Vercel project if needed)
4. In **Neon Auth** console, add your Vercel production URL (and preview URLs if you use them) to **trusted domains / allowed origins**.
5. Deploy. After the first production URL is known, confirm login works on `/login`, `/dashboard`, and `/mobile`.

`vercel.json` targets the Singapore region (`sin1`) for lower latency in the Philippines. Node **20+** is required (`engines` in `package.json`).

Local production check (stop `npm run dev` first):

```powershell
npm run build
npm run start
```

One Vercel project serves both surfaces:

| Surface | Path |
|---------|------|
| Web dashboard | `/dashboard`, `/rescue-cases`, `/animals`, … |
| Mobile app | `/mobile`, `/mobile/report`, `/mobile/cases`, … |
---

## Demo accounts

All demo accounts use password **`demo1234`**.

A 2-minute Recordly script for hackathon judges is in [docs/hackathon-demo-2min.md](docs/hackathon-demo-2min.md).

| Email | Role |
|-------|------|
| `citizen@rescutes.demo` | Citizen |
| `rescuer@rescutes.demo` | Rescuer |
| `staff@rescutes.demo` | Shelter staff |
| `vet@rescutes.demo` | Veterinarian |
| `admin@rescutes.demo` | Administrator |

---

## Demo data and persistence

Application data is stored in **Neon PostgreSQL** via Drizzle (`src/lib/data/db/repository.ts`). Set `DATABASE_URL` locally and on Vercel.

Use `npm run db:push` / `npm run db:migrate` and `npm run db:seed` when setting up a fresh database. Demo accounts and sample cases come from seed scripts.

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
