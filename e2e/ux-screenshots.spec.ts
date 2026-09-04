import { test, expect } from "@playwright/test";
import path from "path";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases|animals|adoption)/, {
    timeout: 30_000,
  });
}

test.describe("UX screenshots", () => {
  test.setTimeout(120_000);

  test("capture key pages at desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAsAdmin(page);

    const shots = [
      ["/dashboard", "dashboard"],
      ["/rescue-cases", "rescue-cases"],
      ["/animals", "animals"],
      ["/adoption", "adoption"],
      ["/shelters", "shelters"],
      ["/settings", "settings"],
    ] as const;

    for (const [route, name] of shots) {
      await page.goto(route);
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join("e2e", "screenshots", `${name}-ux.png`),
        fullPage: false,
      });
    }

    // Confirm bell sits in Operations Overview header (not a separate top bar)
    await page.goto("/dashboard");
    const header = page.locator("header").filter({
      has: page.getByRole("heading", { name: "Operations Overview" }),
    });
    await expect(header.getByRole("button", { name: /Notifications/i })).toBeVisible();

    // Animal detail hierarchy
    await page.goto("/animals");
    await page.locator("table").getByRole("link", { name: "Edit" }).first().click();
    await page.waitForURL(/\/animals\//);
    await expect(page.getByText("Edit profile")).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: path.join("e2e", "screenshots", "animal-detail-ux.png"),
      fullPage: false,
    });
  });
});
