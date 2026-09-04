import { test, expect } from "@playwright/test";

async function loginAsStaff(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("staff@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases)/, { timeout: 30_000 });
}

test("map legend toggles and shelter filters animate smoothly", async ({ page }) => {
  test.setTimeout(90_000);

  await loginAsStaff(page);
  await page.goto("/dashboard");
  await page.waitForSelector(".rescutes-map", { timeout: 30_000 });

  const dashboardLegend = page.getByRole("region", { name: "Map legend" });
  await expect(dashboardLegend).toBeVisible();

  const criticalToggle = dashboardLegend.getByRole("button", { name: /Critical/i });
  await expect(criticalToggle).toBeVisible();

  const markersBefore = page.locator(".mapboxgl-marker .rescutes-map-marker-fade");
  expect(await markersBefore.count()).toBeGreaterThan(0);

  await criticalToggle.click();
  await expect(criticalToggle).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(400);
  await expect(
    page.locator(".mapboxgl-marker.rescutes-map-marker--off .rescutes-map-marker-fade").first(),
  ).toBeVisible();

  await criticalToggle.click();
  await expect(criticalToggle).toHaveAttribute("aria-pressed", "true");

  await page.goto("/shelters");
  await expect(page.getByRole("heading", { name: "Philippines Shelter Map" })).toBeVisible({
    timeout: 30_000,
  });
  await page.waitForSelector(".rescutes-map", { timeout: 45_000 });

  const shelterLegend = page.getByRole("region", { name: "Map legend" });
  await expect(shelterLegend).toBeVisible();

  const wildlifeToggle = shelterLegend.getByRole("button", { name: /Wildlife/i });
  if (await wildlifeToggle.count()) {
    await wildlifeToggle.click();
    await page.waitForTimeout(350);
    await wildlifeToggle.click();
  }

  const search = page.getByPlaceholder("Search shelter, city, or region...");
  await search.fill("PAWS");
  await page.waitForTimeout(400);
  await expect(
    page.getByRole("button", {
      name: /PAWS Animal Rehabilitation Center.*Quezon City/i,
    }),
  ).toBeVisible();

  await search.fill("");
  await page.waitForTimeout(400);
});
