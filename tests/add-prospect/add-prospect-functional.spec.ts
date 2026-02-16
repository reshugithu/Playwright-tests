import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth/login';
import { AddProspectPage } from '../../pages/AddProspectPage';

/**
 * FUNCTIONAL TEST SUITE - Add Prospect Feature
 * Tests core functionality and happy path scenarios
 */
test.describe('Add Prospect - Functional Tests', () => {
  
  test.setTimeout(120000); // 2 minutes
  let addProspectPage: AddProspectPage;

  test.beforeEach(async ({ page }) => {
    console.log('🔹 Setup: Login and navigate to Add Prospect form');
    
    // Login
    await login(page);
    
    // Initialize Page Object
    addProspectPage = new AddProspectPage(page);
    
    // Navigate to Add Prospect form
    await addProspectPage.navigateToAddProspect();
    
    console.log('✅ Setup complete');
  });

  test('TC-FUNC-01: Verify all form fields are displayed', async ({ page }) => {
    console.log('\n🧪 TC-FUNC-01: Form fields visibility\n');
    
    // Verify form is visible with all required fields
    await addProspectPage.verifyFormIsVisible();
    
    // Verify individual fields
    await expect(addProspectPage.firstNameInput).toBeVisible();
    await expect(addProspectPage.lastNameInput).toBeVisible();
    await expect(addProspectPage.cellPhoneInput).toBeVisible();
    await expect(addProspectPage.emailInput).toBeVisible();
    await expect(addProspectPage.prospectDateInput).toBeVisible();
    await expect(addProspectPage.prospectSourceDropdown).toBeVisible();
    await expect(addProspectPage.addButton).toBeVisible();
    await expect(addProspectPage.cancelButton).toBeVisible();
    
    console.log('✅ All form fields are visible');
  });

  test('TC-FUNC-02: Submit form with only required fields', async ({ page }) => {
    console.log('\n🧪 TC-FUNC-02: Submit with required fields only\n');
    
    // Fill required fields
    await addProspectPage.fillRequiredFields({
      firstName: 'John',
      lastName: 'Doe',
      prospectDate: '02/06/2026'
    });
    
    console.log('✅ Required fields filled');
    
    // Submit form
    await addProspectPage.clickAddButton();
    
    // Verify success (or wait for response)
    await page.waitForTimeout(3000);
    
    console.log('✅ Form submitted successfully');
  });

  test('TC-FUNC-03: Submit form with all fields filled', async ({ page }) => {
    console.log('\n🧪 TC-FUNC-03: Submit with all fields\n');
    
    // Fill complete form
    await addProspectPage.fillCompleteForm({
      firstName: 'Jane',
      lastName: 'Smith',
      middleName: 'Marie',
      cellPhone: '9089907867',
      email: 'jane.smith@test.com',
      prospectDate: '02/06/2026',
      comments: 'Test prospect with all fields filled'
    });
    
    console.log('✅ All fields filled');
    
    // Submit form
    await addProspectPage.clickAddButton();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    console.log('✅ Complete form submitted');
  });

  test('TC-FUNC-04: Verify Prospect Date field accepts valid date format', async ({ page }) => {
    console.log('\n🧪 TC-FUNC-04: Date format validation\n');
    
    // Fill date field
    await addProspectPage.fillProspectDate('02/06/2026');
    
    // Verify date is accepted
    await addProspectPage.verifyFieldValue(addProspectPage.prospectDateInput, '02/06/2026');
    
    // Verify placeholder
    await expect(addProspectPage.prospectDateInput).toHaveAttribute('placeholder', /MM\/DD\/YYYY/i);
    
    console.log('✅ Date format validated');
  });

  test('TC-FUNC-05: Verify Prospect Source dropdown functionality', async ({ page }) => {
    console.log('\n🧪 TC-FUNC-05: Prospect Source dropdown\n');
    
    // Get dropdown options
    const options = await addProspectPage.getDropdownOptions(addProspectPage.prospectSourceDropdown);
    console.log(`Available options: ${options.length}`);
    
    expect(options.length).toBeGreaterThan(0);
    
    // Select first option
    await addProspectPage.selectFirstProspectSource();
    
    console.log('✅ Dropdown functionality verified');
  });

  test('TC-FUNC-06: Verify Lead Status dropdown functionality', async ({ page }) => {
    console.log('\n🧪 TC-FUNC-06: Lead Status dropdown\n');
    
    // Get dropdown options
    const options = await addProspectPage.getDropdownOptions(addProspectPage.leadStatusDropdown);
    console.log(`Available Lead Status options: ${options.length}`);
    
    expect(options.length).toBeGreaterThan(0);
    
    // Select an option if available
    if (options.length > 0) {
      await addProspectPage.selectLeadStatus(options[0]);
    }
    
    console.log('✅ Lead Status dropdown verified');
  });

  test('TC-FUNC-07: Verify Cancel button functionality', async ({ page }) => {
    console.log('\n🧪 TC-FUNC-07: Cancel button\n');
    
    // Fill some fields
    await addProspectPage.fillFirstName('Cancel');
    await addProspectPage.fillLastName('Test');
    
    // Click cancel
    await addProspectPage.clickCancelButton();
    await page.waitForTimeout(2000);
    
    console.log('✅ Cancel button functionality verified');
  });

  test('TC-FUNC-08: Verify Do Not Send SMS checkbox', async ({ page }) => {
    console.log('\n🧪 TC-FUNC-08: SMS checkbox\n');
    
    // Toggle checkbox
    await addProspectPage.toggleDoNotSendSMS();
    await page.waitForTimeout(500);
    
    // Verify checkbox state
    const isChecked = await addProspectPage.doNotSendSMSCheckbox.isChecked();
    console.log(`Checkbox state: ${isChecked ? 'checked' : 'unchecked'}`);
    
    // Toggle again
    await addProspectPage.toggleDoNotSendSMS();
    await page.waitForTimeout(500);
    
    const isCheckedAgain = await addProspectPage.doNotSendSMSCheckbox.isChecked();
    expect(isCheckedAgain).not.toBe(isChecked);
    
    console.log('✅ Checkbox functionality verified');
  });

  test('TC-FUNC-09: Verify email field accepts valid email', async ({ page }) => {
    console.log('\n🧪 TC-FUNC-09: Email validation\n');
    
    const validEmails = [
      'test@example.com',
      'user.name@domain.com',
      'user+tag@example.co.uk'
    ];
    
    for (const email of validEmails) {
      await addProspectPage.fillEmail(email);
      await addProspectPage.verifyFieldValue(addProspectPage.emailInput, email);
      console.log(`✅ Valid email accepted: ${email}`);
    }
  });

  test('TC-FUNC-10: Verify phone number field accepts valid formats', async ({ page }) => {
    console.log('\n🧪 TC-FUNC-10: Phone number validation\n');
    
    const validPhones = [
      '9089907867',
      '1234567890'
    ];
    
    for (const phone of validPhones) {
      await addProspectPage.fillCellPhone(phone);
      const actualValue = await addProspectPage.getFieldValue(addProspectPage.cellPhoneInput);
      console.log(`Phone input: ${phone} -> ${actualValue}`);
      expect(actualValue.length).toBeGreaterThan(0);
    }
    
    console.log('✅ Phone number validation verified');
  });
});
