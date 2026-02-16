import { test, expect } from '@playwright/test';
import { login } from '../utils/auth/login';

test.describe('DMS Manage Prospects - Filter Tests', () => {

  test.setTimeout(180000); // 3 minutes

  test.beforeEach(async ({ page }) => {
    // Login to dashboard
    await login(page);

    // Wait for spinner to disappear (if exists)
    await page.locator('.ngx-spinner-overlay').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });

    // Navigate to Manage Prospects page
    await page.click('text=Manage Prospects');
    await expect(page.locator('text=Manage Prospect')).toBeVisible();

    // Wait for page to stabilize
    await page.waitForTimeout(1000);
  });

  test('filter by Prospect Id', async ({ page }) => {
    const panel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');

    // Expand panel if collapsed
    if ((await panel.getAttribute('aria-expanded')) !== 'true') {
      await panel.locator('mat-expansion-panel-header').click();
      await page.waitForTimeout(500);
    }

    // Fill Prospect ID
    await panel.locator('input[formcontrolname="prospectId"]').fill('1186');
    await page.waitForTimeout(500);

    // Try multiple selectors for Apply button
    const applyButton = panel.locator('button[type="submit"]')
      .or(panel.locator('button:has-text("Apply")'))
      .or(panel.locator('button mat-icon'))
      .or(panel.locator('button').first());

    await applyButton.first().click();

    // Wait for results
    await page.waitForTimeout(2000);
    const firstRow = page.locator('table tbody tr:not(.mat-no-data-row)').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });
  });

  test('filter by Category only', async ({ page }) => {
    const panel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');

    // Expand panel if collapsed
    if ((await panel.getAttribute('aria-expanded')) !== 'true') {
      await panel.locator('mat-expansion-panel-header').click();
      await page.waitForTimeout(500);
    }

    // Select category
    await panel.locator('mat-select[formcontrolname="category"]').click();
    await page.waitForTimeout(500);
    await page.locator('mat-option:has-text("Rental")').first().click();
    await page.waitForTimeout(500);

    // Try multiple selectors for Apply button
    const applyButton = panel.locator('button[type="submit"]')
      .or(panel.locator('button:has-text("Apply")'))
      .or(panel.locator('button mat-icon'))
      .or(panel.locator('button').first());

    await applyButton.first().click();

    // Wait for results
    await page.waitForTimeout(2000);
    const firstRow = page.locator('table tbody tr:not(.mat-no-data-row)').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });

  });
  test('User can enter Last Name', async ({ page }) => {

    // 1️⃣ Expand Prospect Filter panel (VERY IMPORTANT)
    const filterHeader = page.getByText('Prospect Filter');
    await filterHeader.click();

    // 2️⃣ Correct locator (NO SPACE)
    const lastNameInput = page.locator('[formcontrolname="lastName"]');

    // 3️⃣ Wait until Angular actually shows it
    await expect(lastNameInput).toBeVisible({ timeout: 15000 });

    // 4️⃣ Scroll + focus (Angular Material needs this)
    await lastNameInput.scrollIntoViewIfNeeded();
    await lastNameInput.click();

    // 5️⃣ Fill value
    await lastNameInput.fill('Steele');

    // 6️⃣ Assertion
    await expect(lastNameInput).toHaveValue('Steele');
    await page.waitForTimeout(500);
  });
  test('User can select Assigned To Sales as MOTOPIA', async ({ page }) => {

    await page.getByText('Prospect Filter', { exact: true }).click();

    const dropdown = page.locator(
      'mat-select[formcontrolname="assignedToSales"]'
    );

    await expect(dropdown).toBeVisible();
    await dropdown.click();

    // ✅ Best practice for Angular Material
    await page.locator('mat-option', { hasText: 'MOTOPIA' }).click();

    // Verify selected value
    await expect(
      dropdown.locator('.mat-select-value-text')
    ).toHaveText('MOTOPIA');
  });



  //   test('User can select Assigned To Sales as MOTOPIA', async ({ page }) => {

  //     // expand filter panel
  //     await page.getByText('Prospect Filter').click();

  //     const dropdown = page.locator('mat-select[formcontrolname="assignedToSales"]');
  //     await expect(dropdown).toBeVisible();

  //     // open dropdown
  //     await dropdown.click();

  //     // select MOTOPIA ONLY (scoped to mat-option)
  //   //  await page.locator('mat-select[formcontrolname="Assigned To Sales"]').click();
  // await page.locator('mat-option span:has-text("MOTOPIA")').click();

  //     // close dropdown
  //     await page.keyboard.press('Escape');

  //     // verify selection
  //     await expect(dropdown).toContainText('MOTOPIA');
  // });
  test('User can select Sales Person Status as Working', async ({ page }) => {

    // Open Prospect Filter
    await page.getByText('Prospect Filter').click();

    const salesStatusDropdown = page.locator('mat-select[formcontrolname="salesPersonStatus"]');
    await salesStatusDropdown.click();

    await page.locator('mat-option >> text=Working').click();

    await expect(salesStatusDropdown).toContainText('Working');
  });
  test('User can select Recent Activity as Last 90 Days', async ({ page }) => {

    // Open Prospect Filter
    await page.getByText('Prospect Filter').click();

    const recentActivityDropdown = page.locator('mat-select[formcontrolname="recentActivity"]');
    await recentActivityDropdown.click();

    await page.locator('mat-option >> text=Last 90 Days').click();

    await expect(recentActivityDropdown).toContainText('Last 90 Days');
  });
  test('User can select Prospect Date as Last 90 Days', async ({ page }) => {

    // Open Prospect Filter
    await page.getByText('Prospect Filter').click();

    const prospectDateDropdown = page.locator('mat-select[formcontrolname="prospectDate"]');
    await prospectDateDropdown.click();

    await page.locator('mat-option >> text=Last 90 Days').click();

    await expect(prospectDateDropdown).toContainText('Last 90 Days');
  });
  test('User can select Lead Status as IS INTERESTED', async ({ page }) => {

    // Open Prospect Filter panel
    await page.getByText('Prospect Filter').click();

    const leadStatusDropdown = page.locator('mat-select[formcontrolname="leadStatus"]');
    await expect(leadStatusDropdown).toBeVisible();

    // Open dropdown
    await leadStatusDropdown.click();

    // Select value
    await page.locator('mat-option >> text=IS INTERESTED').click();

    // Validate selection
    await expect(leadStatusDropdown).toContainText('IS INTERESTED');
  });
  test('User can select Lead Source as FLEET COMM FNDING _GOOGLE PAGE', async ({ page }) => {

    // Open Prospect Filter panel
    await page.getByText('Prospect Filter').click();

    const leadSourceDropdown = page.locator('mat-select[formcontrolname="leadSource"]');
    await expect(leadSourceDropdown).toBeVisible();

    // Open dropdown
    await leadSourceDropdown.click();

    // Select value
    await page.locator('mat-option >> text=FLEET COMM FNDING _GOOGLE PAGE').click();

    // Validate selection
    await expect(leadSourceDropdown).toContainText('FLEET COMM FNDING _GOOGLE PAGE');
  });

  test('User can select Prospect Type as MANUAL', async ({ page }) => {

    // Open Prospect Filter panel
    await page.getByText('Prospect Filter').click();

    const prospectTypeDropdown = page.locator('mat-select[formcontrolname="prospectType"]');
    await expect(prospectTypeDropdown).toBeVisible();

    // Open dropdown
    await prospectTypeDropdown.click();

    // Select value
    await page.locator('mat-option >> text=MANUAL').click();

    // Validate selection
    await expect(prospectTypeDropdown).toContainText('MANUAL');
  });
  test('User can select General Counter as 1 And Up', async ({ page }) => {

    // Open Prospect Filter panel
    await page.getByText('Prospect Filter').click();

    const generalCounterDropdown = page.locator('mat-select[formcontrolname="generalCounter"]');
    await expect(generalCounterDropdown).toBeVisible();

    // Open dropdown
    await generalCounterDropdown.click();

    // Select value
    await page.locator('mat-option >> text=1 And Up').click();

    // Validate selection
    await expect(generalCounterDropdown).toContainText('1 And Up');
  });
  test('User can select Walk-In Counter as 1 And Up', async ({ page }) => {

    // Open Prospect Filter panel
    await page.getByText('Prospect Filter').click();

    const walkInCounterDropdown = page.locator('mat-select[formcontrolname="walkInCounter"]');
    await expect(walkInCounterDropdown).toBeVisible();

    // Open dropdown
    await walkInCounterDropdown.click();

    // Select value
    await page.locator('mat-option >> text=1 And Up').click();

    // Validate selection
    await expect(walkInCounterDropdown).toContainText('1 And Up');
  });
  // test('User can select Assigned To Marketer as CarcPau', async ({ page }) => {

  //   // Open Prospect Filter panel
  //   await page.getByText('Prospect Filter').click();

  //   const assignedToMarketerDropdown = page.locator(
  //     'mat-select[formcontrolname="assignedToMarketer"]'
  //   );
  //   await expect(assignedToMarketerDropdown).toBeVisible();

  //   // Open dropdown
  //   await assignedToMarketerDropdown.click();

  //   // Select value (scoped to mat-option to avoid strict mode issues)
  //   await page.locator('mat-option >> text=CarcPau').click();

  //   // Validate selection
  //   await expect(assignedToMarketerDropdown).toContainText('CarcPau');
  // });
  // test('User can select Marketer Person Status as Last User', async ({ page }) => {

  //   // Open Prospect Filter panel
  //   await page.getByText('Prospect Filter').click();

  //   const marketerPersonStatusDropdown = page.locator(
  //     'mat-select[formcontrolname="marketerPersonStatus"]'
  //   );
  //   await expect(marketerPersonStatusDropdown).toBeVisible();

  //   // Open dropdown
  //   await marketerPersonStatusDropdown.click();

  //   // Select value
  //   await page.locator('mat-option >> text=Last User').click();

  //   // Validate selection
  //   await expect(marketerPersonStatusDropdown).toContainText('Last User');
  // });
  test('User can reset all filters using Reset icon button', async ({ page }) => {

    const panel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');

    // 1️⃣ Expand Prospect Filter panel if collapsed
    if ((await panel.getAttribute('aria-expanded')) !== 'true') {
      await panel.locator('mat-expansion-panel-header').click();
      await page.waitForTimeout(500);
    }

    // 2️⃣ Apply few filters (enough to validate reset)

    // Prospect Id
    const prospectIdInput = panel.locator('input[formcontrolname="prospectId"]');
    await expect(prospectIdInput).toBeVisible();
    await prospectIdInput.fill('1186');

    // 3️⃣ Click Reset / Refresh icon button (NO TEXT)
    const resetButton = panel.locator('button').filter({
      has: page.locator('mat-icon')
    });

    await resetButton.first().click();
    await page.waitForTimeout(1000);

    // 4️⃣ Assertions – verify reset

    // Text field cleared
    await expect(prospectIdInput).toHaveValue('');

    // Dropdowns cleared

  });

});