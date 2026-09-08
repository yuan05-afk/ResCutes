import { test, expect } from "@playwright/test";

test.describe("Create routes exist", () => {
  test("animals/new and rescue-cases/new render for admin", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@rescutes.demo");
    await page.getByLabel("Password").fill("demo1234");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\/(dashboard|rescue-cases|animals)/, {
      timeout: 30_000,
    });

    await page.goto("/animals/new");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "New animal" }),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto("/rescue-cases/new");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "New rescue case" }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
