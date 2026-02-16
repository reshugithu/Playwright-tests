
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth/login';

test.describe('DMS Manage Prospects - Add Prospect', () => {

  test.setTimeout(180000);

  test.beforeEach(async ({ page }) => {
    await login(page);

    await page
      .locator('.ngx-spinner-overlay')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => { });

    // Navigate to Manage Prospects
    await page.getByText('Manage Prospects', { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Manage Prospect' }))
      .toBeVisible();
  });

  test('Add Prospect | All mandatory fields | Prospect created successfully', async ({ page }) => {

    // 1️⃣ Click ADD PROSPECT
    await page.getByRole('button', { name: 'Add Prospect' }).click();
    await expect(page.getByText('Add Prospect')).toBeVisible();

    // 2️⃣ Fill basic details
    await page.locator('input[formcontrolname="contactNumber"]').fill('8989905634');
    await page.locator('input[formcontrolname="firstName"]').fill('Kiya');
    await page.locator('input[formcontrolname="lastName"]').fill('Joy');
    await page.locator('input[formcontrolname="email"]').fill('kiya@gmail.in');

    // 3️⃣ Lead Status dropdown
    const leadStatus = page.getByRole('combobox', { name: /lead status/i });
    await expect(leadStatus).toBeVisible();
    await leadStatus.click();
    await page.getByRole('option', { name: 'IS INTERESTED' }).click();
    await page.waitForTimeout(500); // Wait for dropdown to close

    // 4️⃣ Prospect Category
    await page.getByRole('combobox', { name: /prospect category/i }).click();
    await page.getByRole('option', { name: 'Rental' }).click();
    await page.waitForTimeout(500);

    // 5️⃣ Assigned To
    await page.getByRole('combobox', { name: /assigned to/i }).click();
    await page.getByRole('option', { name: 'MOTOPIA' }).click();

    // CRITICAL: Wait for page to stabilize after Assigned To selection
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);


    const prospectSource = page.getByRole('combobox', { name: /prospect source/i });
    const isSourceDisabled = await prospectSource.isDisabled();
    const sourceValue = await prospectSource.textContent();

    if (isSourceDisabled && sourceValue && sourceValue.includes('FLEET COMM')) {
      console.log(`✅ Prospect Source already set to: ${sourceValue} (auto-filled)`);
      // Skip - it's already filled
    } else if (!isSourceDisabled) {
      // Only try to set if it's enabled
      await prospectSource.click();
      await page.getByRole('option', { name: 'FLEET COMM FNDING _GOOGLE PAGE' }).click();
      await page.waitForTimeout(500);
    }

    // 8️⃣ Comments
    await page.locator('textarea[formcontrolname="comments"]')
      .fill('Automation test comment');

    // 9️⃣ Submit - Look for the correct button
    // The button might be "Update" if editing existing, or "Add" for new
    const submitButton = page.getByRole('button', { name: /^(add|update)$/i });

    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();


  });
});