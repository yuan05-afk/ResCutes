import { test, expect, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases)/, { timeout: 30_000 });
}

async function expectAppInsidePhoneFrame(page: Page) {
  const shell = page.getByTestId("mobile-device-frame-shell");
  const frame = page.getByTestId("mobile-device-frame");
  await expect(shell).toBeVisible();
  await expect(frame).toBeVisible();

  const shellBox = await shell.boundingBox();
  const frameBox = await frame.boundingBox();
  expect(shellBox).toBeTruthy();
  expect(frameBox).toBeTruthy();
  if (!shellBox || !frameBox) return;

  // Full phone mockup (including bezel) must stay inside the viewport shell.
  expect(frameBox.x).toBeGreaterThanOrEqual(shellBox.x - 1);
  expect(frameBox.y).toBeGreaterThanOrEqual(shellBox.y - 1);
  expect(frameBox.x + frameBox.width).toBeLessThanOrEqual(
    shellBox.x + shellBox.width + 1,
  );
  expect(frameBox.y + frameBox.height).toBeLessThanOrEqual(
    shellBox.y + shellBox.height + 1,
  );

  // App chrome should render inside the framed screen, not as a full-bleed iPad page.
  const adoptHeading = page.getByRole("heading", { name: "Adopt" });
  if (await adoptHeading.isVisible().catch(() => false)) {
    const headingBox = await adoptHeading.boundingBox();
    expect(headingBox).toBeTruthy();
    if (headingBox) {
      expect(headingBox.x).toBeGreaterThanOrEqual(frameBox.x - 2);
      expect(headingBox.y).toBeGreaterThanOrEqual(frameBox.y - 2);
      expect(headingBox.x + headingBox.width).toBeLessThanOrEqual(
        frameBox.x + frameBox.width + 2,
      );
      expect(headingBox.y + headingBox.height).toBeLessThanOrEqual(
        frameBox.y + frameBox.height + 2,
      );
    }
  }
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
    await expect(page.getByRole("link", { name: /Dashboard/i })).not.toBeVisible();
    await expect(page.getByRole("link", { name: /Report an Animal/i }).first()).toBeVisible();

    await page.getByRole("link", { name: "Profile", exact: true }).click();
    await page.waitForURL("/mobile/profile");
    await expect(page.getByRole("link", { name: /Open dashboard/i })).toBeVisible();

    await page.getByRole("link", { name: "Cases", exact: true }).click();
    await page.waitForURL("/mobile/cases");
    await expect(
      page.getByRole("heading", { name: "Cases", exact: true }),
    ).toBeVisible();

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

  for (const device of [
    { name: "iPad portrait", width: 820, height: 1180 },
    { name: "iPad landscape", width: 1180, height: 820 },
    { name: "iPad Mini", width: 768, height: 1024 },
    { name: "Desktop", width: 1440, height: 900 },
  ] as const) {
    test(`keeps app inside phone frame on ${device.name}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({
        width: device.width,
        height: device.height,
      });
      await loginAsAdmin(page);
      await page.goto("/mobile/adoption");
      await expect(
        page.getByRole("heading", { name: "Adopt", exact: true }),
      ).toBeVisible({ timeout: 30_000 });
      await expectAppInsidePhoneFrame(page);
      await expect(
        page.getByRole("navigation", { name: "Mobile navigation" }),
      ).toBeVisible();
    });
  }

  for (const device of [
    { name: "iPhone 14", width: 390, height: 844 },
    { name: "iPhone SE", width: 375, height: 667 },
    { name: "Android Pixel", width: 412, height: 915 },
  ] as const) {
    test(`stays full-bleed without frame on ${device.name}`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({
        width: device.width,
        height: device.height,
      });
      await loginAsAdmin(page);
      await page.goto("/mobile/adoption");
      await expect(page.getByTestId("mobile-device-frame-shell")).not.toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Mobile navigation" }),
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: "Adopt" })).toBeVisible();
    });
  }
});
