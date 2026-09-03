import { test, expect } from "@playwright/test";
import path from "path";

async function loginAsStaff(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("staff@rescutes.demo");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(dashboard|rescue-cases)/);
}

test.describe("Shelter map page", () => {
  test("loads map, filters, and shelter details", async ({ page }) => {
    await loginAsStaff(page);
    await page.goto("/shelters");
    await page.waitForSelector(".rescutes-map", { timeout: 30_000 });

    await expect(
      page.getByRole("heading", { name: "Philippines Shelter Map" }),
    ).toBeVisible();

    const directory = page.getByRole("heading", { name: "Directory" });
    await expect(directory).toBeVisible();

    await expect(page.getByText("PAWS Animal Rehabilitation Center")).toBeVisible();

    const search = page.getByPlaceholder("Search shelter, city, or region...");
    await search.fill("CARA");
    const caraDirectoryItem = page.getByRole("button", {
      name: /CARA Welfare Philippines.*Mandaluyong City/i,
    });
    await expect(caraDirectoryItem).toBeVisible();

    await caraDirectoryItem.click();
    await expect(
      page.getByRole("button", { name: "Close shelter details" }),
    ).toBeVisible();
    await expect(page.getByText("Accepts: Dog, Cat").first()).toBeVisible();

    await page.screenshot({
      path: path.join("e2e", "screenshots", "shelters-map-desktop.png"),
      fullPage: false,
    });
  });
});
