import { test, expect } from '@playwright/test';
import { login } from '../utils/auth/login';

test.describe('DMS - Manage User - Add User', () => {

  test.setTimeout(180000); // 3 minutes

  test.beforeEach(async ({ page }) => {
    // Login to dashboard
    await login(page);

    // Navigate to Manage User
    console.log('🔹 Navigating to Manage User');
    await page.locator('#expandIcon1').click();
    await page.waitForTimeout(500);

    await page.locator('#item_1').click();
    await page.waitForLoadState('networkidle');

    // Verify we're on Users List page
    await expect(page.getByText('Users List')).toBeVisible({ timeout: 10000 });

  });

  test('TC-ADD-USER-01: Navigate to Add User form', async ({ page }) => {
    console.log('\n🧪 TC-ADD-USER-01: Click Add User button\n');

    // Click Add User button
    const addUserButton = page.getByRole('button', { name: /\+ Add User/i });
    await expect(addUserButton).toBeVisible();
    await addUserButton.click();

    console.log('✅ Add User button clicked');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/add-user/i);
    console.log('✅ Add User form loaded');
    // Verify all form sections are visible
    await expect(page.getByText('User Id *')).toBeVisible();
    await expect(page.getByText('First Name *')).toBeVisible();
    await expect(page.getByText('Middle Name ')).toBeVisible();
    await expect(page.getByText('Last Name *')).toBeVisible();
    await expect(page.getByText('DMS Email/Phone *')).toBeVisible();
    await expect(page.getByText('Role *')).toBeVisible();

    console.log('✅ All form fields visible');
  });

  test('TC-ADD-USER-02: Fill complete Add User form', async ({ page }) => {
    console.log('\n🧪 TC-ADD-USER-02: Fill all form fields\n');

    // Click Add User button
    await page.getByRole('button', { name: /\+ Add User/i }).click();
    await page.waitForLoadState('networkidle');

    // SECTION 1: Basic Info
    console.log('🔹 SECTION 1: Basic Information');


    const userIdInput = page
      .locator('mat-form-field', { hasText: 'User Id' })
      .locator('input');

    await expect(userIdInput).toBeVisible({ timeout: 10000 });
    await userIdInput.fill('Test12');



    // First Name
    const firstNameInput = page.getByPlaceholder('First Name *').or(
      page.locator('input').nth(1)
    );
    await firstNameInput.fill('Test');

    // Middle Name (optional)
    const middleNameInput = page.getByPlaceholder('Middle Name').or(
      page.locator('input').nth(2)
    );
    await middleNameInput.fill('Middle');

    // Last Name
    const lastNameInput = page.getByPlaceholder('Last Name *').or(
      page.locator('input').nth(3)
    );
    await lastNameInput.fill('User');
    console.log('✅ Last Name: User');

    const dmsEmailInput = page.locator('input[formcontrolname="dmsEmail"]');
    await dmsEmailInput.fill('testuser@dms.com');
    console.log('✅ DMS Email/Phone filled');
    const extInput = page.locator('input[formcontrolname="ext"]');
    await extInput.fill('11');
    console.log('✅ EXT filled');



    // Enable Roaming User checkbox
    // const enableRoamingCheckbox = page.locator('mat-checkbox', {
    //   hasText: 'Enable Roaming User'
    // });

    // await enableRoamingCheckbox.click();
    // console.log('✅ Enable Roaming User enabled');

    // // EXT For Roaming
    // const roamingExtInput = page.locator('input[formcontrolname="roamingExt"]');

    // await expect(roamingExtInput).toBeVisible();
    // await expect(roamingExtInput).toBeEnabled();
    // await roamingExtInput.evaluate(el => (el as HTMLInputElement).value = '1');

    // // await roamingExtInput.fill('897770');
    // console.log('✅ EXT For Roaming filled');
    // // Enable Exchange Email checkbox
    // const enableExchangeCheckbox = page.locator('mat-checkbox', {
    //   hasText: 'Enable Exchange Email'
    // });

    // await enableExchangeCheckbox.click();

    // const exchangeEmailInput = page.locator('input[formcontrolname="exchangeEmail"]');

    // await expect(exchangeEmailInput).toBeVisible();
    // await expect(exchangeEmailInput).toBeEnabled();
    // await exchangeEmailInput.evaluate(el => (el as HTMLInputElement).value = 'Reshma@test.com');



    const roleDropdown = page.locator('mat-select[formcontrolname="role"]');

    await expect(roleDropdown).toBeVisible();
    await roleDropdown.click();

    await page.getByRole('option', { name: 'General Manager' }).click();

    await expect(roleDropdown).toContainText('General Manager');



    const emailInput = page.locator('input[formcontrolname="email"]');
    await emailInput.fill('abc@example.com');


    const cellPhoneInput = page.locator('input[formcontrolname="cellPhone"]');
    await cellPhoneInput.fill('1234567890');
    console.log('✅ Cell Phone filled');


    const passwordInput = page.locator('input[formcontrolname="passW"]');
    await passwordInput.scrollIntoViewIfNeeded();
    await expect(passwordInput).toBeEnabled();
    await passwordInput.fill('SecurePass123!');
    await cellPhoneInput.click();


    const confirmPasswordInput = page.locator(
      'input[formcontrolname="confirmPassword"]'
    );

    await confirmPasswordInput.scrollIntoViewIfNeeded();

    await confirmPasswordInput.click();
    await confirmPasswordInput.fill('SecurePass123!');

    const homePhoneInput = page.locator('input[formcontrolname="homePhone"]');

    if (await homePhoneInput.isVisible()) {
      await homePhoneInput.scrollIntoViewIfNeeded();
      await homePhoneInput.fill('9876543210');
    }



    const commissionInput = page.locator('input[formcontrolname="comission"]');

    if (await commissionInput.isVisible()) {
      await commissionInput.scrollIntoViewIfNeeded(); // bring into view

      await commissionInput.fill('1');
    }


    const loginFromDropdown = page.locator(
      'mat-select[formcontrolname="loginFrom"]'
    );

    await loginFromDropdown.click();
    await page.getByRole('option', { name: 'Any Wan IP' }).click();

    const address1Input = page.locator(
      'input[formcontrolname="address1"]'
    );
    await address1Input.scrollIntoViewIfNeeded();
    await address1Input.click();
    await address1Input.fill('26 FEDERAL PLAZA');

    await expect(address1Input).toHaveValue('26 FEDERAL PLAZA');
    console.log('✅ Address 1 filled');

    /* =========================
       City (Mandatory)
    ========================== */
    const cityInput = page.locator(
      'input[formcontrolname="city"]'
    );
    await cityInput.click();
    await cityInput.fill('New York');

    await expect(cityInput).toHaveValue('New York');
    console.log('✅ City filled');

    /* =========================
       State (Mandatory Dropdown)
    ========================== */
    const stateDropdown = page.locator(
      'mat-select[formcontrolname="state"]'
    );
    await stateDropdown.click();

    // Select NY
    await page.getByRole('option', { name: 'NY' }).click();

    await expect(stateDropdown).toContainText('NY');
    console.log('✅ State selected');

    /* =========================
       Zip Code
    ========================== */
    const zipCodeInput = page.locator(
      'input[formcontrolname="zipCode"]'
    );
    await zipCodeInput.fill('10278');

    await expect(zipCodeInput).toHaveValue('10278');
    console.log('✅ Zip Code filled');

    /* =========================
       Address 2 (Optional)
    ========================== */
    const address2Input = page.locator(
      'input[formcontrolname="address2"]'
    );
    if (await address2Input.isVisible()) {
      await address2Input.fill('Suite 100');
      console.log('✅ Address 2 filled');
    }

    /* =========================
       Social Security (Optional)
    ========================== */
    const socialSecInput = page.locator(
      'input[formcontrolname="socialSec"]'
    );
    if (await socialSecInput.isVisible()) {
      await socialSecInput.fill('123456789');
      console.log('✅ Social Security filled');

      /* =========================
     FINANCIAL / PRICING SECTION
  ========================= */

      // OverAge Payment Factor
      const overAgePmtFactor = page.locator(
        'input[formcontrolname="factor"]'
      );
      await overAgePmtFactor.scrollIntoViewIfNeeded();
      await overAgePmtFactor.click();
      await overAgePmtFactor.fill('22');
      await expect(overAgePmtFactor).toHaveValue('22');
      console.log('✅ OverAge Pmt Factor filled');

      // OverAge DownPay Percentage
      const overAgeDownPayPercentage = page.locator(
        'input[formcontrolname="compensationPercentage"]'
      );
      await overAgeDownPayPercentage.click();
      await overAgeDownPayPercentage.fill('226');
      await expect(overAgeDownPayPercentage).toHaveValue('226');
      console.log('✅ OverAge DownPay Percentage filled');

      // Base RTO
      const baseRto = page.locator(
        'input[formcontrolname="baseRto"]'
      );
      await baseRto.click();
      await baseRto.fill('67');
      await expect(baseRto).toHaveValue('67');
      console.log('✅ Base RTO filled');

      // Base Rental
      const baseRental = page.locator(
        'input[formcontrolname="baseRental"]'
      );
      await baseRental.click();
      await baseRental.fill('06');
      await expect(baseRental).toHaveValue('06');
      console.log('✅ Base Rental filled');

      // Base Plate Only
      const basePlateOnly = page.locator(
        'input[formcontrolname="basePlateOnly"]'
      );
      await basePlateOnly.click();
      await basePlateOnly.fill('067');
      await expect(basePlateOnly).toHaveValue('067');
      console.log('✅ Base Plate Only filled');

      // OverAge Percentage (Sale)
      const overAgePercentageSale = page.locator(
        'input[formcontrolname="oveageSalePercentage"]'
      );
      await overAgePercentageSale.click();
      await overAgePercentageSale.fill('088');
      await expect(overAgePercentageSale).toHaveValue('088');
      console.log('✅ OverAge Percentage (Sale) filled');


      // Comp Level A
      const compLevelA = page.locator(
        'input[formcontrolname="compLevelA"]'
      );
      await compLevelA.click();
      await compLevelA.fill('0890');
      await expect(compLevelA).toHaveValue('0890');
      console.log('✅ Comp Level A filled');

      const compLevelB = page.locator(
        'input[formcontrolname="compLevelB"]'
      );
      await compLevelB.click();
      await compLevelB.fill('0552');
      await expect(compLevelB).toHaveValue('0552');
      console.log('✅ Comp Level B filled');

      // Comp Level C
      const compLevelC = page.locator(
        'input[formcontrolname="compLevelC"]'
      );
      await compLevelC.scrollIntoViewIfNeeded();
      await compLevelC.click();
      await compLevelC.fill('0664');
      await expect(compLevelC).toHaveValue('0664');
      console.log('✅ Comp Level C filled');
      // Comp Level A
      // const compLevelA = page.locato
      /* =========================
         EMAIL SIGNATURE SECTION
      ========================= */

      const emailSignatureInput = page.locator(
        'textarea[formcontrolname="emailSignature"]'
      );

      // Scroll into view
      await emailSignatureInput.scrollIntoViewIfNeeded();

      // Click to focus (important for Angular Material)
      await emailSignatureInput.click();

      // Clear existing value (if any) and fill
      await emailSignatureInput.fill('Olly');

      // Verify value
      await expect(emailSignatureInput).toHaveValue('Olly');

      console.log('✅ Email Signature filled');
      /* =========================
         ADD BUTTON
      ========================= */

      const addButton = page.getByRole('button', { name: /^\+ Add$/i });

      await addButton.scrollIntoViewIfNeeded();
      await expect(addButton).toBeVisible();
      await addButton.click();

      console.log('✅ Add button clicked');

      await page.waitForTimeout(2000);
      console.log(await page.content());





    }

  });
});


















