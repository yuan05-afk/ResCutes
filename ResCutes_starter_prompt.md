# ResCutes — AI Coding Agent Starter Prompt

## How to Use This File
Paste this entire file as the first message to an AI coding agent (Claude Code, Cursor, v0, bolt.new, Lovable, or similar) to bootstrap the ResCutes hackathon project. This is the **entry point**, not the full spec — a complete 38-section Product Requirements Document exists alongside this prompt and should be provided to the agent as a second reference document before deep feature work begins. This prompt exists so the agent can start scaffolding immediately without waiting on that full read-through.

Do not let the agent expand scope beyond what's listed here. If something is ambiguous, the agent should default to the simplest implementation and flag the assumption rather than invent new features.

---

## 1. Project Snapshot

**Name:** ResCutes
**Positioning:** ResCutes connects citizens, rescuers, shelters, and veterinarians through one coordinated workflow — from animal reporting to safe shelter intake and medical clearance.

**What it is NOT:** a veterinary diagnosis tool, a prescription system, an adoption marketplace, or a social media app. Do not build toward any of these.

**Two interfaces, one shared codebase:**
1. **ResCutes Mobile** — installable, responsive PWA for citizens and rescuers.
2. **ResCutes Web** — desktop operations dashboard for shelter staff and authorized veterinarians.

No separate native Android or iOS app. Ever, in this MVP.

---

## 2. Tech Stack (locked in — do not substitute without asking)

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui (or equivalent accessible primitives) |
| Mobile | Installable responsive PWA (not a native codebase) |
| Database | Neon PostgreSQL 17, region: AWS Asia Pacific 1 (Singapore) |
| ORM | Drizzle ORM |
| Validation | Zod |
| Auth | Auth.js, role-based authorization stored in Neon |
| File storage | Vercel Blob (animal/rescue photos) |
| Maps | **Mapbox GL JS (Mapbox API)** — see note below |
| Charts | Recharts (limited dashboard use only) |
| Unit tests | Vitest |
| E2E tests | Playwright |
| Deployment | Vercel only, server execution as close to Singapore as the platform supports |

**Mapbox note:** The original PRD specifies MapLibre/Leaflet with OpenStreetMap tiles. This build uses **Mapbox** instead. Use `mapbox-gl` (or `react-map-gl` as a thin wrapper) for the map components on both the mobile Nearby Cases screen and the web dashboard's live rescue map. Store the token as `NEXT_PUBLIC_MAPBOX_TOKEN` in environment variables — never hardcode it. Use Mapbox's own geocoding/distance utilities where the PRD calls for distance/travel-time estimates, and keep the map component isolated behind a thin wrapper so the tile provider could be swapped later without touching business logic.

**Explicitly do not introduce:** a separate backend repo, microservices, Kubernetes, a native mobile codebase, a second database, blockchain, or event-streaming infrastructure. Prefer server actions, route handlers, and controlled polling over real-time infra.

---

## 3. Monorepo & Environment Setup

Single Next.js monorepo. First scaffolding tasks for the agent:

1. Initialize Next.js (App Router) + TypeScript strict + Tailwind + shadcn/ui.
2. Set up Drizzle ORM pointed at a Neon Postgres 17 instance (Singapore region).
3. Set up Auth.js with role-based session claims (roles defined in Section 5 below).
4. Add `mapbox-gl` and wire a `<MapView>` wrapper component reading `NEXT_PUBLIC_MAPBOX_TOKEN`.
5. Configure Vercel Blob for photo uploads with file-type and size restrictions.
6. Set up Vitest and Playwright with a placeholder passing test each, so CI is green from commit one.
7. Create `.env.example` covering at minimum: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `BLOB_READ_WRITE_TOKEN`.

---

## 4. Core Workflow (every feature must map to a step in this chain)

```
Report Animal
  → Verify Report
  → Calculate Rescue Urgency
  → Assign Rescuer
  → Recommend Shelter
  → Rescue Animal
  → Confirm Shelter Handoff
  → Create Animal Record
  → Record Medical Examination
  → Update Medical Clearance
  → Complete Case
```

If a proposed feature doesn't sit on this chain, it doesn't belong in the MVP — flag it instead of building it.

---

## 5. Roles (build RBAC around exactly these five)

- **Citizen** — submit reports, track own cases, receive status updates.
- **Rescuer** — view/accept/decline assignments, navigate, update status, request placement, confirm handoff.
- **Shelter Staff** — verify/reject/dedupe reports, confirm urgency, assign rescuers, pick final shelter, confirm intake, manage animal records.
- **Authorized Veterinarian** — record exams, set medical priority/clearance, restricted to medical fields only.
- **Administrator** — manage shelters, users/roles, capacity, capabilities, view audit logs.

Exact coordinates and medical notes are role-restricted — never exposed to Citizens or the public.

---

## 6. MVP Surface Map

### Mobile PWA screens
Mobile Home · Nearby Cases · Report an Animal · My Cases · Case Details · Rescuer Assignment Details · Profile.
Bottom nav: Home, Nearby, elevated center **Report** button (primary action), Cases, Profile.

### Web dashboard routes
- `/` — landing page + demo access
- `/dashboard` — operations overview
- `/rescue-cases` — list + filters
- `/rescue-cases/[id]` — full case profile
- `/animals` — animal list
- `/animals/[id]` — combined profile (info, rescue history, intake, medical handoff/clearance, behavior notes, pathway, recommended next action)
- `/settings` — shelter capacity/capability config

Do not create separate pages for Foster, Adoptions, Long-Stay, Pathways, Vet Scheduling, or Advanced Analytics — fold pathway info into the Animal Profile page.

---

## 7. Explainable Scoring Engines

### Rescue Urgency Score (0–100, rules-based, not ML)
- Visible injury severity: 0–35
- Immediate environmental danger: 0–30
- Animal vulnerability: 0–20
- Time waiting after verification: 0–15

Levels: Critical 80–100, High 60–79, Medium 30–59, Low 0–29.
Must show a plain-language breakdown of the score. Staff can override with a **required** reason, logged to the audit trail. Score supports staff judgment — it never auto-decides.

### Capacity & Capability Routing Engine (0–100 match score)
- Required medical capability match: 35%
- Available shelter capacity: 25%
- Species compatibility: 20%
- Distance / travel time: 15%
- Current operational workload: 5%

Every recommendation must display: shelter name, match score, distance, available capacity, species accepted, relevant capabilities, reasons for the recommendation, and any warnings. Staff make the final call; rejecting the top recommendation requires a reason. Define deterministic fallback behavior for: no shelter with capacity, no shelter with the capability, missing location, uncomputable distance, all matches rejecting intake.

---

## 8. Data Model — Minimum Required Tables

Users, User Roles, Shelters, Shelter Capabilities, Shelter Capacity, Rescue Reports, Rescue Cases, Case Photos, Case Status History, Rescuer Assignments, Shelter Recommendations, Shelter Handoffs, Animals, Medical Clearances, Animal Notes, Notifications, Audit Logs.

Ask the agent to produce a Drizzle schema plus a Mermaid ER diagram before writing any UI that touches persistence.

---

## 9. Explicitly Out of Scope — Do Not Build

Adoption marketplace/applications, foster matching, predictive abandonment maps, city-scale digital twins, reporter reputation graphs, facial recognition, automatic duplicate-image detection, pain/gait/bioacoustic diagnosis, veterinary dosage calculation or AI diagnosis, AI medical imaging, ambient veterinary scribe, medication reminders, client vet portal, clinic scheduling, staff burnout prediction, native Android/iOS apps, public real-time chat, payments, donations, social feed.

These belong only in a "Future Opportunities" note — never in a sprint.

---

## 10. Design Tokens

```
Deep evergreen:  #183C35
Warm bone:       #F5F3ED
White:           #FFFFFF
Graphite:        #202825
Muted sage:      #9DB7A9
Rescue red:      #C7513A
Warning ochre:   #C9912F
```
Tone: modern, professional, warm, humane, operational, trustworthy — not cute, not a generic AI dashboard. Never communicate urgency/priority through color alone; pair with a text label. WCAG 2.2 AA minimum.

---

## 11. Suggested Build Order (four parallel workstreams)

1. **Shared foundation & database** — schema, auth, seed data, shared UI primitives, Mapbox wrapper.
2. **Mobile reporting & case tracking** — Report flow, Nearby Cases map, My Cases, Case Details.
3. **Web operations dashboard** — Dashboard, Rescue Cases list/profile, Animals list/profile, Settings.
4. **Routing engine, scoring, testing, deployment** — urgency scoring, shelter routing engine, Vitest/Playwright coverage, Vercel deployment, demo data + Luna demo scenario.

Workstream 1 blocks the other three on schema and auth — land it first, even partially, then unblock in parallel.

---

## 12. Guardrails for the Agent

- Do not add features beyond this scope, even ones that seem obviously useful.
- Do not silently swap the tech stack choices above.
- Do not turn any veterinary field into a diagnosis/prescription feature.
- Do not expose exact coordinates or medical notes to unauthorized roles.
- When a requirement is ambiguous, pick the simplest implementation and say so — don't ask for a planning meeting.
- Treat this prompt as the map, not the territory: for exact copy, field-by-field validation rules, full API contracts, and acceptance criteria, consult the full PRD document once it's provided.
