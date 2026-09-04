import { test, expect } from "@playwright/test";

async function loginAsCitizen(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("citizen@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/mobile/, { timeout: 30_000 });
}

async function loginAsRescuer(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("rescuer@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/mobile/, { timeout: 30_000 });
}

test.describe("Mobile home map + nav", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("home is map-first with no legacy dashboard copy", async ({ page }) => {
    await loginAsCitizen(page);
    await page.goto("/mobile");

    await expect(page.getByRole("heading", { name: "Map" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Nearest/i })).toBeVisible();
    await expect(page.getByText(/Found an animal/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Recent Updates" })).toHaveCount(0);

    await expect(page.getByRole("link", { name: "Report an animal" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Adopt" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nearby" })).toHaveCount(0);
  });

  test("adoption queue loads for citizen", async ({ page }) => {
    await loginAsCitizen(page);
    await page.goto("/mobile/adoption");

    await expect(page.getByRole("heading", { name: "Adopt" })).toBeVisible();
    const empty = page.getByText(/all caught up/i);
    const pass = page.getByRole("button", { name: "Pass" });
    await expect(empty.or(pass)).toBeVisible({ timeout: 15_000 });
  });

  test("rescuer home shows case layer chips", async ({ page }) => {
    await loginAsRescuer(page);
    await page.goto("/mobile");

    await expect(page.getByRole("heading", { name: "Map" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Shelters" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cases" })).toBeVisible();
  });

  test("report photo step offers camera and gallery", async ({ page }) => {
    await loginAsCitizen(page);
    await page.goto("/mobile/report");

    await expect(page.getByRole("button", { name: "Camera" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Gallery" })).toBeVisible();
    await expect(page.getByText("Add a photo")).toBeVisible();
  });
});
