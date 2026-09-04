import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "From report to safe shelter intake",
  );
  await expect(page.getByRole("heading", { name: "Demo Access" })).toBeVisible();
});

test("login page shows demo accounts", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Citizen/i })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Shelter Staff/i }),
  ).toBeVisible();
});

test("landing demo access prefills login without signing in", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("heading", { name: "Demo Access" }).scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: /Maria Santos/i }).click();
  await page.waitForURL(/\/login\?email=/);
  await expect(page.getByLabel("Email")).toHaveValue("citizen@rescutes.demo");
  await expect(page.getByLabel("Password")).toHaveValue("demo1234");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("rescue cases list starts empty after staff login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("staff@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/dashboard|rescue-cases|\/$/);

  await page.goto("/rescue-cases");
  await expect(page.getByText("0 cases in system")).toBeVisible();
});
