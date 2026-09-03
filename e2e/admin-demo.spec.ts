import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases)/, { timeout: 30_000 });
}

test.describe("Administrator full access", () => {
  test("has full web access, mobile switch, and assignment demo", async ({ page }) => {
    test.setTimeout(90_000);

    await loginAsAdmin(page);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Operations Overview" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Mobile app/i }).first()).toBeVisible();

    await page.goto("/rescue-cases");
    await expect(page.getByRole("heading", { name: "Rescue Cases" })).toBeVisible();
    await expect(page.getByText(/\d+ cases? in system/)).toBeVisible();

    await page.goto("/animals");
    await expect(page.getByRole("heading", { name: "Animals" })).toBeVisible();
    await expect(page.getByText("Luna").first()).toBeVisible();

    await page.goto("/adoption");
    await expect(page.getByRole("heading", { name: "Adoption" })).toBeVisible();

    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Shelter Settings" })).toBeVisible();
    await expect(page.getByText(/view-only access/i)).not.toBeVisible();

    await page.goto("/mobile");
    await expect(page.getByTestId("mobile-device-frame")).toBeVisible();
    await expect(page.getByRole("link", { name: /Dashboard/i })).not.toBeVisible();
    await expect(page.getByRole("link", { name: /Report an Animal/i }).first()).toBeVisible();

    await page.getByRole("link", { name: "Profile", exact: true }).click();
    await page.waitForURL("/mobile/profile");
    await expect(page.getByRole("link", { name: /Open dashboard/i })).toBeVisible();

    const assignmentLink = page.getByRole("link", { name: /View Assignment/i });
    if (await assignmentLink.count()) {
      await assignmentLink.first().click();
      await expect(page.getByRole("button", { name: /Accept Assignment/i })).toBeVisible();
      await page.goto("/mobile/profile");
    }

    await page.getByRole("link", { name: /Open dashboard/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Operations Overview" })).toBeVisible();
  });
});
