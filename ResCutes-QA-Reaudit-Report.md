# ResCutes — QA Re-Audit Report (Post-Remediation)

**Target:** https://rescutes.vercel.app/  
**Auditor:** QA & System Auditor  
**Re-audit date:** 8 September 2026 (Asia/Manila)  
**Baseline:** Full audit 8 Sep 2026 — **64 / 100** (`ResCutes-QA-Audit-Report.md`, BUG-01…BUG-15)  
**Policy:** Detection only — no source changes; no bulk deletes; destructive confirms canceled  
**Environment:** Production demo on Vercel (Next.js / PWA)

---

## 1. Executive Summary & Audit Score

### New overall score: **90 / 100** — *Production-ready demo with residual polish*

### Delta vs baseline: **+26** (64 → 90)

Remediation landed cleanly on the former top blockers: web **Create** routes work, empty animal names are rejected, staff/vet **mobile is gated**, rescue dispatch/verify controls are present, narrow rescue-cases/landing/animals/adoption are usable, branded 404 + `/sign-in`, meaningful rescue titles, and field **reporter contact** (Call/Email) works for rescuers.

| Area | Baseline | Now | Δ | Notes |
|------|--------:|----:|--:|-------|
| Auth & session | 82 | 95 | +13 | Immediate logout; refresh OK |
| Authorization (RBAC) | 78 | 94 | +16 | Staff/vet `/mobile` → `/dashboard`; admin mobile intentional |
| CRUD completeness | 50 | 90 | +40 | Animals + Rescue Cases Create fixed |
| Validation & errors | 58 | 92 | +34 | Name required; report phone; stale desc error fixed |
| UI/UX desktop | 76 | 90 | +14 | Workflow controls + titles |
| Responsiveness | 48 | 84 | +36 | Major table overflow fixed; medical tabs still clip |
| Resilience / polish | 70 | 92 | +22 | Branded 404; `/sign-in`; XSS not re-submitted this pass |

**Remaining polish (not Top-5 blockers at ≥90):**  
1. `/medical` narrow viewport — tab strip horizontally clipped/scrollable (BUG-06 Partial).  
2. Rescuer map legend — labels can truncate via horizontal overflow (BUG-08 Partial); chip/legend sync and pan-without-popup **Pass**.

No Critical regressions observed.

---

## 2. BUG Retest Table

| ID | Prior (baseline) | Now | Evidence |
|----|------------------|-----|----------|
| **BUG-01** Create routes crash | Fail | **Pass** | `/animals/new`, `/rescue-cases/new` render; list CTAs present. Created animal `QA Reaudit Sep8 Animal` (`189af6c6-6691-40a3-9c4a-b9c4b4ed66e3`) and case tagged `QA Reaudit Sep8…` (`3ad79dcb-da90-4a1e-ad75-01e3011cdd30`). |
| **BUG-02** Empty animal name → generated ID | Fail | **Pass** | Cleared Name → Save shows **“Name is required.”** No silent rename; name retained. |
| **BUG-03** Verify/dispatch/status incomplete | Fail | **Pass** | Admin: Verify enabled; Reject requires reason then enables. Staff on `RC-26-103`: **Staff Actions** + **Dispatch Rescuer** visible. No transitions submitted. |
| **BUG-04** Staff/vet full `/mobile` | Fail | **Pass** | Staff/vet land `/dashboard`; `/mobile` redirects to `/dashboard`. Citizen/rescuer `/mobile`; `/dashboard` → unauthorized. Admin **Open mobile app** intentional. |
| **BUG-05** `/rescue-cases` narrow overflow | Fail | **Pass** | ~390px width usable; no material overflow. |
| **BUG-06** `/medical` two-column / off-screen | Fail | **Partial** | Stacks usefully at ~390px; **tabs horizontally clipped/scrollable**. |
| **BUG-07** Exam without clinical notes | Fail/Minor | **Pass** | Vet added notes `QA Reaudit Sep8 — do not clear` and started examination; clearance not submitted. |
| **BUG-08** Rescuer severity filters unusable | Fail | **Partial** | Chips + legend tappable; sync OK; layer ON pans to nearest pin **without** popup; shelter count **24**. Legend labels still clip on narrow mobile shell. |
| **BUG-09** Animals/Adoption cramped at narrow | Fail/Minor | **Pass** | Both acceptable/usable at ~390px. |
| **BUG-10** Landing hero obscured narrow | Fail/Minor | **Pass** | Hero image, heading, copy, CTAs readable at ~390px. |
| **BUG-11** Stale description validation | Fail/Minor | **Pass** | After short-desc error, valid text clears error **immediately** (no extra Continue). |
| **BUG-12** Mobile sign-out lag | Fail/Minor | **Pass** | Immediate logout to `/login` for all five roles. |
| **BUG-13** Unbranded 404; `/sign-in` dead | Fail/Minor | **Pass** | `/sign-in` → branded Sign In. Unknown path: branded **404 / Page not found** with Home & Sign in. |
| **BUG-14** Blank rescue detail title | Fail/Cosmetic | **Pass** | Title e.g. `RC-2026-3621 \| ResCutes`. |
| **BUG-15** Card truncation / gray images | Cosmetic | **Pass** | Images settle; truncation is intentional clamp; full text on detail. |

### New / post-baseline items

| Item | Result | Evidence |
|------|--------|----------|
| Reporter on assignment accept + case detail | **Pass** | Rescuer sees Reporter **Call** / **Email** (`tel:` / `mailto:`) |
| Seeded reporter phone + actions layout | **Pass** | Usable, not layout-broken |
| Mobile Report requires phone | **Pass** | “Phone number is required.” |
| Profile phone required | **Pass** | Native required on blank; restored original |
| Profile Contact helper readable | **Pass** | No overlap/doubled copy |
| Shelter count ~24 | **Pass** | Directory showed 24 (not curated ~19) |
| XSS escape re-check | **Not re-run** | Skipped create this pass; baseline still held escaped render |

---

## 3. New Findings

| Severity | Finding |
|----------|---------|
| Minor / Cosmetic | **Medical tabs** at ~390px need horizontal scroll; risk of missed tabs without affordance cues. |
| Minor / Cosmetic | **Map legend** label truncation under mobile frame overflow (Standard/Shelters depending on state). Functionality OK. |
| Note | Re-audit created **2** tagged records (animal + rescue case). Mobile XSS report not re-created. Baseline case `RC-2026-9814` may still exist from first audit. |

No Critical or Major new regressions vs baseline.

---

## 4. Remaining Recommendations

Only what is still needed:

### Improvements
1. Make `/medical` tab list wrap or use a select/dropdown under `sm` breakpoints; avoid clipped horizontal strip.  
2. Give map legend enough width (or abbreviated tooltips + full `aria-label`) so **Standard** never truncates.  
3. Optional: visual cue when Reject is disabled (“enter reason to enable”).  
4. Optional: CI smoke for `/animals/new`, `/rescue-cases/new`, empty animal name, staff `/mobile` redirect.

### Removals
None required for demo quality.

### Additions (nice-to-have, not blocking demo score)
1. Public health check / status for deploy confidence.  
2. Seed-reset job to remove `QA Reaudit Sep8*` and first-audit `QA Audit Sep8` cases after demos.

---

## 5. Checklist of Endpoints & Flows Retested

### Auth matrix
| Role | Landing | Opposite surface | Refresh | Logout |
|------|---------|------------------|---------|--------|
| Citizen | `/mobile` | `/dashboard` → unauthorized | Pass | Pass |
| Rescuer | `/mobile` | `/dashboard` → unauthorized | Pass | Pass |
| Staff | `/dashboard` | `/mobile` → `/dashboard` (gated) | Pass | Pass |
| Vet | `/dashboard` | `/mobile` → `/dashboard` (gated) | Pass | Pass |
| Admin | `/dashboard` | `/mobile` OK (intentional) | Pass | Pass |

### Public / polish
| Item | Result |
|------|--------|
| `/sign-in` | Pass → Sign In |
| Unknown 404 | Pass branded |
| `/` narrow hero | Pass |
| Session refresh | Pass |

### Web ops (admin / staff / vet)
| Flow | Result |
|------|--------|
| Animals Create + list CTA | Pass |
| Rescue Cases Create + list CTA | Pass |
| Empty animal name validation | Pass |
| Rescue Verify / Reject-reason / Dispatch (staff) | Pass (not executed) |
| Medical start with notes (vet) | Pass (no clearance) |
| `/rescue-cases` narrow | Pass |
| `/medical` narrow | Partial |
| `/animals`, `/adoption` narrow | Pass |
| Rescue detail document title | Pass |

### Mobile
| Flow | Result |
|------|--------|
| Report desc stale error | Pass |
| Report phone required | Pass |
| Profile helper + phone required | Pass |
| Map chips / legend sync / pan-no-popup | Pass |
| Legend label clip | Partial |
| Shelter count 24 | Pass |
| Reporter Call/Email | Pass |
| Cases list images/truncation | Pass |

---

## Appendix A — Demo accounts

| Name | Role | Email | Password |
|------|------|-------|----------|
| Maria Santos | Citizen | citizen@rescutes.demo | demo1234 |
| James Chen | Rescuer | rescuer@rescutes.demo | demo1234 |
| Sarah Lim | Shelter Staff | staff@rescutes.demo | demo1234 |
| Dr. Anita Rao | Veterinarian | vet@rescutes.demo | demo1234 |
| Alex Wong | Administrator | admin@rescutes.demo | demo1234 |

## Appendix B — QA artifacts created this re-audit

| Type | Marker / Name | ID |
|------|---------------|-----|
| Animal | `QA Reaudit Sep8 Animal` | `189af6c6-6691-40a3-9c4a-b9c4b4ed66e3` |
| Rescue case | `QA Reaudit Sep8 — detection-only test case; do not dispatch.` | `3ad79dcb-da90-4a1e-ad75-01e3011cdd30` |

Safe to delete on demo reset. No Approve/Reject/Dispatch/clearance submits finalized on seeded production paths.

---

*Re-audit complete — 8 September 2026. Score **90 / 100** (+26 vs baseline 64).*
