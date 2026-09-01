import { test, expect } from "@playwright/test";

test.describe("Slice 1 — Core Caregiver Flow", () => {
  test("login page renders accessible fields and link to register", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create one" })).toBeVisible();
  });

  test("registration page renders name, email, password, and submit", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
    await expect(page.getByLabel("Your full name")).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel(/Password/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("onboarding flow steps are navigatable", async ({ page }) => {
    await page.goto("/onboarding");

    await expect(page.getByRole("heading", { name: "Name your care workspace" })).toBeVisible();
    await page.fill("#ws-name", "Care for Mom");
    await page.click("button:has-text('Continue')");

    await expect(page.getByRole("heading", { name: "Who is receiving care?" })).toBeVisible();
    await page.fill("#cr-name", "Mom");
    await page.click("button:has-text('Continue')");

    // Emergency contact step
    await expect(page.getByRole("heading", { name: "Primary Emergency Contact" })).toBeVisible();
    await page.click("button:has-text('Continue')");

    // Care team circle step
    await expect(page.getByRole("heading", { name: "Care Team Circle" })).toBeVisible();
    await page.click("button:has-text('Continue')");

    // First task step
    await expect(page.getByRole("heading", { name: "Add your first task" })).toBeVisible();
    await page.click("button:has-text('Continue')");

    // First appointment step
    await expect(page.getByRole("heading", { name: "Add an upcoming appointment" })).toBeVisible();
    await page.click("button:has-text('Continue')");

    // Ready step
    await expect(page.getByRole("heading", { name: "You're all set!" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go to Dashboard" })).toBeVisible();
  });
});
