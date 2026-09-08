import { test, expect } from "@playwright/test";

/**
 * Smoke coverage called out by the QA re-audit:
 * create routes, empty animal name validation, staff /mobile gate.
 */
test.describe("QA re-audit smoke", () => {
  test("health endpoint reports ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe("rescutes");
    expect(body.database).toBe("up");
  });

  test("staff is redirected away from /mobile", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/login");
    await page.getByLabel("Email").fill("staff@rescutes.demo");
    await page.getByLabel("Password").fill("demo1234");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\/(dashboard|rescue-cases|animals|medical)/, {
      timeout: 30_000,
    });

    await page.goto("/mobile");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("empty animal name is rejected on create", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@rescutes.demo");
    await page.getByLabel("Password").fill("demo1234");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\/(dashboard|rescue-cases|animals)/, {
      timeout: 30_000,
    });

    await page.goto("/animals/new");
    await expect(
      page.getByRole("heading", { name: "New animal" }),
    ).toBeVisible({ timeout: 15_000 });

    const name = page.getByLabel(/^Name$/i);
    // Whitespace-only bypasses native required; app validation must still reject.
    await name.fill("   ");
    await page.getByRole("button", { name: "Create animal" }).click();
    await expect(page.getByText(/name is required/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
