/**
 * Capture README screenshots from the live demo.
 * Usage: node scripts/capture-readme-screenshots.mjs
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.README_SHOT_BASE ?? "https://rescutes.vercel.app";
const OUT = path.join("e2e", "screenshots");
const PASSWORD = "demo1234";

fs.mkdirSync(OUT, { recursive: true });

function shotPath(name) {
  return path.join(OUT, name);
}

async function dismissNoise(page) {
  // Close Next.js error overlay / toasts if any
  await page.keyboard.press("Escape").catch(() => {});
  await page.evaluate(() => {
    document
      .querySelectorAll("[data-nextjs-dialog], [data-nextjs-toast]")
      .forEach((el) => el.remove());
  }).catch(() => {});
}

async function waitSettled(page, ms = 800) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
  await dismissNoise(page);
}

async function waitForMap(page) {
  await page.locator(".rescutes-map .mapboxgl-canvas, .mapboxgl-canvas").first()
    .waitFor({ state: "visible", timeout: 45000 })
    .catch(() => {});
  await page.waitForTimeout(1500);
}

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator("#email, input[name='email']").first().fill(email);
  await page.locator("#password, input[name='password']").first().fill(PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(
    (url) =>
      url.pathname.includes("/dashboard") ||
      url.pathname.includes("/mobile") ||
      url.pathname.includes("/rescue-cases") ||
      url.pathname.includes("/animals") ||
      url.pathname.includes("/medical"),
    { timeout: 45000 },
  );
  await waitSettled(page, 1000);
}

async function shot(page, file, options = {}) {
  await dismissNoise(page);
  await page.screenshot({
    path: shotPath(file),
    fullPage: false,
    animations: "disabled",
    ...options,
  });
  console.log("✓", file);
}

async function shotLocator(locator, file) {
  await locator.screenshot({
    path: shotPath(file),
    animations: "disabled",
  });
  console.log("✓", file);
}

const browser = await chromium.launch();

// ─── PUBLIC LANDING (desktop) ───────────────────────────────────────────────
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Try Demo Access" }).waitFor({
    state: "visible",
    timeout: 20000,
  });
  await page.waitForTimeout(1200);

  const hero = page.locator("main section").first();
  await shotLocator(hero, "01-landing-hero.png");

  // Scroll workflow steps into view and capture each of the 4 steps
  const steps = [
    { title: "Report & Track", file: "02-workflow-01-report.png" },
    { title: "Coordinate Rescue", file: "03-workflow-02-rescue.png" },
    { title: "Medical Clearance", file: "04-workflow-03-medical.png" },
    { title: "Adoption", file: "05-workflow-04-adoption.png" },
  ];
  for (const step of steps) {
    const heading = page.getByRole("heading", { name: step.title }).first();
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    // Capture the step article / section around the heading
    const block = heading.locator(
      "xpath=ancestor::article[1] | ancestor::section[1]",
    ).first();
    if (await block.count()) {
      await shotLocator(block, step.file);
    } else {
      await shot(page, step.file);
    }
  }

  // Demo access strip
  const demo = page.locator("#demo").first();
  if (await demo.count()) {
    await demo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await shotLocator(demo, "06-landing-demo-access.png");
  }

  await page.close();
}

// ─── WEB DASHBOARD (admin) ──────────────────────────────────────────────────
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await login(page, "admin@rescutes.demo");

  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("heading", { name: /Operations Overview/i })
    .waitFor({ timeout: 30000 });
  await waitForMap(page);
  await waitSettled(page, 1200);
  await shot(page, "07-web-dashboard.png");

  await page.goto(`${BASE}/rescue-cases`, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("heading", { name: /Rescue Cases/i })
    .waitFor({ timeout: 30000 });
  await waitSettled(page, 1200);
  // Prefer desktop table if visible
  await shot(page, "08-web-rescue-cases.png");

  // Open first desktop table row → full case page
  try {
    const desktopRow = page.locator("table tbody tr").first();
    await desktopRow.waitFor({ state: "visible", timeout: 10000 });
    await desktopRow.click();
    await page.waitForTimeout(1200);
    const openFull = page.getByRole("link", { name: /Open full case/i });
    if (await openFull.isVisible().catch(() => false)) {
      await openFull.click();
      await page.waitForURL(/\/rescue-cases\//, { timeout: 20000 });
      await waitSettled(page, 1200);
      await shot(page, "09-web-case-detail.png");
    } else {
      const modal = page.getByRole("dialog").first();
      if (await modal.isVisible().catch(() => false)) {
        await shotLocator(modal, "09-web-case-detail.png");
      }
    }
  } catch (err) {
    console.warn("case detail shot skipped:", String(err.message || err).slice(0, 160));
  }

  await page.goto(`${BASE}/medical`, { waitUntil: "domcontentloaded" });
  await waitSettled(page, 1500);
  await shot(page, "10-web-medical.png");

  await page.goto(`${BASE}/shelters`, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("heading", { name: /Shelter/i })
    .first()
    .waitFor({ timeout: 30000 })
    .catch(() => {});
  await waitForMap(page);
  await waitSettled(page, 1200);
  await shot(page, "11-web-shelter-map.png");

  await page.goto(`${BASE}/adoption`, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("heading", { name: /Adoption/i })
    .waitFor({ timeout: 30000 });
  await waitSettled(page, 1500);
  await shot(page, "12-web-adoption.png");

  await page.goto(`${BASE}/animals`, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("heading", { name: /Animals/i })
    .waitFor({ timeout: 30000 });
  await waitSettled(page, 1200);
  await shot(page, "13-web-animals.png");

  await page.close();
}

// ─── MOBILE PWA (rescuer / citizen) ─────────────────────────────────────────
{
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  // Rescuer: map home + cases
  await login(page, "rescuer@rescutes.demo");
  await page.goto(`${BASE}/mobile`, { waitUntil: "domcontentloaded" });
  await waitForMap(page);
  await waitSettled(page, 1500);
  await shot(page, "14-mobile-home-map.png");

  await page.goto(`${BASE}/mobile/cases`, { waitUntil: "domcontentloaded" });
  await waitSettled(page, 1500);
  await shot(page, "15-mobile-cases.png");

  await page.goto(`${BASE}/mobile/adoption`, { waitUntil: "domcontentloaded" });
  await waitSettled(page, 1500);
  await shot(page, "16-mobile-adoption.png");

  // Citizen: report flow
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  // May already be logged in as rescuer - sign out if possible
  const signOut = page.getByRole("button", { name: /Sign out|Log out/i });
  if (await signOut.isVisible().catch(() => false)) {
    await signOut.click();
    await waitSettled(page, 800);
  }
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator("#email, input[name='email']").first().fill("citizen@rescutes.demo");
  await page.locator("#password, input[name='password']").first().fill(PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/mobile/, { timeout: 45000 });
  await waitSettled(page, 1000);

  await page.goto(`${BASE}/mobile/report`, { waitUntil: "domcontentloaded" });
  await waitSettled(page, 1500);
  await shot(page, "17-mobile-report.png");

  await page.goto(`${BASE}/mobile/profile`, { waitUntil: "domcontentloaded" });
  await waitSettled(page, 1000);
  await shot(page, "18-mobile-profile.png");

  await page.close();
}

await browser.close();
console.log("\nAll README screenshots written to", OUT);
