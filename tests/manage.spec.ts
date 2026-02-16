import { test, expect } from "@playwright/test";
import { login } from '../utils/auth/login';

test.describe("Manage User", () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('DMS Manage User - User List Filter', async ({ page }) => {

  // Click Manage User
  await page.locator('text=Manage User').click();

  // ✅ Wait for Users List page to load properly
  await page.waitForURL(/user/i, { timeout: 30000 });

  // ✅ Wait for Add User button (best indicator page loaded)
  await page.getByRole('button', { name: '+ Add User' }).waitFor({ timeout: 30000 });

  // Filters (⚠️ nth selectors risky but ok for now)
  const userIdInput = page.locator('input').nth(0);
  const lastNameInput = page.locator('input').nth(1);
  const isActiveDropdown = page.locator('mat-select').first();
  const cellPhoneInput = page.locator('input').nth(2);

  await userIdInput.fill('PayneMax');
  await lastNameInput.fill('Payne');

  await isActiveDropdown.click();
  await page.locator('mat-option', { hasText: 'All' }).click();

  await cellPhoneInput.fill('7500916078');

  // Refresh button
  const refreshButton = page.locator('mat-icon', { hasText: 'refresh' }).locator('..');
  await refreshButton.click();

  // ✅ Wait for table data to update
  const firstRowUserID = page.locator('tbody tr').first().locator('td').nth(1);
  await expect(firstRowUserID).toHaveText('PayneMax', { timeout: 20000 });

  // Add User
  await page.getByRole('button', { name: '+ Add User' }).click();
});
});