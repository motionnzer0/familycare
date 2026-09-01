import { test, expect } from "@playwright/test";

test.describe("Slice 0 Smoke Test", () => {
  test("navigation structure and title are present", async ({ page }) => {
    // Basic structural smoke test verifying shell elements
    await page.goto("/today");

    // Expect to be redirected to login or see Today page
    await expect(page).toHaveTitle(/Family Care Command Center/);
  });
});
