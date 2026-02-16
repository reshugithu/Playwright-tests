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

    test('TC01 - Click swap_vert → open Move To Customer → click Move', async ({ page }) => {

        // 4️⃣ (Optional but recommended) Click first row
        const firstRow = page.locator('table tbody tr').first();
        await expect(firstRow).toBeVisible();
        await firstRow.click();

        // 5️⃣ Click swap_vert icon (Move To Customer)
        await page.locator(
            'mat-icon[mattooltip="Move To Customer"]:has-text("swap_vert")'
        ).click();

        // 6️⃣ Verify Move To Customer page opened
        await expect(page.getByText('Manage Customer')).toBeVisible();
        await expect(page.getByText('Move To Customer')).toBeVisible();

        // 7️⃣ Click Move button (last button on page)
        await page.getByRole('button', { name: 'Move' }).click();

        // 8️⃣ Verify navigation / success
        await expect(page).toHaveURL(/customer/i);
    });

});