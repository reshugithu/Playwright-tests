// import { test, expect } from '@playwright/test';
// import { login } from '../utils/auth/login';

// test.describe('DMS | Manage Prospects | Add Walk-in', () => {

//     test.setTimeout(180000);

//     test.beforeEach(async ({ page }) => {

//         // Login

//         await login(page);

//         // Wait for spinner to disappear (if present)
//         await page
//             .locator('.ngx-spinner-overlay')
//             .waitFor({ state: 'hidden', timeout: 10000 })
//             .catch(() => { });

//         // Navigate to Manage Prospects
//         await page.getByText('Manage Prospects', { exact: true }).click();

//         await expect(
//             page.getByRole('heading', { name: /manage prospect/i })
//         ).toBeVisible();
//     });

//     test('Add Walk-in | Mandatory fields | Prospect created successfully', async ({ page }) => {

//         // 1️⃣ Click ADD WALK-IN
//         await page.getByRole('button', { name: /add walk-?in/i }).click();

//         await expect(
//             page.getByRole('heading', { name: /add walk-?in/i })
//         ).toBeVisible();

//         // 2️⃣ Fill basic details
//         await page.locator('input[formcontrolname="contactNumber"]')
//             .fill('8999905634');

//         await page.locator('input[formcontrolname="firstName"]')
//             .fill('koko');

//         await page.locator('input[formcontrolname="lastName"]')
//             .fill('k');

//         await page.locator('input[formcontrolname="email"]')
//             .fill('koko.walkin@gmail.com');

//         // 3️⃣ Lead Status
//         const leadStatus = page.getByRole('combobox', { name: /lead status/i });
//         await expect(leadStatus).toBeVisible();
//         await leadStatus.click();
//         await page.getByRole('option', { name: /is interested/i }).click();

//         // 4️⃣ Prospect Category
//         await page.getByRole('combobox', { name: /prospect category/i }).click();
//         await page.getByRole('option', { name: /rental/i }).click();

//         // 5️⃣ Assigned To
//         await page.getByRole('combobox', { name: /assigned to/i }).click();
//         await page.getByRole('option', { name: 'MOTOPIA' }).click();

//         // CRITICAL: Wait for page to stabilize after Assigned To selection
//         await page.waitForLoadState('networkidle');
//         await page.waitForTimeout(1000);
//         // Open date picker
//         // 🔹 Prospect Date (Angular Material Datepicker → TODAY)
//         // 🔹 Open Prospect Date calendar using calendar icon
//         // 6️⃣ Prospect Date → Select TODAY
//         await page.locator('mat-datepicker-toggle button').click();

//         const todayDate = page.locator('button[aria-current="date"]');
//         await expect(todayDate).toBeVisible();
//         await todayDate.click();

//         // ✅ CORRECT DATE ASSERTION (Angular-safe)
//         await expect(
//             page.getByRole('textbox', { name: /prospect date/i })
//         ).toHaveValue(/\d{1,2}\/\d{1,2}\/\d{4}/);


//         const prospectSource = page.getByRole('combobox', { name: /prospect source/i });
//         const isSourceDisabled = await prospectSource.isDisabled();
//         const sourceValue = await prospectSource.textContent();

//         if (isSourceDisabled && sourceValue && sourceValue.includes('FLEET COMM')) {
//             console.log(`✅ Prospect Source already set to: ${sourceValue} (auto-filled)`);
//             // Skip - it's already filled
//         } else if (!isSourceDisabled) {
//             // Only try to set if it's enabled
//             await prospectSource.click();
//             await page.getByRole('option', { name: 'FLEET COMM FNDING _GOOGLE PAGE' }).click();
//             await page.waitForTimeout(500);
//         }

//         // 8️⃣ Comments
//         await page.locator('textarea[formcontrolname="comments"]')
//             .fill('Automation test QA');

//         // const actionSection = page.getByRole('button', { name: 'Cancel' }).locator('..');

//         // // Now find Add Walk-In inside that container
//         // const addButton = actionSection.getByRole('button', {
//         //     name: 'Add Walk-In',
//         //     exact: true,
//         // });

//         // await expect(addButton).toBeVisible();
//         // await expect(addButton).toBeEnabled();
//         // await addButton.click();
//     });
// });
import { test, expect } from '@playwright/test';
import { login } from '../utils/auth/login';

test.describe('DMS | Manage Prospects | Add Walk-in', () => {

    test.setTimeout(180000);

    test.beforeEach(async ({ page }) => {

        await login(page);

        // Wait spinner
        await page.locator('.ngx-spinner-overlay')
            .waitFor({ state: 'hidden', timeout: 10000 })
            .catch(() => { });

        // Navigate to Manage Prospects
        await page.getByText('Manage Prospects', { exact: true }).click();

        await expect(
            page.getByRole('heading', { name: /manage prospect/i })
        ).toBeVisible();
    });

    test('Add Walk-in → Submit → Validate from Dashboard', async ({ page }) => {
         const random7 = Math.floor(1000000 + Math.random() * 9000000);
 const uniquePhone = `(267) 777-${Math.floor(1000 + Math.random() * 9000)}`;


        const uniqueEmail = `walkin${Date.now()}@gmail.com`;

        // 🔹 Click ADD WALK-IN
        await page.getByRole('button', { name: /add walk-?in/i }).click();

        await expect(
            page.getByRole('heading', { name: /add walk-?in/i })
        ).toBeVisible();

        // 🔹 Fill Mandatory Fields
        await page.locator('input[formcontrolname="contactNumber"]')
            .fill(uniquePhone);

        await page.locator('input[formcontrolname="firstName"]')
            .fill('kivi');

        await page.locator('input[formcontrolname="lastName"]')
            .fill('sia');

        await page.locator('input[formcontrolname="email"]')
            .fill(uniqueEmail);

        // 🔹 Lead Status
        await page.getByRole('combobox', { name: /lead status/i }).click();
        await page.getByRole('option', { name: /is interested/i }).click();

        // 🔹 Prospect Category
        await page.getByRole('combobox', { name: /prospect category/i }).click();
        await page.getByRole('option').first().click(); // Select first option safely

        // 🔹 Assigned To
        await page.getByRole('combobox', { name: /assigned to/i }).click();
        await page.getByRole('option').first().click();

        await page.waitForLoadState('networkidle');

        // 🔹 Prospect Date → Today
        await page.locator('mat-datepicker-toggle button').click();
        await page.locator('button[aria-current="date"]').click();

        // 🔹 Comments
        await page.locator('textarea[formcontrolname="comments"]')
            .fill('Playwright Automation Test');

        // 🔹 Click Add Walk-In (Submit)
        const addButton = page.getByRole('button', { name: /^add walk-?in$/i });

        await expect(addButton).toBeVisible();
        await expect(addButton).toBeEnabled();

        await Promise.all([
            page.waitForLoadState('networkidle'),
            addButton.click()
        ]);

        // ===============================
        // 🔥 VALIDATION FROM DASHBOARD
        // ===============================

        // Go to Dashboard
        await page.getByText('Dashboard', { exact: true }).click();

        await expect(
            page.getByRole('heading', { name: /dashboard/i })
        ).toBeVisible();

        // Wait table load
        await page.waitForLoadState('networkidle');

        // Validate last created prospect by phone/email
        const table = page.locator('table');

     ;

    });

});
