import { test, expect } from "@playwright/test";

async function loginAsStaff(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("staff@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases)/, { timeout: 30_000 });
}

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

test("dashboard attention focus keeps pin visible and opens map hover", async ({
  page,
}) => {
  test.setTimeout(90_000);

  await loginAsStaff(page);
  await page.goto("/dashboard");
  await page.waitForSelector(".rescutes-map", { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Live Rescue Activity" })).toBeVisible();
  await expect(page.locator(".mapboxgl-marker").first()).toBeVisible({
    timeout: 30_000,
  });

  const firstCase = page
    .locator('[role="button"]')
    .filter({ hasText: /RC-26-/ })
    .first();
  await expect(firstCase).toBeVisible({ timeout: 15_000 });
  const caseNumber = (await firstCase.innerText()).match(/RC-26-\d+/)?.[0];
  expect(caseNumber).toBeTruthy();

  await firstCase.click();

  const focusCard = page.getByTestId("dashboard-case-focus-card");
  await expect(focusCard).toBeVisible();
  await expect(focusCard.getByText(caseNumber!)).toBeVisible();
  await expect(focusCard.getByText("Expand", { exact: true })).toHaveCount(0);

  const selectedMarker = page.locator(".rescutes-map-marker-shell--selected");
  await expect(selectedMarker).toBeVisible({ timeout: 15_000 });

  const popup = page.locator(".mapboxgl-popup");
  await expect(popup).toBeVisible({ timeout: 15_000 });
  await expect(popup).toContainText(caseNumber!);

  await page.waitForTimeout(800);

  const markerBox = await selectedMarker.boundingBox();
  const cardBox = await focusCard.boundingBox();
  const mapBox = await page.locator(".rescutes-map").boundingBox();

  expect(markerBox).toBeTruthy();
  expect(cardBox).toBeTruthy();
  expect(mapBox).toBeTruthy();

  expect(
    boxesOverlap(markerBox!, cardBox!),
    "selected pin must not be covered by the focus card",
  ).toBe(false);

  // Focus strip is above the map - pin and card must not share the same band.
  expect(markerBox!.y).toBeGreaterThanOrEqual(cardBox!.y + cardBox!.height - 4);
});
