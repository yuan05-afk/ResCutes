/**
 * Capture tight, README-sized product screenshots for the ResCutes flow:
 *   Landing hero + 1 Report → 2 Rescue ops → 3 Medical → 4 Adoption
 * Plus a couple supporting shots (map home, shelter map).
 *
 * Usage: node scripts/capture-readme-screenshots.mjs
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.README_SHOT_BASE ?? "https://rescutes.vercel.app";
const OUT = path.join("e2e", "screenshots");
const PASSWORD = "demo1234";

fs.mkdirSync(OUT, { recursive: true });

function outFile(name) {
  return path.join(OUT, name);
}

async function dismissNoise(page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page
    .evaluate(() => {
      document
        .querySelectorAll("[data-nextjs-dialog], [data-nextjs-toast]")
        .forEach((el) => el.remove());
    })
    .catch(() => {});
}

async function settle(page, ms = 900) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
  await dismissNoise(page);
}

async function waitForMap(page) {
  await page
    .locator(".rescutes-map .mapboxgl-canvas, .mapboxgl-canvas")
    .first()
    .waitFor({ state: "visible", timeout: 45000 })
    .catch(() => {});
  await page.waitForTimeout(1600);
}

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator("#email, input[name='email']").first().fill(email);
  await page.locator("#password, input[name='password']").first().fill(PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(
    (url) =>
      /\/(dashboard|mobile|rescue-cases|animals|medical)/.test(url.pathname),
    { timeout: 45000 },
  );
  await settle(page, 800);
}

/** Viewport shot - no fullPage (avoids giant empty canvas). */
async function shotViewport(page, file) {
  await dismissNoise(page);
  await page.screenshot({
    path: outFile(file),
    fullPage: false,
    animations: "disabled",
    type: "png",
  });
  console.log("✓", file);
}

/** Crop to a locator's bounding box (tight). */
async function shotEl(locator, file, padding = 8) {
  await locator.waitFor({ state: "visible", timeout: 30000 });
  const box = await locator.boundingBox();
  if (!box) throw new Error(`No box for ${file}`);
  const page = locator.page();
  const clip = {
    x: Math.max(0, box.x - padding),
    y: Math.max(0, box.y - padding),
    width: Math.min(box.width + padding * 2, page.viewportSize().width),
    height: Math.min(box.height + padding * 2, page.viewportSize().height),
  };
  await page.screenshot({
    path: outFile(file),
    clip,
    animations: "disabled",
    type: "png",
  });
  console.log("✓", file, `(${Math.round(clip.width)}×${Math.round(clip.height)})`);
}

const browser = await chromium.launch();

// ═══════════════════════════════════════════════════════════════════════════
// LANDING — public hero (README masthead)
// ═══════════════════════════════════════════════════════════════════════════
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page
    .locator(".landing-brand")
    .first()
    .waitFor({ state: "visible", timeout: 30000 });
  await settle(page, 1200);
  await shotViewport(page, "landing-hero.png");
  await page.close();
}

// ═══════════════════════════════════════════════════════════════════════════
// WEB — staff/admin ops (compact 1280×720 viewport)
// ═══════════════════════════════════════════════════════════════════════════
{
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  });
  await login(page, "admin@rescutes.demo");

  // Dashboard (supporting - essence of ops)
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("heading", { name: /Operations Overview/i })
    .waitFor({ timeout: 30000 });
  await waitForMap(page);
  await settle(page, 1000);
  await shotViewport(page, "flow-ops-dashboard.png");

  // STEP 2 — Coordinate rescue: case list
  await page.goto(`${BASE}/rescue-cases`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /Rescue Cases/i }).waitFor({
    timeout: 30000,
  });
  await settle(page, 1000);
  await shotViewport(page, "flow-02-rescue-cases.png");

  // STEP 2b — Case detail (urgency + dispatch essence)
  try {
    const row = page.locator("table tbody tr").first();
    await row.waitFor({ state: "visible", timeout: 10000 });
    await row.click();
    await page.waitForTimeout(1000);
    const openFull = page.getByRole("link", { name: /Open full case/i });
    if (await openFull.isVisible().catch(() => false)) {
      await openFull.click();
      await page.waitForURL(/\/rescue-cases\//, { timeout: 20000 });
    }
    await settle(page, 1200);
    // Prefer main content column if present
    const main = page.locator("main").first();
    if (await main.count()) {
      await shotViewport(page, "flow-02-case-detail.png");
    } else {
      await shotViewport(page, "flow-02-case-detail.png");
    }
  } catch (e) {
    console.warn("case detail skipped:", String(e.message || e).slice(0, 120));
  }

  // STEP 3 — Medical clearance
  await page.goto(`${BASE}/medical`, { waitUntil: "domcontentloaded" });
  await settle(page, 1400);
  await shotViewport(page, "flow-03-medical.png");

  // STEP 4 — Adoption (web)
  await page.goto(`${BASE}/adoption`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /Adoption/i }).waitFor({
    timeout: 30000,
  });
  await settle(page, 1400);
  await shotViewport(page, "flow-04-adoption-web.png");

  // Shelter routing map (supporting innovation shot)
  await page.goto(`${BASE}/shelters`, { waitUntil: "domcontentloaded" });
  await settle(page, 800);
  await waitForMap(page);
  await settle(page, 1000);
  await shotViewport(page, "flow-shelters-map.png");

  await page.close();
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE — real phone viewport (<768 so no desktop iPhone mockup chrome)
// ═══════════════════════════════════════════════════════════════════════════
{
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // STEP 1 — Report an animal
  await login(page, "citizen@rescutes.demo");
  await page.goto(`${BASE}/mobile/report`, { waitUntil: "domcontentloaded" });
  await settle(page, 1200);
  // Tight crop: stop just below Continue (avoid empty beige)
  const continueBtn = page.getByRole("button", { name: /Continue/i }).first();
  await continueBtn.waitFor({ state: "visible", timeout: 15000 });
  const cbox = await continueBtn.boundingBox();
  const cropH = Math.min(
    844,
    Math.ceil((cbox?.y ?? 480) + (cbox?.height ?? 48) + 16),
  );
  await page.screenshot({
    path: outFile("flow-01-report-mobile.png"),
    clip: { x: 0, y: 0, width: 390, height: cropH },
    animations: "disabled",
  });
  console.log("✓ flow-01-report-mobile.png", `(390×${cropH})`);

  // Track cases (still step 1 "Report & Track")
  await page.goto(`${BASE}/mobile/cases`, { waitUntil: "domcontentloaded" });
  await settle(page, 1200);
  await shotViewport(page, "flow-01-track-mobile.png");

  // Rescuer map home (field coordination companion)
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator("#email, input[name='email']").first().fill("rescuer@rescutes.demo");
  await page.locator("#password, input[name='password']").first().fill(PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/mobile/, { timeout: 45000 });
  await settle(page, 800);

  await page.goto(`${BASE}/mobile`, { waitUntil: "domcontentloaded" });
  await waitForMap(page);
  await settle(page, 1200);
  await shotViewport(page, "flow-02-map-mobile.png");

  // STEP 4 — Mobile adoption
  await page.goto(`${BASE}/mobile/adoption`, { waitUntil: "domcontentloaded" });
  await settle(page, 1400);
  await shotViewport(page, "flow-04-adoption-mobile.png");

  await page.close();
}

// Remove obsolete landing-workflow marketing shots if present
const obsolete = [
  "01-landing-hero.png",
  "02-workflow-01-report.png",
  "03-workflow-02-rescue.png",
  "04-workflow-03-medical.png",
  "05-workflow-04-adoption.png",
  "06-landing-demo-access.png",
  "07-web-dashboard.png",
  "08-web-rescue-cases.png",
  "09-web-case-detail.png",
  "10-web-medical.png",
  "11-web-shelter-map.png",
  "12-web-adoption.png",
  "13-web-animals.png",
  "14-mobile-home-map.png",
  "15-mobile-cases.png",
  "16-mobile-adoption.png",
  "17-mobile-report.png",
  "18-mobile-profile.png",
];
for (const name of obsolete) {
  const p = outFile(name);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log("removed old", name);
  }
}

await browser.close();
console.log("\nDone. Flow screenshots in", OUT);
