import { test, expect } from "@playwright/test";
import path from "path";

async function loginAsStaff(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("staff@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases)/);
}

async function loginAsRescuer(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("rescuer@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/mobile/);
}

test.describe("Map legend layout", () => {
  test("desktop dashboard - legend is horizontal, right of Mapbox logo", async ({
    page,
  }) => {
    await loginAsStaff(page);
    await page.goto("/dashboard");
    await page.waitForSelector(".rescutes-map", { timeout: 30_000 });

    const legend = page.getByRole("region", { name: "Map legend" });
    await expect(legend).toBeVisible();

    const logo = page.locator(".mapboxgl-ctrl-logo").first();
    await expect(logo).toBeVisible();

    const legendBox = await legend.boundingBox();
    const logoBox = await logo.boundingBox();
    expect(legendBox).not.toBeNull();
    expect(logoBox).not.toBeNull();

    expect(legendBox!.x).toBeGreaterThanOrEqual(logoBox!.x + logoBox!.width + 2);
    expect(Math.abs(legendBox!.y - logoBox!.y)).toBeLessThan(28);

    const itemLabels = legend.locator("li span.font-semibold");
    const count = await itemLabels.count();
    expect(count).toBeGreaterThanOrEqual(3);

    if (count >= 2) {
      const first = await itemLabels.nth(0).boundingBox();
      const second = await itemLabels.nth(1).boundingBox();
      const third = count >= 3 ? await itemLabels.nth(2).boundingBox() : null;
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(second!.x).toBeGreaterThan(first!.x);
      expect(Math.abs(second!.y - first!.y)).toBeLessThan(14);
      if (third) {
        expect(third.x).toBeGreaterThan(second!.x);
        expect(Math.abs(third.y - second!.y)).toBeLessThan(14);
      }
    }

    const legendWidth = legendBox!.width;
    const lastItem = await itemLabels.last().boundingBox();
    expect(lastItem).not.toBeNull();
    expect(legendWidth).toBeLessThan(lastItem!.x - legendBox!.x + lastItem!.width + 48);

    await page.screenshot({
      path: path.join("e2e", "screenshots", "map-legend-dashboard-desktop.png"),
      fullPage: false,
    });
  });

  test("mobile home map - compact horizontal legend beside Mapbox logo", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsRescuer(page);
    await page.goto("/mobile");
    await page.waitForSelector(".rescutes-map", { timeout: 30_000 });

    const legend = page.getByRole("region", { name: "Map legend" });
    await expect(legend).toBeVisible();

    const logo = page.locator(".mapboxgl-ctrl-logo").first();
    await expect(logo).toBeVisible();

    const legendBox = await legend.boundingBox();
    const logoBox = await logo.boundingBox();
    expect(legendBox).not.toBeNull();
    expect(logoBox).not.toBeNull();

    expect(legendBox!.x).toBeGreaterThanOrEqual(logoBox!.x + logoBox!.width + 2);

    const items = legend.locator("li");
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThanOrEqual(1);

    // Compact labels (Shelter / Crit / High / Std) must stay fully visible.
    const standard = legend.getByText(/^(Standard|Std)$/);
    await expect(standard.first()).toBeVisible();
    const standardBox = await standard.first().boundingBox();
    const legendBoxAfter = await legend.boundingBox();
    expect(standardBox).not.toBeNull();
    expect(legendBoxAfter).not.toBeNull();
    expect(standardBox!.x + standardBox!.width).toBeLessThanOrEqual(
      legendBoxAfter!.x + legendBoxAfter!.width + 1,
    );

    if (itemCount >= 2) {
      const a = await items.nth(0).boundingBox();
      const b = await items.nth(1).boundingBox();
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(b!.x).toBeGreaterThan(a!.x);
    }

    await page.screenshot({
      path: path.join("e2e", "screenshots", "map-legend-nearby-mobile.png"),
      fullPage: false,
    });
  });
});
