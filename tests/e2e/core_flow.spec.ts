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

  test("onboarding 3-screen flow renders, navigates, validates empty inputs, and preserves state on back", async ({ page }) => {
    await page.goto("/onboarding");

    // Screen 1: Welcome
    await expect(page.getByRole("heading", { name: "Let’s get your care space ready." })).toBeVisible();
    await expect(page.getByText("Family Care keeps your family’s care responsibilities")).toBeVisible();
    await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();
    await page.click("button:has-text('Get started')");

    // Screen 2: Create Workspace
    await expect(page.getByRole("heading", { name: "Who are you caring for?" })).toBeVisible();
    await expect(page.getByLabel("Workspace name")).toBeVisible();
    await expect(page.getByLabel("Care recipient preferred name")).toBeVisible();

    // Test Empty Input Validation
    await page.click("button:has-text('Create workspace')");
    await expect(page.getByText("Please give your care workspace a name.")).toBeVisible();

    await page.fill("#workspace-name", "Care for Mom");
    await page.click("button:has-text('Create workspace')");
    await expect(page.getByText("Please enter your care recipient's preferred name.")).toBeVisible();

    // Test Back button navigation & state preservation
    await page.click("button:has-text('Back')");
    await expect(page.getByRole("heading", { name: "Let’s get your care space ready." })).toBeVisible();
    await page.click("button:has-text('Get started')");
    await expect(page.locator("#workspace-name")).toHaveValue("Care for Mom");
  });
});


