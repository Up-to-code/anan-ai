import { expect, test } from "@playwright/test";

test("landing page renders primary CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "ابدأ الوصول المجاني" })).toBeVisible();
});

test("theme toggle persists dark mode on public pages", async ({ page }) => {
  await page.goto("/");

  const themeToggle = page.locator('[data-slot="theme-toggle"]').first();
  await expect(themeToggle).toBeVisible();

  await themeToggle.click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator('[data-slot="theme-toggle"]').first()).toBeVisible();
});
