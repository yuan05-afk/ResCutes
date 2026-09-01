import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "From report to safe shelter intake",
  );
  await expect(page.getByText("Demo Access")).toBeVisible();
});

test("login page shows demo accounts", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Sign In")).toBeVisible();
  await expect(page.getByText("citizen@rescutes.demo")).toBeVisible();
});

test("Luna demo case visible after staff login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("staff@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/dashboard|rescue-cases|\/$/);

  await page.goto("/rescue-cases");
  await expect(page.getByText("RC-2026-1042")).toBeVisible();
});
