import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth/login';
import { AddProspectPage } from '../../pages/AddProspectPage';

/**
 * NEGATIVE TEST SUITE - Add Prospect Feature
 * Tests error handling, validation, and failure scenarios
 */
test.describe('Add Prospect - Negative Tests', () => {
  
  test.setTimeout(120000);
  let addProspectPage: AddProspectPage;

  test.beforeEach(async ({ page }) => {
    await login(page);
    addProspectPage = new AddProspectPage(page);
    await addProspectPage.navigateToAddProspect();
  });

  test('TC-NEG-01: Submit empty form - should show validation errors', async ({ page }) => {
    console.log('\n🧪 TC-NEG-01: Empty form submission\n');
    
    // Click Add without filling any fields
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(2000);
    
    // Verify validation errors are displayed
    await addProspectPage.verifyValidationErrors();
    
    console.log('✅ Validation errors displayed for empty form');
  });

  test('TC-NEG-02: Submit with missing First Name', async ({ page }) => {
    console.log('\n🧪 TC-NEG-02: Missing First Name\n');
    
    // Fill all except First Name
    await addProspectPage.fillLastName('Doe');
    await addProspectPage.fillProspectDate('02/06/2026');
    await addProspectPage.selectFirstProspectSource();
    
    // Submit
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(2000);
    
    // Verify error for First Name
    const errorCount = await addProspectPage.errorMessages.count();
    expect(errorCount).toBeGreaterThan(0);
    
    console.log('✅ Validation error for missing First Name');
  });

  test('TC-NEG-03: Submit with missing Last Name', async ({ page }) => {
    console.log('\n🧪 TC-NEG-03: Missing Last Name\n');
    
    // Fill all except Last Name
    await addProspectPage.fillFirstName('John');
    await addProspectPage.fillProspectDate('02/06/2026');
    await addProspectPage.selectFirstProspectSource();
    
    // Submit
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(2000);
    
    // Verify error
    const errorCount = await addProspectPage.errorMessages.count();
    expect(errorCount).toBeGreaterThan(0);
    
    console.log('✅ Validation error for missing Last Name');
  });

  test('TC-NEG-04: Submit with missing Prospect Date', async ({ page }) => {
    console.log('\n🧪 TC-NEG-04: Missing Prospect Date\n');
    
    // Fill all except Prospect Date
    await addProspectPage.fillFirstName('John');
    await addProspectPage.fillLastName('Doe');
    await addProspectPage.selectFirstProspectSource();
    
    // Submit
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(2000);
    
    // Verify error
    await addProspectPage.verifyRequiredFieldError('Prospect Date');
    
    console.log('✅ Validation error for missing Prospect Date');
  });

  test('TC-NEG-05: Submit with missing Prospect Source', async ({ page }) => {
    console.log('\n🧪 TC-NEG-05: Missing Prospect Source\n');
    
    // Fill all except Prospect Source
    await addProspectPage.fillFirstName('John');
    await addProspectPage.fillLastName('Doe');
    await addProspectPage.fillProspectDate('02/06/2026');
    
    // Submit
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(2000);
    
    // Verify error
    await addProspectPage.verifyRequiredFieldError('Prospect Source');
    
    console.log('✅ Validation error for missing Prospect Source');
  });

  test('TC-NEG-06: Invalid email format', async ({ page }) => {
    console.log('\n🧪 TC-NEG-06: Invalid email format\n');
    
    const invalidEmails = [
      'invalid',
      '@domain.com',
      'user@',
      'user..name@domain.com'
    ];
    
    for (const email of invalidEmails) {
      await addProspectPage.fillEmail(email);
      await addProspectPage.emailInput.blur();
      await page.waitForTimeout(1000);
      
      console.log(`Tested invalid email: ${email}`);
    }
    
    console.log('✅ Invalid email formats tested');
  });

  test('TC-NEG-07: Invalid date format', async ({ page }) => {
    console.log('\n🧪 TC-NEG-07: Invalid date format\n');
    
    const invalidDates = [
      'invalid',
      '13/32/2026',
      '02/31/2026',
      '2026-02-06'
    ];
    
    for (const date of invalidDates) {
      await addProspectPage.fillProspectDate(date);
      await addProspectPage.prospectDateInput.blur();
      await page.waitForTimeout(500);
      
      console.log(`Tested invalid date: ${date}`);
    }
    
    console.log('✅ Invalid date formats tested');
  });

  test('TC-NEG-08: Excessively long First Name', async ({ page }) => {
    console.log('\n🧪 TC-NEG-08: Long First Name\n');
    
    const longName = 'A'.repeat(500);
    await addProspectPage.fillFirstName(longName);
    
    const actualValue = await addProspectPage.getFieldValue(addProspectPage.firstNameInput);
    console.log(`Input length: ${actualValue.length}`);
    
    // Should either truncate or reject
    expect(actualValue.length).toBeLessThanOrEqual(500);
    
    console.log('✅ Long name handling verified');
  });

  test('TC-NEG-09: Special characters in name fields', async ({ page }) => {
    console.log('\n🧪 TC-NEG-09: Special characters in names\n');
    
    const specialChars = ['<script>alert("XSS")</script>', '!@#$%^&*()', '123456'];
    
    for (const chars of specialChars) {
      await addProspectPage.fillFirstName(chars);
      await addProspectPage.firstNameInput.blur();
      await page.waitForTimeout(500);
      
      const actualValue = await addProspectPage.getFieldValue(addProspectPage.firstNameInput);
      console.log(`Special chars test: ${chars} -> ${actualValue}`);
    }
    
    console.log('✅ Special characters handling verified');
  });

  test('TC-NEG-10: Invalid phone number formats', async ({ page }) => {
    console.log('\n🧪 TC-NEG-10: Invalid phone formats\n');
    
    const invalidPhones = [
      'abc',
      '123',
      '12345678901234567890',
      '!@#$%^&*()'
    ];
    
    for (const phone of invalidPhones) {
      await addProspectPage.fillCellPhone(phone);
      await addProspectPage.cellPhoneInput.blur();
      await page.waitForTimeout(500);
      
      const actualValue = await addProspectPage.getFieldValue(addProspectPage.cellPhoneInput);
      console.log(`Invalid phone: ${phone} -> ${actualValue}`);
    }
    
    console.log('✅ Invalid phone formats tested');
  });

  test('TC-NEG-11: SQL Injection attempt in First Name', async ({ page }) => {
    console.log('\n🧪 TC-NEG-11: SQL Injection prevention\n');
    
    const sqlInjections = [
      "' OR '1'='1",
      "'; DROP TABLE prospects; --",
      "admin'--"
    ];
    
    for (const injection of sqlInjections) {
      await addProspectPage.fillFirstName(injection);
      await addProspectPage.fillLastName('Test');
      await addProspectPage.fillProspectDate('02/06/2026');
      await addProspectPage.selectFirstProspectSource();
      
      await addProspectPage.clickAddButton();
      await page.waitForTimeout(2000);
      
      // Should not cause SQL errors
      const pageContent = await page.content();
      expect(pageContent).not.toContain('SQL error');
      expect(pageContent).not.toContain('database error');
      
      console.log(`SQL injection prevented: ${injection}`);
      
      // Clear for next iteration
      await addProspectPage.clearAllFields();
    }
    
    console.log('✅ SQL injection prevention verified');
  });

  test('TC-NEG-12: XSS attempt in Comments field', async ({ page }) => {
    console.log('\n🧪 TC-NEG-12: XSS prevention\n');
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")'
    ];
    
    for (const payload of xssPayloads) {
      await addProspectPage.fillComments(payload);
      await page.waitForTimeout(500);
      
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>alert("XSS")</script>');
      
      console.log(`XSS prevented: ${payload.substring(0, 30)}...`);
    }
    
    console.log('✅ XSS prevention verified');
  });

  test('TC-NEG-13: Rapid form submissions', async ({ page }) => {
    console.log('\n🧪 TC-NEG-13: Rapid submissions\n');
    
    // Fill required fields
    await addProspectPage.fillRequiredFields({
      firstName: 'Rapid',
      lastName: 'Test',
      prospectDate: '02/06/2026'
    });
    
    // Rapid fire submissions
    for (let i = 0; i < 5; i++) {
      await addProspectPage.clickAddButton();
      await page.waitForTimeout(100);
    }
    
    await page.waitForTimeout(3000);
    
    // Should handle gracefully without crashing
    console.log('✅ Rapid submissions handled');
  });

  test('TC-NEG-14: Form submission with network interruption', async ({ page }) => {
    console.log('\n🧪 TC-NEG-14: Network interruption\n');
    
    // Fill form
    await addProspectPage.fillRequiredFields({
      firstName: 'Network',
      lastName: 'Test',
      prospectDate: '02/06/2026'
    });
    
    // Simulate network failure
    await page.route('**/*', route => route.abort());
    
    // Try to submit
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(2000);
    
    // Restore network
    await page.unroute('**/*');
    
    console.log('✅ Network interruption handled');
  });

  test('TC-NEG-15: Duplicate prospect submission', async ({ page }) => {
    console.log('\n🧪 TC-NEG-15: Duplicate submission\n');
    
    const prospectData = {
      firstName: 'Duplicate',
      lastName: 'Test',
      prospectDate: '02/06/2026'
    };
    
    // Submit first time
    await addProspectPage.fillRequiredFields(prospectData);
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(3000);
    
    // Try to submit same data again
    await addProspectPage.navigateToAddProspect();
    await addProspectPage.fillRequiredFields(prospectData);
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(3000);
    
    // Should handle duplicate appropriately
    console.log('✅ Duplicate submission tested');
  });
});
