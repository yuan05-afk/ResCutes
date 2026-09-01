# 🐾 ResCutes

**ResCutes** is a coordinated animal rescue and shelter-routing platform that connects citizens, volunteer rescuers, shelter staff, and veterinarians through one end-to-end workflow.

> **ResCutes is currently a hackathon MVP.**  
> The project focuses on demonstrating a complete, transparent, and role-based animal rescue workflow from initial reporting to shelter intake, veterinary clearance, and continued shelter care.

---

## Overview

Animal rescue coordination often involves disconnected communication between citizens, rescuers, shelters, and veterinary teams.

ResCutes brings these processes together into one platform.

```text
Report Animal
      ↓
Verify Case
      ↓
Calculate Rescue Urgency
      ↓
Assign Rescuer
      ↓
Rescue Animal
      ↓
Recommend Shelter
      ↓
Shelter Handoff
      ↓
Shelter Intake
      ↓
Create Animal Record
      ↓
Veterinary Examination
      ↓
Treatment / Follow-Up
      ↓
Medical Clearance
      ↓
Behavior Assessment
```

The platform uses a single Next.js codebase with two responsive interfaces:

### 📱 Mobile PWA

Designed for:

- Citizens
- Volunteer rescuers

Citizens can:

- Report stray or injured animals
- Submit animal photos
- Capture the report location
- Describe visible condition and environmental danger
- Select a preferred contact method
- Track rescue-case progress

Rescuers can:

- Receive rescue assignments
- Accept or decline assignments
- Start rescue operations
- Mark animals as secured
- Request shelter placement
- Complete shelter handoff

### 🖥️ Web Operations Dashboard

Designed for:

- Shelter Staff
- Authorized Veterinarians
- Administrators

Staff can:

- Review rescue reports
- Verify or reject cases
- Detect duplicate cases
- Review rescue urgency
- Assign available rescuers
- Review shelter recommendations
- Confirm shelter destinations
- Record shelter handoff
- Complete shelter intake
- Manage animal records
- Monitor shelter operations

Veterinarians can:

- Start veterinary examinations
- Record medical condition and priority
- Mark animals as under treatment
- Schedule veterinary follow-ups
- Record care restrictions
- Complete medical clearance

---

# ✨ Core Features

## Rescue Urgency Scoring

ResCutes calculates a transparent rescue urgency score from **0–100**.

The score considers:

| Factor | Maximum |
|---|---:|
| Visible Injury Severity | 35 |
| Environmental Danger | 30 |
| Animal Vulnerability | 20 |
| Waiting Time After Verification | 15 |

Urgency levels:

| Score | Level |
|---|---|
| 80–100 | Critical |
| 60–79 | High |
| 30–59 | Medium |
| 0–29 | Low |

The system displays the individual factors contributing to the score instead of presenting an unexplained number.

---

## Shelter Recommendation Engine

When an animal needs shelter placement, ResCutes ranks compatible shelters using operational factors.

| Factor | Weight |
|---|---:|
| Medical Capability | 35% |
| Available Capacity | 25% |
| Species Compatibility | 20% |
| Distance / Travel Time | 15% |
| Operational Workload | 5% |

Recommendations also explain:

- available shelter spaces
- species compatibility
- medical capabilities
- distance
- missing capabilities
- operational workload

This keeps routing decisions transparent for shelter staff.

---

## Role-Based Access

ResCutes currently supports five roles:

| Role | Primary Interface |
|---|---|
| Citizen | Mobile PWA |
| Rescuer | Mobile PWA |
| Shelter Staff | Web Dashboard |
| Authorized Veterinarian | Web Dashboard |
| Administrator | Web Dashboard |

Permissions are enforced server-side.

Sensitive information such as exact rescue coordinates and veterinary notes is restricted based on role.

---

## Veterinary Workflow

Animal medical care is tracked separately from rescue-case status.

```text
Awaiting Examination
        ↓
Under Examination
        ↓
Under Treatment
        ↓
Follow-Up Required
        ↓
Medically Cleared
        ↓
Behavior Assessment
```

Veterinary records can contain:

- General condition
- Medical priority
- Examination notes
- Treatment summary
- Care restrictions
- Follow-up date
- Veterinary notes
- Veterinarian attribution

Only users with appropriate permissions can modify veterinary records.

---

# 🛠️ Technology Stack

| Area | Technology |
|---|---|
| Framework | Next.js 15 |
| Architecture | App Router |
| Language | TypeScript |
| Frontend | React |
| Styling | Tailwind CSS |
| UI Components | Radix / shadcn-style primitives |
| Authentication | Auth.js |
| ORM | Drizzle ORM |
| Database | Neon PostgreSQL |
| Maps | Mapbox |
| File Storage | Vercel Blob |
| Charts | Recharts |
| Unit / Integration Testing | Vitest |
| End-to-End Testing | Playwright |
| Deployment | Vercel |

---

# 🚀 Getting Started

## Requirements

Install the following first:

- [Node.js](https://nodejs.org/) — LTS recommended
- npm
- Git

---

## 1. Clone the Repository

```powershell
git clone https://github.com/Rapnunu/ResCutes.git
cd ResCutes
```

---

## 2. Switch to the Development Branch

The latest shared development version is maintained on:

```text
develop
```

Run:

```powershell
git checkout develop
git pull
```

---

## 3. Install Dependencies

```powershell
npm install
```

---

## 4. Create Your Environment File

Copy the included environment template:

```powershell
Copy-Item .env.example .env.local
```

Never commit `.env.local`.

---

## 5. Configure Environment Variables

The project uses the following environment variables:

```env
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_MAPBOX_TOKEN=
BLOB_READ_WRITE_TOKEN=
```

### `DATABASE_URL`

Neon PostgreSQL connection string.

Database persistence is not yet used for the primary hackathon development workflow.

### `AUTH_SECRET`

Secret used by Auth.js.

Use a secure random value for development.

### `NEXT_PUBLIC_MAPBOX_TOKEN`

Public Mapbox token used by map interfaces.

### `BLOB_READ_WRITE_TOKEN`

Used when Vercel Blob-backed uploads are enabled.

Some integrations may remain unconfigured during local MVP development.

---

## 6. Start the Development Server

```powershell
npm run dev
```

Open:

[http://localhost:3000](http://localhost:3000)

---

# 🔐 Demo Accounts

All demo accounts use:

```text
Password: demo1234
```

| Role | Email |
|---|---|
| Citizen | `citizen@rescutes.demo` |
| Rescuer | `rescuer@rescutes.demo` |
| Shelter Staff | `staff@rescutes.demo` |
| Veterinarian | `vet@rescutes.demo` |
| Administrator | `admin@rescutes.demo` |

---

# 🧪 Testing

Run the automated test suite:

```powershell
npm test
```

Run ESLint:

```powershell
npm run lint
```

Before submitting changes, both should pass.

---

# ⚠️ Development Build Warning

Do **not** run:

```powershell
npm run build
```

while:

```powershell
npm run dev
```

is still running.

During development, running both processes simultaneously previously caused `.next` cache/chunk corruption.

If you need to test a production build:

### 1. Stop the development server

```text
Ctrl + C
```

### 2. Build

```powershell
npm run build
```

### 3. Delete the `.next` cache

```powershell
Remove-Item -Recurse -Force .next
```

### 4. Restart development

```powershell
npm run dev
```

---

# 💾 Current MVP Data Persistence

ResCutes currently uses an **in-memory demo data store** for the primary development workflow.

The implementation is located in:

```text
src/lib/data/demo-store.ts
```

The store uses `globalThis` so mutations generally survive route navigation and requests while the same Node.js development process remains active.

However:

- restarting the development server resets runtime mutations
- data created on one developer's computer is not automatically visible to another developer
- the shared PostgreSQL persistence layer is still a future milestone

Seeded demo records are provided so major workflows can still be demonstrated consistently.

---

# 🌏 Demo Geography

Current demo rescue data is located around **Metro Manila, Philippines**, including areas such as:

- Manila
- Quezon City
- Pasig
- Makati
- Mandaluyong
- Parañaque

Demo shelters include locations across Metro Manila.

---

# 🌿 Git Workflow

ResCutes uses the following branch structure:

```text
main
  ↑
develop
  ↑
feature/*
```

### `main`

Stable and demo-ready versions.

### `develop`

Latest integrated development work.

### `feature/*`

Individual features and tasks.

Examples:

```text
feature/veterinary-workflow
feature/behavior-assessment
feature/admin-dashboard
```

---

## Starting a Feature

Always start from the latest `develop`:

```powershell
git checkout develop
git pull
```

Create your feature branch:

```powershell
git checkout -b feature/my-feature
```

---

## Committing Changes

Check your work:

```powershell
git status
```

Stage it:

```powershell
git add .
```

Check again:

```powershell
git status
```

Commit:

```powershell
git commit -m "feat: add my feature"
```

Push:

```powershell
git push -u origin feature/my-feature
```

Then create a Pull Request:

```text
feature/my-feature
        ↓
      develop
```

Do not normally commit directly to `main` or `develop`.

For the complete team workflow, read:

👉 [CONTRIBUTING.md](CONTRIBUTING.md)

---

# 📝 Commit Convention

Common commit prefixes:

| Prefix | Purpose |
|---|---|
| `feat:` | New functionality |
| `fix:` | Bug fix |
| `refactor:` | Internal restructuring |
| `test:` | Test changes |
| `docs:` | Documentation |
| `chore:` | Tooling or maintenance |

Examples:

```text
feat: implement veterinary examination and medical clearance workflow

feat: complete rescue workflow through shelter intake

fix: prevent duplicate shelter intake

test: add veterinary workflow coverage

docs: add team onboarding guide
```

---

# 🔒 Never Commit

Do not commit:

```text
.env
.env.local
node_modules/
.next/
API keys
database passwords
authentication secrets
access tokens
```

Always review:

```powershell
git status
```

before committing.

---

# 📂 Project Documentation

Additional project documentation is available in the repository:

- `ResCutes_PRD.md`
- `ResCutes_starter_prompt.md`
- `CONTRIBUTING.md`

Use these documents as references when implementing new features or evaluating whether something is within the project scope.

---

# 🗺️ Current Development Status

Completed major workflows include:

- ✅ Authentication and role-based interfaces
- ✅ Citizen animal reporting
- ✅ Rescue urgency scoring
- ✅ Rescue case verification
- ✅ Rescuer assignment
- ✅ Rescuer mobile workflow
- ✅ Shelter recommendation engine
- ✅ Shelter handoff
- ✅ Shelter intake
- ✅ Animal record creation
- ✅ Veterinary examination
- ✅ Treatment and veterinary follow-up
- ✅ Medical clearance
- ✅ Animal and rescue operations dashboards

Currently being expanded:

- 🚧 Behavior assessment and post-medical shelter pathway
- 🚧 Administrative capabilities
- 🚧 Database persistence
- 🚧 Final integration and demo polish

---

# 🎯 Project Scope

ResCutes focuses on **rescue coordination and shelter operations**.

The hackathon MVP intentionally does not attempt to function as:

- a veterinary diagnosis system
- a prescription or medication recommendation system
- a replacement for licensed veterinarians
- a public adoption marketplace
- a native Android or iOS application

The citizen/rescuer experience is delivered as an installable responsive **Progressive Web App (PWA)**.

---

# 🤝 Contributing

Team members should read:

[CONTRIBUTING.md](CONTRIBUTING.md)

before implementing features.

The general workflow is:

```text
develop
   ↓
create feature branch
   ↓
implement
   ↓
test + lint
   ↓
commit
   ↓
push
   ↓
Pull Request
   ↓
develop
```

Keep each branch focused on one feature or milestone whenever possible.

---

## ResCutes

**Coordinating rescue from report to safe shelter care.** 🐾
