import { Page, expect } from '@playwright/test';

export async function login(page: Page) {

  await page.goto('http://67.225.241.179:89/auth/login', {
    waitUntil: 'domcontentloaded'
  });

  // Wait for username field
  await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });

  
  // Fill credentials
  await page.locator('[formcontrolname="userid"]').fill('developer2');
  await page.locator('[formcontrolname="Password"]').fill('NineDob109');

  // Click login
  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait for navigation
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  // ✅ Correct dashboard assertion
 await expect(
    page.locator('span:has-text("Dashboard")').first()
  ).toBeVisible({ timeout: 30000 });
}

