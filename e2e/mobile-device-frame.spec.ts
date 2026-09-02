import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases)/, { timeout: 30_000 });
}

test.describe("Mobile device frame", () => {
  test("shows iPhone frame on desktop and keeps mobile app functional", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    await loginAsAdmin(page);
    await page.goto("/mobile");

    await expect(page.getByTestId("mobile-device-frame-shell")).toBeVisible();
    await expect(page.getByTestId("mobile-device-frame")).toBeVisible();
    await expect(page.getByRole("link", { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Report an Animal/i }).first()).toBeVisible();

    await page.getByRole("link", { name: "Cases", exact: true }).click();
    await page.waitForURL("/mobile/cases");
    await expect(page.getByRole("heading", { name: "My Cases" })).toBeVisible();

    await page.getByRole("link", { name: "Home", exact: true }).click();
    await page.waitForURL("/mobile");
    await expect(page.getByTestId("mobile-device-frame")).toBeVisible();
  });

  test("uses full-screen layout on narrow viewports without device frame", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsAdmin(page);
    await page.goto("/mobile");

    await expect(page.getByTestId("mobile-device-frame-shell")).not.toBeVisible();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Report an Animal/i }).first()).toBeVisible();
  });
});
