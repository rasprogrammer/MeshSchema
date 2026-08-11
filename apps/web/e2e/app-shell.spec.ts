import { test, expect } from "@playwright/test";

test.describe("App shell", () => {
  test("home page resolves to either login or dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(login|dashboard)/);
  });

  test("login form rejects an empty submit via required fields", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.getByLabel("Email");
    await expect(emailInput).toHaveAttribute("required", "");
    const passwordInput = page.getByLabel("Password");
    await expect(passwordInput).toHaveAttribute("required", "");
  });
});
