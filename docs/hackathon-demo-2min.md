# ResCutes 2-minute hackathon demo (Recordly)

A click-through script for the live UI. Audience: hackathon judges (mixed technical and non-technical). This is a project submission, not an investor pitch.

Live app: [https://rescutes.vercel.app](https://rescutes.vercel.app)

---

## Demo Concept and Narrative

A hit aspin on the EDSA Cubao service road used to disappear into a Facebook thread. In two minutes, show that this build turns a street photo into scored urgency, a shelter chosen for capacity and capability (not the nearest pin), a rescuer already on the case, and a named animal (Luna) waiting for a home.

---

## Pre-Flight Checklist

Do this 15 to 20 minutes before Recordly starts. Do not do it on camera.

**Environment**

- Use production (`https://rescutes.vercel.app`), not localhost. Confirm `/api/health` returns OK.
- Confirm Mapbox tiles load on the dashboard and `/mobile`.
- Confirm demo seed is present: staff Rescue Cases should include **EDSA Cubao service road** (seed slug `active-aspin-edsa`). If missing, run `npm run db:seed-animals` against the demo database before recording, not during it.
- Confirm that case is **already with a rescuer**. Seed status is `rescuer_assigned`, assignment accepted, destination **PAWS Animal Rehabilitation Center (PARC)**. Do not reset it.
- Confirm **Luna** appears on `/adoption` as ready for adoption.

**Browser windows (three tabs, one Chrome profile, bookmarks bar hidden)**

1. **Landing (cold start):** `https://rescutes.vercel.app/` at about 1280px. Hero in view. Not logged in.
2. **Staff dashboard (warm):** Shelter Staff `staff@rescutes.demo` / `demo1234`, parked on `/dashboard`. Prefetch `/rescue-cases`. Optionally open the EDSA case in a background tab so it is instant.
3. **Mobile (warm):** Citizen `citizen@rescutes.demo` / `demo1234` on `/mobile`. Keep the window wide so the iPhone mockup stays visible. Prefetch `/mobile/report` and `/mobile/adoption`.
4. **Backup (hidden):** Rescuer `rescuer@rescutes.demo` on `/mobile` with the EDSA assignment under Cases. Only switch here if staff case detail is slow.

**Recordly / machine**

- 1080p. Display zoom 100%. Browser zoom 110%.
- Mute notifications. Close DevTools.
- Do not type passwords on camera. If you must show login, use the one-click role buttons on `/login`.
- Cursor: large. Move slowly. Pause about half a second after each click.

**Script card (sticky note, off camera)**

- 0:00 problem + hero
- 0:18 phone report
- 0:42 dashboard map + KPIs
- 1:05 EDSA already with rescuer (destination + match)
- 1:35 Luna adoption
- 1:50 close (live demo + try-it accounts)

**Do not live-submit** a new report or change production demo data. GPS prompts and photo uploads will eat the clock.

---

## Step-by-Step Flow

### 0:00 to 0:18 - The problem, then the product

**Action (what to show):** Tab 1. Landing hero. Hold on the barangay street photo. Read **Philippine animal rescue coordination**, **ResCutes**, and **From report to rescue, care, and adoption.** Do not click Sign In. One slow scroll through the four workflow cards (Report and Track, Coordinate Rescue, Medical Clearance, Adoption) and stop.

**Talking points:**

- Today a hurt animal on EDSA is a Facebook post, three group chats, and a shelter that may already be full.
- We built ResCutes as a working coordination layer: citizens, rescuers, shelters, and vets on one case, from the street to a home.
- Two interfaces, one codebase: phone for the field, dashboard for dispatch. Same animal. No copy-paste.

### 0:18 to 0:42 - Aha 1: reporting is a 20-second civic act

**Action:** Switch to Tab 3 (citizen mobile, iPhone frame). Home map with shelters and open cases. Tap the center **Report** camera button. Walk the stepper: Photo, Location, Animal, Condition, Contact, Review. On Photo, hover the camera control. On Location, point at the map pin. On Animal and Condition, tap **Dog**, **Severe**, **Traffic**. Stop on Review. Do **not** submit.

**Talking points:**

- The person who sees the animal is not a dispatcher. We ask for a photo, a pin, and three taps: species, injury, danger.
- Urgency and shelter matching are computed from these fields, not from a volunteer reading a wall of comments.
- Drafts persist if the jeepney hits a pothole. This is for a phone in one hand on a service road.

### 0:42 to 1:05 - Aha 2: operations, not a feed

**Action:** Switch to Tab 2. `/dashboard` as Sarah Lim (Shelter Staff). Pause on **Operations Overview**: Shelter Capacity ring, Active Rescue Cases, assignment coverage, critical and high share. Pan the Metro Manila map. Click the EDSA Cubao item in the attention queue, or open it from Rescue Cases. Land on the case detail (modal or `/rescue-cases/[id]`). Do not hunt for dispatch buttons yet. You are opening a live field case.

**Talking points:**

- This is the view a shelter coordinator needs at 7 a.m.: how full are we, what is on the street, what is still unassigned.
- The map is live field work, not a slide. Pins are cases with photos, status, and urgency.
- Staff do not hunt through Messenger. They work a queue.

### 1:05 to 1:35 - Aha 3: routing already applied (staff, case already with rescuer)

This beat stays in Shelter Staff POV. The seeded EDSA case is **not** waiting for destination selection. Status is `rescuer_assigned`, James Chen has **accepted**, destination is already **PAWS Animal Rehabilitation Center (PARC)**. The ranked **Shelter destination** dropdown is hidden because a shelter is already assigned. Do not click around looking for it.

**Action:** Stay on the EDSA case detail. Point, do not mutate, in this order:

1. Location label **EDSA Cubao service road, Quezon City**, plus the motorcycle-hit description.
2. Header **Urgency** badge, then the Urgency panel (explanation and factor rows such as injury and traffic).
3. Pipeline chip **With rescuer** (current stage).
4. Meta **Rescuer**: James Chen (`accepted`).
5. Meta **Destination**: PAWS Animal Rehabilitation Center (PARC).
6. Meta **Top shelter match**: the same facility with a match percent. That percent is the engine's score, not a nearest-pin guess.
7. Optional three seconds on the rescuer note: "Heavy traffic. Approach from Aurora underpass service lane. Wear hi-vis vest."

**Talking points:**

- Staff already did the hard part. This trauma case is not sitting in a group chat. A named rescuer accepted, and a destination is locked.
- Urgency is explainable. Severe injury plus EDSA traffic outranks a healthy cat in a garden. Injury, environment, vulnerability, and time waiting, not a gut feel.
- The breakthrough is where the animal goes. Destination is PAWS PARC because the engine ranked capability, remaining capacity, species, distance, and workload. PAWS PARC has orthopedic treatment and emergency surgery, and it still has beds.
- **Top shelter match** is the receipt. Staff can see why this facility won. If they had overridden the top match, the product would have asked why. You are looking at the outcome, not the picker.
- The field note rides on the same record. The person driving in does not need a second Messenger thread.

### 1:35 to 1:50 - Payoff: the same platform ends in a home

**Action:** In the staff sidebar, click **Adoption**. Find **Luna** (tan juvenile aspin, medically cleared, ready for adoption). If time allows, flash Tab 3 and tap **Adopt**, then return to Luna. Do not start an application.

**Talking points:**

- We did not stop at "report submitted." The same record continues through intake, medical clearance, and adoption.
- Luna is the other end of that pipeline: examined, cleared, visible to families. That is a complete MVP, not a single happy-path screen.

### 1:50 to 2:00 - Close

**Action:** Cut back to the landing hero (Tab 1) or a split of phone frame and dashboard. Hold. Stop talking at 1:58. Let the visual sit for Recordly's end card.

**Talking points:**

- One photo on EDSA. One scored case. One ranked shelter. One named animal ready for a family.
- That is ResCutes: from report to rescue, care, and adoption. The live demo is up. Please try it.

---

## Fallback Plan

1. **Production login, map, or API fails:** Stay on the public landing. Walk the four workflow images and Demo Access names (Maria Santos, James Chen, Sarah Lim). Then cut to a local recording of the three warm tabs captured the night before. Say: "The submitted build is live; this is a captured pass of the same screens."
2. **EDSA case is missing, or you expected a destination dropdown:** Do not create a case live. If the case exists but you look for **Shelter destination**, stop. Point at **Destination** and **Top shelter match** instead. That is the correct Aha 3 on this seed. If EDSA is gone, use another high-urgency dog that already has a destination, and keep the same words: already with a rescuer, ranked match, not nearest pin. If Luna is missing, use any adoption-ready animal. If `/mobile` is unframed, widen the window so the iPhone mockup returns.

If a click is slow, narrate over the loading state. Never apologize twice. Never open DevTools.

---

## Call to Action

One ask: **try the live submission.**

**Spoken close:** "This is a working build, not a mock. Open rescutes.vercel.app, pick a demo role, and walk a case yourself. If you are scoring this round, the live app and the repo are the submission."

**Recordly end card (3 seconds, large type):**

- ResCutes - hackathon submission
- Live: rescutes.vercel.app
- Try it: staff@rescutes.demo / demo1234
- Repo: github.com/yuan05-afk/ResCutes

Do not ask judges for funding, a paid pilot, or an intro to investors.

---

## Recording notes

- Record the full 2:00 in one take if possible. If you cut, cut on the tab change (landing to phone, phone to dashboard).
- Do not mouse-over Users or Settings.
- In the video, say "phone app" and "operations dashboard." Save Neon, Next.js, and PWA for Q&A or the README.
- Q&A pocket facts: one Next.js app for web and mobile; Neon Postgres and Neon Auth; routing weights are capability 35%, capacity 25%, species 20%, distance 15%, workload 5%; all demo accounts use `demo1234`.
