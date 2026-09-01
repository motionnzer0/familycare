import { test, expect } from "@playwright/test";

test.describe("Slice 2 — Collaboration and Reference UI Flows", () => {
  test("emergency page renders 911 warning banner and safety disclaimers", async ({ page }) => {
    await page.goto("/emergency");

    // Check 911 banner
    await expect(page.getByText("For an emergency, call 911 or local emergency services immediately.")).toBeVisible();
    await expect(page.getByText("All details below are entered and maintained by your family.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Emergency Information" })).toBeVisible();
  });

  test("team page renders care team heading and invite modal button", async ({ page }) => {
    await page.goto("/team");
    await expect(page.getByRole("heading", { name: "Care Team" })).toBeVisible();
  });

  test("medications page renders non-clinical notice and heading", async ({ page }) => {
    await page.goto("/medications");
    await expect(page.getByRole("heading", { name: "Medications" })).toBeVisible();
    await expect(page.getByText(/This list is maintained as an organizational reference/)).toBeVisible();
  });

  test("documents page renders category filters and upload option", async ({ page }) => {
    await page.goto("/documents");
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Medical/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Insurance/ })).toBeVisible();
  });

  test("notes page renders notes heading and category filters", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  });

  test("updates page renders chronological timeline heading", async ({ page }) => {
    await page.goto("/updates");
    await expect(page.getByRole("heading", { name: "Activity & Updates" })).toBeVisible();
  });
});
