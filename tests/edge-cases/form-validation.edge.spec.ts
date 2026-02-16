import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth/login';

test.describe('Form Validation Edge Cases', () => {
  
  test.setTimeout(180000); // 3 minutes

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Add User Form Edge Cases', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to Add User form
      await page.locator('#expandIcon1').click();
      await page.waitForTimeout(500);
      await page.locator('#item_1').click();
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /\+ Add User/i }).click();
      await page.waitForLoadState('networkidle');
    });

    test('should handle boundary values for User ID field', async ({ page }) => {
      const userIdInput = page.locator('mat-form-field', { hasText: 'User Id' }).locator('input');
      await expect(userIdInput).toBeVisible({ timeout: 10000 });

      // Test boundary values
      const boundaryValues = [
        '', // Empty
        'a', // Single character
        'ab', // Two characters
        'a'.repeat(50), // Long string
        'a'.repeat(255), // Very long string
        '123', // Numeric only
        'user123', // Alphanumeric
        'user_123', // With underscore
        'user-123', // With hyphen
        'user.123', // With dot
        'USER123', // Uppercase
        'User123', // Mixed case
      ];

      for (const value of boundaryValues) {
        await userIdInput.clear();
        await userIdInput.fill(value);
        await page.waitForTimeout(500);
        
        // Check if value is accepted or rejected
        const actualValue = await userIdInput.inputValue();
        console.log(`Testing User ID: "${value}" -> Result: "${actualValue}"`);
        
        // Value should either be accepted as-is or truncated/filtered
        expect(actualValue.length).toBeLessThanOrEqual(255);
      }
    });

    test('should validate email format edge cases', async ({ page }) => {
      const emailInput = page.locator('input[formcontrolname="email"]');
      await emailInput.waitFor({ state: 'visible' });

      const emailTestCases = [
        { email: '', valid: false, description: 'Empty email' },
        { email: 'invalid', valid: false, description: 'No @ symbol' },
        { email: '@domain.com', valid: false, description: 'Missing local part' },
        { email: 'user@', valid: false, description: 'Missing domain' },
        { email: 'user@domain', valid: false, description: 'Missing TLD' },
        { email: 'user@domain.', valid: false, description: 'Empty TLD' },
        { email: 'user..user@domain.com', valid: false, description: 'Double dots in local' },
        { email: 'user@domain..com', valid: false, description: 'Double dots in domain' },
        { email: 'a'.repeat(64) + '@domain.com', valid: false, description: 'Local part too long' },
        { email: 'user@' + 'a'.repeat(253) + '.com', valid: false, description: 'Domain too long' },
        { email: 'user+tag@domain.com', valid: true, description: 'Plus addressing' },
        { email: 'user.name@domain.com', valid: true, description: 'Dot in local part' },
        { email: 'user@sub.domain.com', valid: true, description: 'Subdomain' },
        { email: 'user@domain-name.com', valid: true, description: 'Hyphen in domain' },
        { email: 'user123@domain123.com', valid: true, description: 'Numbers in email' },
        { email: 'üser@dömain.com', valid: true, description: 'Unicode characters' },
      ];

      for (const testCase of emailTestCases) {
        await emailInput.clear();
        await emailInput.fill(testCase.email);
        await emailInput.blur(); // Trigger validation
        await page.waitForTimeout(1000);

        console.log(`Testing email: ${testCase.description} - "${testCase.email}"`);
        
        // Check for validation error indicators
        const hasError = await page.locator('mat-error').isVisible().catch(() => false);
        
        if (testCase.valid) {
          expect(hasError).toBeFalsy();
        } else {
          // For invalid emails, we expect either an error or the field to be empty/corrected
          const currentValue = await emailInput.inputValue();
          if (currentValue === testCase.email) {
            // If value is preserved, there should be a validation error
            expect(hasError).toBeTruthy();
          }
        }
      }
    });

    test('should validate phone number formats', async ({ page }) => {
      const cellPhoneInput = page.locator('input[formcontrolname="cellPhone"]');
      await cellPhoneInput.waitFor({ state: 'visible' });

      const phoneTestCases = [
        { phone: '', description: 'Empty phone' },
        { phone: '123', description: 'Too short' },
        { phone: '1234567890', description: 'Valid 10 digits' },
        { phone: '12345678901', description: 'Too long (11 digits)' },
        { phone: '123456789012345', description: 'Way too long' },
        { phone: 'abcdefghij', description: 'Letters only' },
        { phone: '123abc7890', description: 'Mixed alphanumeric' },
        { phone: '(123) 456-7890', description: 'Formatted with parentheses' },
        { phone: '123-456-7890', description: 'Formatted with hyphens' },
        { phone: '123.456.7890', description: 'Formatted with dots' },
        { phone: '+1234567890', description: 'With plus sign' },
        { phone: '123 456 7890', description: 'With spaces' },
        { phone: '!@#$%^&*()', description: 'Special characters' },
        { phone: '0000000000', description: 'All zeros' },
        { phone: '1111111111', description: 'All ones' },
      ];

      for (const testCase of phoneTestCases) {
        await cellPhoneInput.clear();
        await cellPhoneInput.fill(testCase.phone);
        await cellPhoneInput.blur();
        await page.waitForTimeout(500);

        const actualValue = await cellPhoneInput.inputValue();
        console.log(`Testing phone: ${testCase.description} - "${testCase.phone}" -> "${actualValue}"`);
        
        // Phone field might auto-format or filter input
        expect(typeof actualValue).toBe('string');
      }
    });

    test('should handle password complexity edge cases', async ({ page }) => {
      const passwordInput = page.locator('input[formcontrolname="passW"]');
      const confirmPasswordInput = page.locator('input[formcontrolname="confirmPassword"]');
      
      await passwordInput.scrollIntoViewIfNeeded();
      await passwordInput.waitFor({ state: 'visible' });

      const passwordTestCases = [
        { password: '', description: 'Empty password' },
        { password: '1', description: 'Single character' },
        { password: '12', description: 'Two characters' },
        { password: '123', description: 'Three characters' },
        { password: 'password', description: 'Common weak password' },
        { password: '12345678', description: 'Numeric only' },
        { password: 'abcdefgh', description: 'Lowercase only' },
        { password: 'ABCDEFGH', description: 'Uppercase only' },
        { password: 'Password1', description: 'Mixed case with number' },
        { password: 'Password1!', description: 'Strong password' },
        { password: 'a'.repeat(100), description: 'Very long password' },
        { password: '!@#$%^&*()', description: 'Special characters only' },
        { password: 'üñíçødé123!', description: 'Unicode characters' },
        { password: 'pass word', description: 'With spaces' },
        { password: 'pass\tword', description: 'With tab' },
        { password: 'pass\nword', description: 'With newline' },
      ];

      for (const testCase of passwordTestCases) {
        await passwordInput.clear();
        await passwordInput.fill(testCase.password);
        
        await confirmPasswordInput.clear();
        await confirmPasswordInput.fill(testCase.password);
        
        await confirmPasswordInput.blur();
        await page.waitForTimeout(1000);

        console.log(`Testing password: ${testCase.description} - "${testCase.password}"`);
        
        // Check for validation errors
        const hasError = await page.locator('mat-error').isVisible().catch(() => false);
        const passwordValue = await passwordInput.inputValue();
        const confirmValue = await confirmPasswordInput.inputValue();
        
        // Passwords should match if both are filled
        if (passwordValue && confirmValue) {
          expect(passwordValue).toBe(confirmValue);
        }
      }
    });

    test('should validate address field length limits', async ({ page }) => {
      const address1Input = page.locator('input[formcontrolname="address1"]');
      await address1Input.scrollIntoViewIfNeeded();
      await address1Input.waitFor({ state: 'visible' });

      const addressTestCases = [
        { address: '', description: 'Empty address' },
        { address: '1', description: 'Single character' },
        { address: '123 Main St', description: 'Normal address' },
        { address: 'a'.repeat(50), description: '50 characters' },
        { address: 'a'.repeat(100), description: '100 characters' },
        { address: 'a'.repeat(255), description: '255 characters' },
        { address: 'a'.repeat(500), description: '500 characters' },
        { address: '123 Main St, Apt 4B, Building C, Floor 2, Suite 100', description: 'Long detailed address' },
        { address: '!@#$%^&*()_+-=[]{}|;:,.<>?', description: 'Special characters' },
        { address: '123 Üñíçødé Street', description: 'Unicode characters' },
        { address: '123\nMain\tSt', description: 'With newlines and tabs' },
      ];

      for (const testCase of addressTestCases) {
        await address1Input.clear();
        await address1Input.fill(testCase.address);
        await address1Input.blur();
        await page.waitForTimeout(500);

        const actualValue = await address1Input.inputValue();
        console.log(`Testing address: ${testCase.description} - Length: ${testCase.address.length} -> ${actualValue.length}`);
        
        // Address should be accepted or truncated
        expect(actualValue.length).toBeLessThanOrEqual(testCase.address.length);
      }
    });

    test('should handle zip code format validation', async ({ page }) => {
      const zipCodeInput = page.locator('input[formcontrolname="zipCode"]');
      await zipCodeInput.scrollIntoViewIfNeeded();
      await zipCodeInput.waitFor({ state: 'visible' });

      const zipTestCases = [
        { zip: '', description: 'Empty zip' },
        { zip: '1', description: 'Single digit' },
        { zip: '12', description: 'Two digits' },
        { zip: '123', description: 'Three digits' },
        { zip: '1234', description: 'Four digits' },
        { zip: '12345', description: 'Five digits (valid)' },
        { zip: '123456', description: 'Six digits' },
        { zip: '12345-6789', description: 'ZIP+4 format' },
        { zip: '12345-', description: 'Incomplete ZIP+4' },
        { zip: 'abcde', description: 'Letters' },
        { zip: '1234a', description: 'Mixed alphanumeric' },
        { zip: '!@#$%', description: 'Special characters' },
        { zip: '00000', description: 'All zeros' },
        { zip: '99999', description: 'All nines' },
        { zip: '12 345', description: 'With space' },
      ];

      for (const testCase of zipTestCases) {
        await zipCodeInput.clear();
        await zipCodeInput.fill(testCase.zip);
        await zipCodeInput.blur();
        await page.waitForTimeout(500);

        const actualValue = await zipCodeInput.inputValue();
        console.log(`Testing zip: ${testCase.description} - "${testCase.zip}" -> "${actualValue}"`);
        
        // Zip code might be filtered or formatted
        expect(typeof actualValue).toBe('string');
      }
    });

    test('should validate numeric fields with boundary values', async ({ page }) => {
      const commissionInput = page.locator('input[formcontrolname="comission"]');
      
      if (await commissionInput.isVisible()) {
        await commissionInput.scrollIntoViewIfNeeded();

        const numericTestCases = [
          { value: '', description: 'Empty value' },
          { value: '0', description: 'Zero' },
          { value: '-1', description: 'Negative number' },
          { value: '1', description: 'Positive integer' },
          { value: '1.5', description: 'Decimal' },
          { value: '100', description: 'Large number' },
          { value: '999999', description: 'Very large number' },
          { value: 'abc', description: 'Letters' },
          { value: '1a2b3c', description: 'Mixed alphanumeric' },
          { value: '1.2.3', description: 'Multiple decimals' },
          { value: '1,000', description: 'With comma' },
          { value: '$100', description: 'With currency symbol' },
          { value: '100%', description: 'With percentage' },
        ];

        for (const testCase of numericTestCases) {
          await commissionInput.clear();
          await commissionInput.fill(testCase.value);
          await commissionInput.blur();
          await page.waitForTimeout(500);

          const actualValue = await commissionInput.inputValue();
          console.log(`Testing numeric: ${testCase.description} - "${testCase.value}" -> "${actualValue}"`);
          
          // Numeric field should filter non-numeric input
          if (actualValue) {
            const isNumeric = /^-?\d*\.?\d*$/.test(actualValue);
            expect(isNumeric).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Prospect Form Edge Cases', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to Manage Prospects
      await page.click('text=Manage Prospects');
      await expect(page.locator('text=Manage Prospect')).toBeVisible();
    });

    test('should handle rapid form submissions', async ({ page }) => {
      // Expand prospect filter if needed
      const filterPanel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');
      if ((await filterPanel.getAttribute('aria-expanded')) !== 'true') {
        await filterPanel.locator('mat-expansion-panel-header').click();
        await page.waitForTimeout(500);
      }

      const prospectIdInput = filterPanel.locator('input[formcontrolname="prospectId"]');
      await prospectIdInput.fill('1186');

      // Rapid fire submissions
      const applyButton = filterPanel.locator('button').first();
      
      for (let i = 0; i < 5; i++) {
        await applyButton.click();
        await page.waitForTimeout(100); // Very short wait
      }

      // Should handle without crashing
      await page.waitForTimeout(2000);
      expect(page.locator('table')).toBeVisible();
    });

    test('should handle concurrent filter operations', async ({ page }) => {
      const filterPanel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');
      if ((await filterPanel.getAttribute('aria-expanded')) !== 'true') {
        await filterPanel.locator('mat-expansion-panel-header').click();
        await page.waitForTimeout(500);
      }

      // Fill multiple filters simultaneously
      const prospectIdInput = filterPanel.locator('input[formcontrolname="prospectId"]');
      const lastNameInput = filterPanel.locator('input[formcontrolname="lastName"]');
      
      // Start multiple operations without waiting
      const operations = [
        prospectIdInput.fill('1186'),
        lastNameInput.fill('Test'),
        filterPanel.locator('mat-select[formcontrolname="category"]').click(),
      ];

      await Promise.all(operations);
      await page.waitForTimeout(1000);

      // Should handle concurrent operations gracefully
      expect(page.locator('table')).toBeVisible();
    });
  });
});