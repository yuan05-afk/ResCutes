# ResCutes — Full QA & System Audit Report

**Target:** https://rescutes.vercel.app/  
**Auditor:** QA & System Auditor  
**Audit date:** 8 September 2026 (Asia/Manila)  
**Scope:** Authentication/session, CRUD across modules, form validation & edge cases, UI/UX responsiveness & consistency, staff vs veterinarian capability split  
**Policy:** Detection only — no application source code was modified  
**Environment:** Production demo on Vercel (Next.js / PWA)

---

## 1. Executive Summary & Audit Score

### Overall score: **64 / 100** — *Needs hardening before production*

ResCutes tells a clear Philippine animal-rescue story (report → rescue → medical → adoption). Demo Access is excellent for evaluators, unauthenticated route guards work, sessions persist across refresh, XSS-like input was escaped, and Staff vs Veterinarian medical permissions are correctly differentiated.

The biggest gaps are **broken web Create routes**, **incomplete rescue status controls vs UI copy**, **porous mobile access for web roles**, **validation holes** (empty animal names), and **serious narrow-viewport overflow** on core operations tables (`/rescue-cases`, `/medical`).

| Area | Score | Notes |
|------|------:|-------|
| Auth & session | 82 | Strong redirects/logout; staff/vet↔mobile gate weak |
| Authorization (RBAC) | 78 | Staff medical view-only vs vet actions is good; mobile still open to both |
| CRUD completeness | 50 | Read strong; Create broken on Animals & Rescue Cases |
| Validation & errors | 58 | Solid mobile report gates; weak animal name / stale errors |
| UI/UX desktop | 76 | Polished landing & dashboard at wide widths |
| Responsiveness | 48 | Critical horizontal overflow on key ops pages |
| Resilience / polish | 70 | XSS escaped; unbranded 404s; blank titles |

### Top blockers (fix first)
1. `/animals/new` and `/rescue-cases/new` throw unhandled server exceptions.  
2. Empty animal **Name** saves and becomes a generated ID.  
3. Rescue detail copy promises status/routing updates that are only partially implemented.  
4. `/rescue-cases` and `/medical` break badly at narrow widths (content clipped / off-screen).  
5. Shelter Staff & Veterinarian can use full `/mobile` (including Report an animal).

---

## 2. Critical & Minor Bugs

Severity: **Critical** · **Major** · **Minor** · **Cosmetic**

### BUG-01 — Animal & Rescue Case Create routes crash
- **Severity:** Major (Critical if Create is required for ops/demo completeness)
- **Module:** Animals, Rescue Cases
- **Steps to reproduce:**
  1. Sign in as `admin@rescutes.demo` / `demo1234`
  2. Open `https://rescutes.vercel.app/animals/new`
  3. Open `https://rescutes.vercel.app/rescue-cases/new`
- **Expected:** Create forms render; list pages offer Create CTAs
- **Actual:** Unhandled server-side exception pages; list views lack Create buttons
- **Impact:** Web operators cannot create animals or cases via dedicated routes

### BUG-02 — Empty animal name accepted; silent rename to generated ID
- **Severity:** Major
- **Module:** Animals (Update)
- **Steps:**
  1. Edit an animal (e.g. Rocky)
  2. Clear Name → Save
- **Expected:** Validation error requiring a name
- **Actual:** Save succeeds; name becomes generated ID (observed `A-26-012`); restored to Rocky after probe
- **Impact:** Data integrity and adoption listing confusion

### BUG-03 — Rescue status / verify / dispatch incomplete vs UI copy
- **Severity:** Major
- **Module:** Rescue Cases
- **Steps:** Open verified / with-rescuer case detail; compare copy (“Update case status and routing”) to controls
- **Expected:** Clear verify, dispatch, and stage transitions
- **Actual (Admin):** Assignment, notes, urgency override, shelter destination — verify/dispatch/status transitions not clearly exposed  
- **Actual (Staff):** Verify/Reject controls seen but initially disabled; no Dispatch control visible
- **Impact:** Advertised coordination workflow cannot be completed end-to-end on web

### BUG-04 — Shelter Staff & Veterinarian can access full mobile app
- **Severity:** Major (product / AuthZ consistency)
- **Steps:** Sign in as staff or vet → visit `/mobile`
- **Expected:** Web roles land on dashboard; mobile field app limited to citizen/rescuer (unless dual-role is intentional and documented)
- **Actual:** Full mobile nav including Report an animal & Cases. Admin mobile via “Open mobile app” looks intentional.
- **Impact:** Role-model blur; staff can file citizen-style reports

### BUG-05 — Narrow viewport: Rescue Cases table horizontally overflows
- **Severity:** Major (UI/UX)
- **Module:** `/rescue-cases`
- **Steps:** View Rescue Cases at narrow width
- **Expected:** Responsive table (card stack, horizontal scroll container, or priority columns)
- **Actual:** Table columns / urgency content clipped; horizontal overflow
- **Impact:** Field-adjacent or laptop-narrow ops unusable

### BUG-06 — Narrow viewport: Medical keeps two-column layout; detail off-screen
- **Severity:** Major (UI/UX)
- **Module:** `/medical`
- **Steps:** Open Medical at narrow width
- **Expected:** Single-column stack
- **Actual:** Two-column layout retained; detail content off-screen
- **Impact:** Vets on smaller screens cannot use primary clinical UI

### BUG-07 — Medical examination can start without clinical notes (Vet)
- **Severity:** Minor (clinical quality)
- **Module:** Medical
- **Observation:** Veterinarian sees Start examination / Needs treatment / Mark medically cleared; clinical notes not required; Start enabled with default pending condition and blank notes (not submitted during audit)
- **Staff contrast:** Medical is **view-only** for Shelter Staff (no Start/clearance) — good RBAC split

### BUG-08 — Rescuer map severity filters unusable
- **Severity:** Minor → Major for field UX
- **Module:** Mobile map (Rescuer)
- **Actual:** Hide Critical / Hide High / Hide Cases exist in DOM (~y=-2) but clicks intercepted by outer mobile-frame shell; Shelters/Cases toggles work

### BUG-09 — Animals & Adoption cramped / clipped at narrow widths
- **Severity:** Minor
- **Modules:** `/animals` (cramped overflow), `/adoption` (tabs clip; “Applications” truncated)

### BUG-10 — Landing hero poorly framed on narrow viewports
- **Severity:** Minor
- **Actual:** Hero content obscured / pushed below initial viewport on narrow layout

### BUG-11 — Stale validation on report description
- **Severity:** Minor
- **Module:** Mobile Report
- **Actual:** After fixing a short description, prior “≥10 characters” error can remain until Continue is pressed again

### BUG-12 — Mobile sign-out visual lag
- **Severity:** Minor
- **Actual:** Profile may remain visible until navigation; protected routes correctly redirect to `/login`

### BUG-13 — Unbranded Next.js 404; `/sign-in` dead
- **Severity:** Minor / Cosmetic
- **Steps:** Open `/sign-in` or `/this-page-does-not-exist`
- **Actual:** Default “This page could not be found.” No `/sign-in` → `/login` alias

### BUG-14 — Blank browser title on rescue detail
- **Severity:** Cosmetic

### BUG-15 — Case card truncation; lazy image gray flash
- **Severity:** Cosmetic
- **Module:** Mobile Cases — IDs like `RC-26-…` clipped; images briefly blank gray

### Positive security / quality notes
- Citizen report containing literal `<script>alert(1)</script>` **rendered escaped** (case `RC-2026-9814`).
- Unauthenticated protected routes **307 → `/login`**.
- Headers: HSTS, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/geolocation). **No CSP** observed. `Access-Control-Allow-Origin: *` on document responses — review if APIs are same-origin only.
- Delete animal confirmation warns related medical/adoption records will be removed; cancel works.
- Skip-to-content link and visible focus styling present.
- Landing ↔ app brand (evergreen `#183C35`, typography) consistent.

---

## 3. UI/UX & Functional Inconsistencies

### Information architecture
| Observation | Detail |
|-------------|--------|
| Create IA broken | Marketing/ops imply full CRUD; Create deep links crash; no list CTAs |
| Role messaging vs behavior | Login: mobile roles → field app, web → dashboard; staff/vet still get `/mobile` |
| Dual badges | Admin profile shows Administrator **and** Shelter Staff |
| No user admin UI | `/users`, `/admin` not exposed |
| Adoption | Approve/Reject present; no publish/unpublish |
| Mobile profile | Read + sign out only — no edit |
| Demo footer copy | States no sample rescue cases loaded; dashboard still shows seeded ops data — reconcile messaging |

### Responsiveness matrix (narrow viewport)
| Page | Result |
|------|--------|
| `/login`, `/dashboard`, `/shelters`, `/mobile` | No major blocking overlap |
| `/rescue-cases` | **Fail** — horizontal overflow / clipped columns |
| `/medical` | **Fail** — two-column; detail off-screen |
| `/animals` | Partial — cramped overflow |
| `/adoption` | Partial — tab clip / truncated label |
| `/` landing | Partial — hero below fold / obscured |
| `/settings` | Low — shelter carousel clip; long heading wrap |

### Validation catalog
| Context | Behavior |
|---------|----------|
| Login empty | Native “Please fill out this field.” |
| Login bad email | Native missing `@` |
| Login bad password | “Invalid email or password. Use demo1234 for seeded demo accounts.” |
| Report no location | “Please capture location before continuing.” |
| Report short description | “Please add a short description (at least 10 characters).” |
| Report photo | Optional (explicit copy) |
| Geolocation denied | Manual lat/long fallback |
| Rescuer decline | Reason required |
| Animal empty name | **No error** — generates ID (BUG-02) |

### Staff vs Veterinarian (confirmed)
| Capability | Shelter Staff | Veterinarian |
|------------|---------------|--------------|
| Medical list/read | Yes | Yes |
| Start examination | No (view-only) | Yes |
| Needs treatment | No | Yes |
| Mark medically cleared | No | Yes |
| Rescue Verify/Reject | Present (initially disabled in sample) | — |
| Dispatch control | Not visible | — |
| `/mobile` access | Yes | Yes |

---

## 4. Strategic Recommendations

### Additions
1. Working **Create** flows for Animals & Rescue Cases (server forms + list CTAs + tests).  
2. Explicit **case status machine** UI: Report → Verified → Assigned → Secured → Intake → Medical → Adoption.  
3. **Role-gated mobile** for staff/vet (block or limited “field mode”).  
4. Required **clinical notes** (min length) before exam start / clearance.  
5. Responsive **card layouts** for Rescue Cases, Medical, Animals, Adoption under `md` breakpoints.  
6. Branded **404** + `/sign-in` → `/login` redirect.  
7. **CSP** (+ review `ACAO *`).  
8. Password visibility toggle; inline (non-native-only) login errors.  
9. Optional **Users** admin for shelter roster.  
10. Adoption **publish** controls + public SEO pages if product needs discovery.  
11. PWA offline draft for `/mobile/report` (manifest already targets `/mobile`).

### Improvements
1. Validate animal name on blur/submit; never auto-rename silently without confirmation.  
2. Fix rescuer severity filter hit-testing inside mobile frame.  
3. Clear stale client validation as soon as input becomes valid.  
4. Reconcile Admin dual-role badge with real permissions.  
5. Align demo footer copy with seeded dashboard data.  
6. Differentiate Staff vs Vet nav labels if Medical is the only split; else document capability flags.  
7. Enable Staff Verify/Reject when prerequisites met; surface why disabled (tooltip).  
8. Add regression tests: Create routes, empty name, XSS escape, narrow `/medical` & `/rescue-cases`.

### Removals / simplifications
1. Hide/remove dead Create URLs until fixed.  
2. Remove or rewrite misleading “Update case status and routing” until controls ship.  
3. In production builds, drop demo password hint from **login error** strings (keep on Demo Access panel only).  
4. Consider simplifying duplicate Demo Access entry points if analytics show bounce/confusion.

---

## 5. Full Checklist of Tested Endpoints & Flows

### Public & infra
| Item | Result |
|------|--------|
| `/` landing (hero, How it works, Demo Access, Terms) | Pass |
| `/login` + demo picker + `?email=` | Pass |
| `/terms` | Pass |
| `/sign-in` | Fail — unbranded 404 |
| Unknown path 404 | Fail — unbranded Next.js 404 |
| `/sitemap.xml` | Pass (/, /login, /terms) |
| `/robots.txt` | Pass |
| `/manifest.json` | Pass (`start_url: /mobile`) |
| `/og.jpg`, favicons, icons | Pass |
| Unauth protected routes | Pass — 307 → `/login` |

### Auth matrix
| Role | Landing | `/dashboard` | `/mobile` | Refresh | Logout |
|------|---------|--------------|-----------|---------|--------|
| Citizen | `/mobile` | Unauthorized | OK | Pass | Pass |
| Rescuer | `/mobile` | Unauthorized | OK | Pass | Pass |
| Shelter Staff | `/dashboard` | OK | **Open** | Pass | Pass |
| Veterinarian | `/dashboard` | OK | **Open** | Pass | Pass |
| Administrator | `/dashboard` | OK | OK (explicit) | Pass | Pass |

### Web CRUD (Administrator unless noted)
| Module | C | R | U | D | Notes |
|--------|---|---|---|---|-------|
| Dashboard | N/A | Pass | N/A | N/A | Widgets/queues OK |
| Rescue Cases | **Fail** | Pass | Partial | N/A | Create crash; status incomplete |
| Animals | **Fail** | Pass | Partial | Partial | Create crash; empty name; delete confirm OK |
| Medical | N/A | Pass | Partial | N/A | Vet actions; notes optional |
| Adoption | N/A | Pass | Partial | N/A | Approve/Reject; no publish |
| Shelter Map | N/A | Pass | N/A | N/A | Filters/search OK |
| Settings | N/A | Pass | Pass | N/A | Capacity bounds |
| Profile | N/A | Pass | Partial | N/A | Dual badges |
| Users/Admin | N/A | N/A | N/A | N/A | Not exposed |

### Mobile
| Flow | Result |
|------|--------|
| Map / nearest | Pass (rescuer severity filters broken) |
| Report create | Pass — **RC-2026-9814** → `/mobile/cases/39b50c34-2ef2-41d7-915f-e256d8d4964b` |
| Report validation | Pass (location, description); photo optional; manual coords |
| Cases list/detail | Pass |
| Rescuer assignments | Pass UI (Accept/Decline; decline reason required; not submitted) |
| Adoption browse / apply validation | Pass (destructive apply not completed) |
| Profile | Pass read/sign-out; no edit |

### Edge cases
| Case | Result |
|------|--------|
| XSS-like script in description | Escaped / safe |
| Special-character search | Safe empty state |
| Wrong password | Clear error |
| Delete cancel | Pass |
| Geolocation denied | Manual fallback |
| Narrow ops tables | Fail (BUG-05, BUG-06) |

---

## Appendix A — Demo accounts

| Name | Role | Email | Password |
|------|------|-------|----------|
| Maria Santos | Citizen | citizen@rescutes.demo | demo1234 |
| James Chen | Rescuer | rescuer@rescutes.demo | demo1234 |
| Sarah Lim | Shelter Staff | staff@rescutes.demo | demo1234 |
| Dr. Anita Rao | Veterinarian | vet@rescutes.demo | demo1234 |
| Alex Wong | Administrator | admin@rescutes.demo | demo1234 |

## Appendix B — Audit artifacts & method
- **QA-created case:** `RC-2026-9814` (Needs review) — includes marker `QA Audit Sep8`; safe to delete on demo reset  
- **Animal name probe:** Rocky temporarily `A-26-012`, **restored to Rocky**  
- **Not finalized on seed data:** adoption Approve/Reject, medical clearance submits, rescuer Accept / Mark Animal Secured  
- **Method:** Browser end-to-end against production demo + HTTP probes for redirects/headers/assets  
- **Policy:** Detection only; no source changes

---

*Report complete — 8 September 2026.*
