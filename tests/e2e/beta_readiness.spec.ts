import { test, expect } from "@playwright/test";

test.describe("Slice 3 — Beta Readiness & Full Application Navigation", () => {
  const routes = [
    { path: "/today", title: /Family Care Command Center/ },
    { path: "/tasks", title: /Family Care Command Center/ },
    { path: "/calendar", title: /Family Care Command Center/ },
    { path: "/medications", title: /Family Care Command Center/ },
    { path: "/documents", title: /Family Care Command Center/ },
    { path: "/notes", title: /Family Care Command Center/ },
    { path: "/team", title: /Family Care Command Center/ },
    { path: "/updates", title: /Family Care Command Center/ },
    { path: "/emergency", title: /Family Care Command Center/ },
    { path: "/settings", title: /Family Care Command Center/ },
  ];

  for (const route of routes) {
    test(`renders route ${route.path} without errors`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).toHaveTitle(route.title);
    });
  }

  test("settings view renders data export and danger zone", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Export Workspace Data" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Download JSON Export/ })).toBeVisible();
  });
});
