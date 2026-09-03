import { test, expect } from "@playwright/test";

async function loginAsStaff(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("staff@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases)/, { timeout: 30_000 });
}

test("shelter map rapid selection does not crash Mapbox camera", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  await loginAsStaff(page);
  await page.goto("/shelters");
  await expect(
    page.getByRole("heading", { name: "Philippines Shelter Map" }),
  ).toBeVisible({ timeout: 30_000 });
  await page.waitForSelector(".rescutes-map", { timeout: 45_000 });
  await expect(page.locator(".mapboxgl-marker").first()).toBeVisible({
    timeout: 30_000,
  });

  const directory = page
    .getByRole("heading", { name: "Directory" })
    .locator("xpath=ancestor::section[1]");
  const listButtons = directory.locator("button[type='button']");
  const count = await listButtons.count();
  expect(count).toBeGreaterThan(3);

  const indexes = [0, 1, 2, 1, 0, 3, 2, 0];
  for (const i of indexes) {
    await listButtons.nth(i % count).click({ timeout: 5_000 });
    await page.waitForTimeout(70);
  }

  await page.waitForTimeout(1000);

  expect(
    pageErrors.filter(
      (e) => e.includes("reading 'x'") || e.includes("TypeError"),
    ),
  ).toEqual([]);
  await expect(page.getByText("Application error")).toHaveCount(0);
  await expect(page.locator(".rescutes-map-marker-shell--selected")).toBeVisible();
});
