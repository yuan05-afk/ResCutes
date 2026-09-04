import { test, expect } from "@playwright/test";

const REPORT_DESCRIPTION =
  "Small tan aspin pacing near a busy intersection, looks nervous but not aggressive.";

async function loginAsCitizen(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("citizen@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/mobile/, { timeout: 30_000 });
}

async function loginAsStaff(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("staff@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases)/, { timeout: 30_000 });
}

async function submitMobileReport(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = (success) => {
      success({
        coords: {
          latitude: 14.5995,
          longitude: 120.9842,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    };
  });

  await page.goto("/mobile/report");

  // Photo is optional; continue without attaching one
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Use Current Location" }).click();
  await expect(page.getByText("Location captured")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByPlaceholder("Describe what you observed...").fill(REPORT_DESCRIPTION);
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Submit Report" }).click();
  await page.waitForURL(/\/mobile\/cases\//, { timeout: 30_000 });
}

test.describe("Mobile report to web sync", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    geolocation: { latitude: 14.5995, longitude: 120.9842 },
    permissions: ["geolocation"],
  });

  test("citizen report appears on staff rescue cases list", async ({ page }) => {
    test.setTimeout(120_000);

    await loginAsCitizen(page);
    await submitMobileReport(page);

    await expect(page.getByText(REPORT_DESCRIPTION)).toBeVisible();

    await loginAsStaff(page);
    await page.goto("/rescue-cases");
    await expect(page.getByRole("heading", { name: "Rescue Cases" })).toBeVisible();
    await expect(page.getByText(REPORT_DESCRIPTION).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
