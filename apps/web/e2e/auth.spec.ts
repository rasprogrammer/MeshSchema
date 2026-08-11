import { test, expect } from "@playwright/test";

/**
 * These specs exercise the auth screens against whatever backend
 * E2E_API_URL points at (a disposable test DB/instance in CI). They avoid
 * asserting on backend-specific copy so they stay resilient to wording
 * tweaks — the contract under test is "the right screen renders".
 */

test.describe("Authentication", () => {
  test("redirects an unauthenticated visitor to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders email/password fields and OAuth options", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("link", { name: "Google" }).or(page.getByRole("button", { name: "Google" }))).toBeVisible();
  });

  test("shows a validation-friendly error on bad credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nonexistent-user@example.com");
    await page.getByLabel("Password").fill("wrong-password-123");
    await page.getByRole("button", { name: /sign in/i }).click();

    // A toast or inline error should surface — we don't assert exact copy.
    await expect(page.getByText(/invalid|failed|incorrect/i)).toBeVisible({ timeout: 10_000 });
  });

  test("register page links back to login", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("link", { name: /sign in|log in/i })).toBeVisible();
  });
});
