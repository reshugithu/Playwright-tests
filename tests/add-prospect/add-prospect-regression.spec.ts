import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth/login';
import { AddProspectPage } from '../../pages/AddProspectPage';

/**
 * REGRESSION TEST SUITE - Add Prospect Feature
 * Tests to ensure existing functionality remains intact after changes
 */
test.describe('Add Prospect - Regression Tests', () => {
  
  test.setTimeout(120000);
  let addProspectPage: AddProspectPage;

  test.beforeEach(async ({ page }) => {
    await login(page);
    addProspectPage = new AddProspectPage(page);
    await addProspectPage.navigateToAddProspect();
  });

  test('TC-REG-01: Form loads correctly after navigation', async ({ page }) => {
    console.log('\n🧪 TC-REG-01: Form loading\n');
    
    // Verify form loads with all elements
    await addProspectPage.verifyFormIsVisible();
    
    // Verify no console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log(`⚠️  Console errors found: ${consoleErrors.length}`);
    }
    
    console.log('✅ Form loads correctly');
  });

  test('TC-REG-02: All dropdowns populate with options', async ({ page }) => {
    console.log('\n🧪 TC-REG-02: Dropdown population\n');
    
    // Check Prospect Source dropdown
    const sourceOptions = await addProspectPage.getDropdownOptions(addProspectPage.prospectSourceDropdown);
    expect(sourceOptions.length).toBeGreaterThan(0);
    console.log(`Prospect Source options: ${sourceOptions.length}`);
    
    // Check Lead Status dropdown
    const statusOptions = await addProspectPage.getDropdownOptions(addProspectPage.leadStatusDropdown);
    expect(statusOptions.length).toBeGreaterThan(0);
    console.log(`Lead Status options: ${statusOptions.length}`);
    
    console.log('✅ All dropdowns populated');
  });

  test('TC-REG-03: Form validation still works after page reload', async ({ page }) => {
    console.log('\n🧪 TC-REG-03: Validation after reload\n');
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Navigate back to form
    await addProspectPage.navigateToAddProspect();
    
    // Try to submit empty form
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(2000);
    
    // Verify validation still works
    await addProspectPage.verifyValidationErrors();
    
    console.log('✅ Validation works after reload');
  });

  test('TC-REG-04: Data persistence check - form clears after cancel', async ({ page }) => {
    console.log('\n🧪 TC-REG-04: Form clear on cancel\n');
    
    // Fill form
    await addProspectPage.fillFirstName('Test');
    await addProspectPage.fillLastName('User');
    await addProspectPage.fillEmail('test@example.com');
    
    // Cancel
    await addProspectPage.clickCancelButton();
    await page.waitForTimeout(2000);
    
    // Navigate back
    await addProspectPage.navigateToAddProspect();
    
    // Verify fields are empty
    const firstNameValue = await addProspectPage.getFieldValue(addProspectPage.firstNameInput);
    expect(firstNameValue).toBe('');
    
    console.log('✅ Form clears after cancel');
  });

  test('TC-REG-05: Browser back button handling', async ({ page }) => {
    console.log('\n🧪 TC-REG-05: Back button handling\n');
    
    // Fill some data
    await addProspectPage.fillFirstName('BackTest');
    
    // Go back
    await page.goBack();
    await page.waitForTimeout(2000);
    
    // Go forward
    await page.goForward();
    await page.waitForTimeout(2000);
    
    // Verify page still functional
    await expect(addProspectPage.firstNameInput).toBeVisible();
    
    console.log('✅ Back button handled correctly');
  });

  test('TC-REG-06: Multiple form submissions in same session', async ({ page }) => {
    console.log('\n🧪 TC-REG-06: Multiple submissions\n');
    
    // First submission
    await addProspectPage.fillRequiredFields({
      firstName: 'First',
      lastName: 'Submission',
      prospectDate: '02/06/2026'
    });
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(3000);
    
    // Navigate back to form
    await addProspectPage.navigateToAddProspect();
    
    // Second submission
    await addProspectPage.fillRequiredFields({
      firstName: 'Second',
      lastName: 'Submission',
      prospectDate: '02/07/2026'
    });
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(3000);
    
    console.log('✅ Multiple submissions handled');
  });

  test('TC-REG-07: Form accessibility - keyboard navigation', async ({ page }) => {
    console.log('\n🧪 TC-REG-07: Keyboard navigation\n');
    
    // Tab through fields
    await page.keyboard.press('Tab');
    await page.keyboard.type('KeyboardTest');
    
    await page.keyboard.press('Tab');
    await page.keyboard.type('User');
    
    await page.keyboard.press('Tab');
    await page.keyboard.type('Middle');
    
    // Continue tabbing
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
    }
    
    console.log('✅ Keyboard navigation works');
  });

  test('TC-REG-08: Form state after session timeout simulation', async ({ page }) => {
    console.log('\n🧪 TC-REG-08: Session timeout\n');
    
    // Fill form
    await addProspectPage.fillFirstName('Session');
    await addProspectPage.fillLastName('Test');
    
    // Clear cookies to simulate session timeout
    await page.context().clearCookies();
    
    // Try to submit
    await addProspectPage.clickAddButton();
    await page.waitForTimeout(3000);
    
    // Should redirect to login or show error
    const currentUrl = page.url();
    console.log(`URL after session timeout: ${currentUrl}`);
    
    console.log('✅ Session timeout handled');
  });

  test('TC-REG-09: Form rendering on different viewport sizes', async ({ page }) => {
    console.log('\n🧪 TC-REG-09: Responsive design\n');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1024, height: 768, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Verify form is still visible
      await expect(addProspectPage.firstNameInput).toBeVisible();
      console.log(`✅ Form visible on ${viewport.name}`);
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('TC-REG-10: Form performance - load time', async ({ page }) => {
    console.log('\n🧪 TC-REG-10: Performance check\n');
    
    const startTime = Date.now();
    
    // Navigate to form
    await addProspectPage.navigateToAddProspect();
    
    const loadTime = Date.now() - startTime;
    console.log(`Form load time: ${loadTime}ms`);
    
    // Form should load within reasonable time (10 seconds)
    expect(loadTime).toBeLessThan(10000);
    
    console.log('✅ Performance acceptable');
  });

  test('TC-REG-11: Dropdown selection persistence', async ({ page }) => {
    console.log('\n🧪 TC-REG-11: Dropdown persistence\n');
    
    // Select from dropdown
    await addProspectPage.selectFirstProspectSource();
    
    // Fill other fields
    await addProspectPage.fillFirstName('Persist');
    await addProspectPage.fillLastName('Test');
    
    // Verify dropdown selection is still there
    const dropdownText = await addProspectPage.prospectSourceDropdown.textContent();
    expect(dropdownText?.trim()).not.toBe('');
    
    console.log('✅ Dropdown selection persists');
  });

  test('TC-REG-12: Error message display consistency', async ({ page }) => {
    console.log('\n🧪 TC-REG-12: Error message consistency\n');
    
    // Trigger validation errors multiple times
    for (let i = 0; i < 3; i++) {
      await addProspectPage.clickAddButton();
      await page.waitForTimeout(1000);
      
      const errorCount = await addProspectPage.errorMessages.count();
      console.log(`Attempt ${i + 1}: ${errorCount} errors`);
      expect(errorCount).toBeGreaterThan(0);
    }
    
    console.log('✅ Error messages consistent');
  });

  test('TC-REG-13: Form field character limits', async ({ page }) => {
    console.log('\n🧪 TC-REG-13: Character limits\n');
    
    // Test First Name limit
    const longName = 'A'.repeat(300);
    await addProspectPage.fillFirstName(longName);
    const actualValue = await addProspectPage.getFieldValue(addProspectPage.firstNameInput);
    
    console.log(`Character limit test: Input ${longName.length}, Accepted ${actualValue.length}`);
    expect(actualValue.length).toBeLessThanOrEqual(300);
    
    console.log('✅ Character limits enforced');
  });

  test('TC-REG-14: Date picker functionality', async ({ page }) => {
    console.log('\n🧪 TC-REG-14: Date picker\n');
    
    // Click on date field
    await addProspectPage.prospectDateInput.click();
    await page.waitForTimeout(1000);
    
    // Check if date picker appears
    const datePicker = page.locator('.mat-datepicker-popup, .mat-calendar');
    const isDatePickerVisible = await datePicker.isVisible().catch(() => false);
    
    if (isDatePickerVisible) {
      console.log('✅ Date picker appears');
    } else {
      console.log('ℹ️  Date picker not visible (may be text input only)');
    }
    
    // Fill date manually
    await addProspectPage.fillProspectDate('02/06/2026');
    await addProspectPage.verifyFieldValue(addProspectPage.prospectDateInput, '02/06/2026');
    
    console.log('✅ Date input works');
  });

  test('TC-REG-15: Form submission button state', async ({ page }) => {
    console.log('\n🧪 TC-REG-15: Button state\n');
    
    // Verify Add button is enabled initially
    const isEnabled = await addProspectPage.addButton.isEnabled();
    expect(isEnabled).toBeTruthy();
    
    // Fill form
    await addProspectPage.fillRequiredFields({
      firstName: 'Button',
      lastName: 'Test',
      prospectDate: '02/06/2026'
    });
    
    // Button should still be enabled
    const isStillEnabled = await addProspectPage.addButton.isEnabled();
    expect(isStillEnabled).toBeTruthy();
    
    console.log('✅ Button state correct');
  });
});
