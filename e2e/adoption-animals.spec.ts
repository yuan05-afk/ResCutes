import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases|animals|adoption)/, {
    timeout: 30_000,
  });
}

test.describe("Animals, adoption, shelter map, notifications", () => {
  test.setTimeout(120_000);

  test("seeded animals, adoption tab, shelter pin panel, and bell", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/animals");
    await expect(page.getByRole("heading", { name: "Animals" })).toBeVisible();
    await expect(page.getByText("Luna").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Bella").first()).toBeVisible();
    await expect(page.getByText("Rocky").first()).toBeVisible();
    await expect(page.getByText("RC-SEED-001").first()).toBeVisible();

    const deleteBtn = page
      .locator("table")
      .getByRole("button", { name: "Delete" })
      .first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();
    await expect(page.getByText("Delete animal?")).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Delete animal?")).toHaveCount(0);

    await expect(page.getByRole("link", { name: "Adoption" })).toBeVisible();
    await page.getByRole("link", { name: "Adoption" }).click();
    await page.waitForURL(/\/adoption/);
    await expect(page.getByRole("heading", { name: "Adoption" })).toBeVisible();
    await expect(page.getByText(/ready/i).first()).toBeVisible();
    await expect(page.getByText("Luna").first()).toBeVisible();

    await page.getByRole("tab", { name: /Applications/i }).click();
    await expect(page.getByText("Maria Santos")).toBeVisible();
    await expect(page.getByText("Jonah Reyes")).toBeVisible();

    await page.goto("/shelters");
    await expect(page.getByRole("heading", { name: /Shelter/i }).first()).toBeVisible();
    const firstPin = page.locator(".rescutes-map-marker-shell").first();
    await expect(firstPin).toBeVisible({ timeout: 30_000 });
    await firstPin.click();
    await expect(
      page.getByRole("button", { name: "Close shelter details" }),
    ).toBeVisible({ timeout: 10_000 });

    await page.goto("/dashboard");
    await expect(
      page.getByRole("button", { name: /Notifications/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Notifications/i }).click();
    await expect(page.getByRole("dialog", { name: "Notifications" })).toBeVisible();
  });
});
