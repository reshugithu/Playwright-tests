import { test, expect } from '@playwright/test';
import { login } from '../utils/auth/login';

test.describe('DMS Manage Prospects', () => {

    test.setTimeout(180000); // 3 minutes

    test.beforeEach(async ({ page }) => {
        // Login to dashboard
        await login(page);

        // Wait for any loading spinners to disappear
        await page.waitForSelector('.ngx-spinner-overlay', {
            state: 'hidden',
            timeout: 10000,
        }).catch(() => {
            console.log('No spinner found or already hidden');
        });

        // Navigate to Manage Prospects page
        await page.click('text=Manage Prospects');

        // Wait for page to load
        await expect(page.locator('text=Manage Prospect')).toBeVisible();
    });

    test('should load Manage Prospects page successfully', async ({ page }) => {
        await expect(page.locator('text=Manage Prospect')).toBeVisible();

        await expect(page.locator('text=Incoming SMS Buffer')).toBeVisible();
        await expect(page.locator('text=Incoming Email Buffer')).toBeVisible();
        await expect(page.locator('text=Active Sales People')).toBeVisible();
        await expect(page.locator('text=Prospect Filter')).toBeVisible();
    });

    test('should expand and collapse Incoming SMS Buffer section', async ({ page }) => {
        const smsSection = page.locator('text=Incoming SMS Buffer').locator('..');

        await smsSection.click();
        await page.waitForTimeout(500);

        await smsSection.click();
        await page.waitForTimeout(500);
    });

    test('should expand and collapse Incoming Email Buffer section', async ({ page }) => {
        const emailSection = page.locator('text=Incoming Email Buffer').locator('..');

        await emailSection.click();
        await page.waitForTimeout(500);

        await emailSection.click();
        await page.waitForTimeout(500);
    });

    test('should expand and collapse Active Sales People section', async ({ page }) => {
        const salesSection = page.locator('text=Active Sales People').locator('..');

        await salesSection.click();
        await page.waitForTimeout(500);

        await salesSection.click();
        await page.waitForTimeout(500);
    });

    test.describe('Prospect Filter - Field Visibility Tests', () => {

        test.beforeEach(async ({ page }) => {
            const prospectIdInput = page.locator('[formcontrolname="prospectId"]');

            await page.locator('text=Prospect Filter').click();
            {
                await page.locator('text=Prospect Filter').click();
            }

            await prospectIdInput.waitFor({ state: 'visible', timeout: 10000 });
        });

    });
});