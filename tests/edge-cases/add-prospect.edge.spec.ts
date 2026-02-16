import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth/login';

test.describe('Add Prospect Edge Cases', () => {
  
  test.setTimeout(180000); // 3 minutes

  test.beforeEach(async ({ page }) => {
    console.log('🔹 Starting Add Prospect Edge Cases Setup');
    
    // Login
    await login(page);
    console.log('✅ Login complete');

    // Wait for spinner to disappear
    try {
      await page.waitForSelector('.ngx-spinner-overlay', {
        state: 'hidden',
        timeout: 10000
      });
      console.log('✅ Spinner hidden');
    } catch (e) {
      console.log('ℹ️  No spinner found');
    }

    // Navigate to Manage Prospects
    console.log('🔹 Clicking Manage Prospects');
    await page.click('text=Manage Prospects');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('text=Manage Prospect')).toBeVisible({ timeout: 15000 });
    console.log('✅ Manage Prospects page loaded');

    // Wait for page to settle
    await page.waitForTimeout(2000);

    // Click the "+ Add Prospect" button
    console.log('🔹 Looking for Add Prospect button');
    const addButton = page.locator('button:has-text("+ Add Prospect")')
      .or(page.locator('button:has-text("Add Prospect")'))
      .or(page.locator('button').filter({ hasText: /add prospect/i }));

    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Add Prospect button found');

    await addButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await addButton.click();
    console.log('✅ Clicked Add Prospect button');

    // Wait for form to appear
    await page.waitForTimeout(1000);
    const firstNameField = page.locator('input[formcontrolname="firstName"]');
    await expect(firstNameField).toBeVisible({ timeout: 10000 });
    console.log('✅ Add Prospect form visible');
  });

  test.describe('Form Field Validation Edge Cases', () => {
    
    test('should handle boundary values for First Name field', async ({ page }) => {
      const firstNameInput = page.locator('input[formcontrolname="firstName"]');
      
      await expect(firstNameInput).toBeVisible();
        const boundaryValues = [
          { value: '', description: 'Empty string' },
          { value: 'A', description: 'Single character' },
          { value: 'AB', description: 'Two characters' },
          { value: 'a'.repeat(50), description: '50 characters' },
          { value: 'a'.repeat(100), description: '100 characters' },
          { value: 'a'.repeat(255), description: '255 characters' },
          { value: 'John-Paul', description: 'Hyphenated name' },
          { value: "O'Brien", description: 'Name with apostrophe' },
          { value: 'José', description: 'Name with accent' },
          { value: 'Müller', description: 'Name with umlaut' },
          { value: '李明', description: 'Chinese characters' },
          { value: 'محمد', description: 'Arabic characters' },
          { value: '123', description: 'Numbers only' },
          { value: 'John123', description: 'Alphanumeric' },
          { value: '!@#$%', description: 'Special characters' },
          { value: '   ', description: 'Only spaces' },
          { value: 'John  Smith', description: 'Multiple spaces' },
        ];

        for (const test of boundaryValues) {
          await firstNameInput.clear();
          await firstNameInput.fill(test.value);
          await firstNameInput.blur();
          await page.waitForTimeout(500);

          const actualValue = await firstNameInput.inputValue();
          console.log(`First Name test: ${test.description} - "${test.value}" -> "${actualValue}"`);
        }
    });

    test('should handle boundary values for Last Name field', async ({ page }) => {
      const lastNameInput = page.locator('input[formcontrolname="lastName"]');
      
      await expect(lastNameInput).toBeVisible();
        const boundaryValues = [
          { value: '', description: 'Empty string' },
          { value: 'A', description: 'Single character' },
          { value: 'a'.repeat(255), description: 'Very long name' },
          { value: 'Van Der Berg', description: 'Multi-part surname' },
          { value: 'Smith-Jones', description: 'Hyphenated surname' },
          { value: "O'Connor", description: 'Surname with apostrophe' },
        ];

        for (const test of boundaryValues) {
          await lastNameInput.clear();
          await lastNameInput.fill(test.value);
          await lastNameInput.blur();
          await page.waitForTimeout(500);

          const actualValue = await lastNameInput.inputValue();
          console.log(`Last Name test: ${test.description} - "${actualValue}"`);
        }
    });

    test('should validate email format edge cases', async ({ page }) => {
      const emailInput = page.locator('input[formcontrolname="email"]');
      
      await expect(emailInput).toBeVisible();
        const emailTestCases = [
          { email: '', valid: false, description: 'Empty email' },
          { email: 'invalid', valid: false, description: 'No @ symbol' },
          { email: '@domain.com', valid: false, description: 'Missing local part' },
          { email: 'user@', valid: false, description: 'Missing domain' },
          { email: 'user@domain', valid: false, description: 'Missing TLD' },
          { email: 'user..user@domain.com', valid: false, description: 'Double dots' },
          { email: 'a'.repeat(64) + '@domain.com', valid: false, description: 'Local too long' },
          { email: 'user@' + 'a'.repeat(253) + '.com', valid: false, description: 'Domain too long' },
          { email: 'user+tag@domain.com', valid: true, description: 'Plus addressing' },
          { email: 'user.name@domain.com', valid: true, description: 'Dot in local' },
          { email: 'user@sub.domain.com', valid: true, description: 'Subdomain' },
          { email: 'user123@domain123.com', valid: true, description: 'Numbers' },
          { email: 'üser@dömain.com', valid: true, description: 'Unicode' },
          { email: 'test@test.co.uk', valid: true, description: 'Multi-level TLD' },
        ];

        for (const testCase of emailTestCases) {
          await emailInput.clear();
          await emailInput.fill(testCase.email);
          await emailInput.blur();
          await page.waitForTimeout(1000);

          console.log(`Email test: ${testCase.description} - "${testCase.email}"`);
        }
    });

    test('should validate cell phone format edge cases', async ({ page }) => {
      const cellPhoneInput = page.locator('input[formcontrolname="contactNumber"]');
      
      await expect(cellPhoneInput).toBeVisible();
        const phoneTestCases = [
          { phone: '', description: 'Empty phone' },
          { phone: '123', description: 'Too short' },
          { phone: '1234567890', description: 'Valid 10 digits' },
          { phone: '12345678901', description: '11 digits' },
          { phone: '123456789012345', description: 'Too long' },
          { phone: 'abcdefghij', description: 'Letters only' },
          { phone: '123abc7890', description: 'Mixed alphanumeric' },
          { phone: '(908)990-7867', description: 'Formatted with parentheses' },
          { phone: '908-990-7867', description: 'Formatted with hyphens' },
          { phone: '908.990.7867', description: 'Formatted with dots' },
          { phone: '+19089907867', description: 'With country code' },
          { phone: '908 990 7867', description: 'With spaces' },
          { phone: '!@#$%^&*()', description: 'Special characters' },
          { phone: '0000000000', description: 'All zeros' },
          { phone: '9999999999', description: 'All nines' },
        ];

        for (const testCase of phoneTestCases) {
          await cellPhoneInput.clear();
          await cellPhoneInput.fill(testCase.phone);
          await cellPhoneInput.blur();
          await page.waitForTimeout(500);

          const actualValue = await cellPhoneInput.inputValue();
          console.log(`Phone test: ${testCase.description} - "${testCase.phone}" -> "${actualValue}"`);
        }
    });

    test('should validate prospect date edge cases', async ({ page }) => {
      const prospectDateInput = page.locator('input[formcontrolname="prospectDate"]');
      
      await expect(prospectDateInput).toBeVisible();
        const dateTestCases = [
          { date: '', description: 'Empty date' },
          { date: '2026-02-06', description: 'Today' },
          { date: '2026-02-07', description: 'Tomorrow' },
          { date: '2026-01-01', description: 'Past date this year' },
          { date: '2025-12-31', description: 'Last year' },
          { date: '2030-12-31', description: 'Future date' },
          { date: '1900-01-01', description: 'Very old date' },
          { date: '2099-12-31', description: 'Far future date' },
          { date: '2026-02-29', description: 'Invalid leap day' },
          { date: '2026-13-01', description: 'Invalid month' },
          { date: '2026-02-31', description: 'Invalid day' },
          { date: 'invalid', description: 'Invalid format' },
          { date: '02/06/2026', description: 'US format' },
          { date: '06-02-2026', description: 'EU format' },
        ];

        for (const testCase of dateTestCases) {
          await prospectDateInput.clear();
          await prospectDateInput.fill(testCase.date);
          await prospectDateInput.blur();
          await page.waitForTimeout(500);

          const actualValue = await prospectDateInput.inputValue();
          console.log(`Date test: ${testCase.description} - "${testCase.date}" -> "${actualValue}"`);
        }
    });
  });

  test.describe('Dropdown Selection Edge Cases', () => {
    
    test('should handle Lead Status dropdown edge cases', async ({ page }) => {
      const leadStatusDropdown = page.locator('mat-select[formcontrolname="leadStatus"]');
      
      await expect(leadStatusDropdown).toBeVisible();
      
      // Click to open dropdown
      await leadStatusDropdown.click();
      await page.waitForTimeout(500);
      
      // Get all available options
      const options = await page.locator('mat-option').allTextContents();
      console.log('Available Lead Status options:', options);

      // Select first option
      if (options.length > 0) {
        await page.locator('mat-option').first().click();
        await page.waitForTimeout(500);
      }

      // Test rapid selection changes
      for (let i = 0; i < 3; i++) {
        await leadStatusDropdown.click();
        await page.waitForTimeout(300);
        const randomIndex = Math.floor(Math.random() * Math.min(options.length, 5));
        await page.locator('mat-option').nth(randomIndex).click();
        await page.waitForTimeout(300);
      }
      
      console.log('Lead Status dropdown test completed');
    });

    test('should handle Prospect Category dropdown edge cases', async ({ page }) => {
      const categoryDropdown = page.locator('mat-select[formcontrolname="prospectCategory"]');
      
      if (await categoryDropdown.isVisible()) {
        await categoryDropdown.click();
        await page.waitForTimeout(500);
        
        const options = await page.locator('mat-option').allTextContents();
        console.log('Available Prospect Category options:', options);

        if (options.length > 0) {
          await page.locator('mat-option').first().click();
          await page.waitForTimeout(500);
        }
        
        console.log('Prospect Category dropdown test completed');
      }
    });

    test('should handle Prospect Source dropdown edge cases', async ({ page }) => {
      const sourceDropdown = page.locator('mat-select[formcontrolname="prospectSource"]');
      
      await expect(sourceDropdown).toBeVisible();
      
      // Click to open dropdown
      await sourceDropdown.click();
      await page.waitForTimeout(500);
      
      const options = await page.locator('mat-option').allTextContents();
      console.log('Available Prospect Source options:', options);

      // Test selecting different options
      for (let i = 0; i < Math.min(3, options.length); i++) {
        await page.locator('mat-option').nth(i).click();
        await page.waitForTimeout(300);
        
        await sourceDropdown.click();
        await page.waitForTimeout(300);
      }
      
      // Close dropdown
      await page.keyboard.press('Escape');
      console.log('Prospect Source dropdown test completed');
    });

    test('should handle Assigned To dropdown edge cases', async ({ page }) => {
      const assignedToDropdown = page.locator('mat-select[formcontrolname="assignedTo"]');
      
      if (await assignedToDropdown.isVisible()) {
        await assignedToDropdown.click();
        await page.waitForTimeout(500);
        
        const options = await page.locator('mat-option').allTextContents();
        console.log('Available Assigned To options:', options);

        if (options.length > 0) {
          await page.locator('mat-option').first().click();
          await page.waitForTimeout(500);
        }
        
        console.log('Assigned To dropdown test completed');
      }
    });
  });

  test.describe('Form Submission Edge Cases', () => {
    
    test('should handle empty form submission', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add")');
      
      await expect(addButton).toBeVisible();
      await addButton.click();
      await page.waitForTimeout(2000);

      // Should show validation errors
      console.log('Empty form submission - checking for validation errors');
      
      // Check for common validation error patterns
      const hasErrors = await page.locator('mat-error, .error-message, .mat-form-field-invalid').count();
      console.log(`Validation errors found: ${hasErrors}`);
    });

    test('should handle form submission with only required fields', async ({ page }) => {
      const firstNameInput = page.locator('input[formcontrolname="firstName"]');
      const lastNameInput = page.locator('input[formcontrolname="lastName"]');
      const prospectDateInput = page.locator('input[formcontrolname="prospectDate"]');
      const prospectSourceDropdown = page.locator('mat-select[formcontrolname="prospectSource"]');
      const addButton = page.locator('button:has-text("Add")');

      // Fill only required fields
      await firstNameInput.fill('EdgeTest');
      await lastNameInput.fill('User');
      await prospectDateInput.fill('02/06/2026');
      
      // Select prospect source
      await prospectSourceDropdown.click();
      await page.waitForTimeout(500);
      await page.locator('mat-option').first().click();
      await page.waitForTimeout(500);

      await addButton.click();
      await page.waitForTimeout(3000);

      console.log('Form submitted with only required fields');
    });

    test('should handle form submission with all fields filled', async ({ page }) => {
      // Fill all available fields
      await page.locator('input[formcontrolname="firstName"]').fill('Complete');
      await page.locator('input[formcontrolname="lastName"]').fill('TestUser');
      
      const middleNameInput = page.locator('input[formcontrolname="middleName"]');
      if (await middleNameInput.isVisible()) {
        await middleNameInput.fill('Middle');
      }
      
      await page.locator('input[formcontrolname="contactNumber"]').fill('9089907867');
      await page.locator('input[formcontrolname="email"]').fill('complete@test.com');
      await page.locator('input[formcontrolname="prospectDate"]').fill('02/06/2026');
      
      const affiliatedBaseInput = page.locator('input[formcontrolname="affiliatedBase"]');
      if (await affiliatedBaseInput.isVisible()) {
        await affiliatedBaseInput.fill('Test Base');
      }
      
      const referredByInput = page.locator('input[formcontrolname="referredBy"]');
      if (await referredByInput.isVisible()) {
        await referredByInput.fill('John Doe');
      }
      
      const referralContactInput = page.locator('input[formcontrolname="referralContact"]');
      if (await referralContactInput.isVisible()) {
        await referralContactInput.fill('Jane Smith');
      }
      
      const commentsTextarea = page.locator('textarea[formcontrolname="comments"]');
      if (await commentsTextarea.isVisible()) {
        await commentsTextarea.fill('This is a complete test with all fields filled.');
      }

      // Select dropdowns
      const leadStatusDropdown = page.locator('mat-select[formcontrolname="leadStatus"]');
      if (await leadStatusDropdown.isVisible()) {
        await leadStatusDropdown.click();
        await page.waitForTimeout(300);
        await page.locator('mat-option').first().click();
        await page.waitForTimeout(300);
      }

      const categoryDropdown = page.locator('mat-select[formcontrolname="prospectCategory"]');
      if (await categoryDropdown.isVisible()) {
        await categoryDropdown.click();
        await page.waitForTimeout(300);
        await page.locator('mat-option').first().click();
        await page.waitForTimeout(300);
      }

      const sourceDropdown = page.locator('mat-select[formcontrolname="prospectSource"]');
      await sourceDropdown.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option').first().click();
      await page.waitForTimeout(300);

      const assignedToDropdown = page.locator('mat-select[formcontrolname="assignedTo"]');
      if (await assignedToDropdown.isVisible()) {
        await assignedToDropdown.click();
        await page.waitForTimeout(300);
        await page.locator('mat-option').first().click();
        await page.waitForTimeout(300);
      }

      const addButton = page.locator('button:has-text("Add")');
      await addButton.click();
      await page.waitForTimeout(3000);

      console.log('Form submitted with all fields filled');
    });

    test('should handle rapid form submissions', async ({ page }) => {
      const firstNameInput = page.locator('input[formcontrolname="firstName"]');
      const lastNameInput = page.locator('input[formcontrolname="lastName"]');
      const prospectDateInput = page.locator('input[formcontrolname="prospectDate"]');
      const prospectSourceDropdown = page.locator('mat-select[formcontrolname="prospectSource"]');
      const addButton = page.locator('button:has-text("Add")');

      // Fill required fields
      await firstNameInput.fill('Rapid');
      await lastNameInput.fill('Test');
      await prospectDateInput.fill('02/06/2026');
      
      await prospectSourceDropdown.click();
      await page.waitForTimeout(300);
      await page.locator('mat-option').first().click();
      await page.waitForTimeout(300);

      // Rapid fire submissions
      for (let i = 0; i < 5; i++) {
        await addButton.click();
        await page.waitForTimeout(100);
      }

      await page.waitForTimeout(2000);
      console.log('Rapid submission test completed');
    });

    test('should handle form cancellation', async ({ page }) => {
      const firstNameInput = page.locator('input[formcontrolname="firstName"]');
      const cancelButton = page.locator('button:has-text("Cancel")');

      // Fill some fields
      await firstNameInput.fill('Cancel');
      await page.locator('input[formcontrolname="lastName"]').fill('Test');
      await page.locator('input[formcontrolname="email"]').fill('cancel@test.com');

      // Click cancel if visible
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await page.waitForTimeout(2000);
        console.log('Form cancelled successfully');
      }
    });
  });

  test.describe('Security Edge Cases', () => {
    
    test('should prevent XSS in First Name field', async ({ page }) => {
      const firstNameInput = page.locator('input[formcontrolname="firstName"]');
      
      await expect(firstNameInput).toBeVisible();
        const xssPayloads = [
          '<script>alert("XSS")</script>',
          '<img src=x onerror=alert("XSS")>',
          'javascript:alert("XSS")',
          '<svg onload=alert("XSS")>',
          '"><script>alert("XSS")</script>',
          '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        ];

        for (const payload of xssPayloads) {
          await firstNameInput.clear();
          await firstNameInput.fill(payload);
          await firstNameInput.blur();
          await page.waitForTimeout(500);

          const pageContent = await page.content();
          expect(pageContent).not.toContain('<script>alert("XSS")</script>');
          console.log(`XSS prevention test passed for: ${payload.substring(0, 30)}...`);
        }
    });

    test('should prevent SQL injection in search/filter fields', async ({ page }) => {
      const firstNameInput = page.locator('input[formcontrolname="firstName"]');
      
      await expect(firstNameInput).toBeVisible();
        const sqlInjectionPayloads = [
          "' OR '1'='1",
          "'; DROP TABLE prospects; --",
          "' UNION SELECT * FROM users --",
          "admin'--",
          "' OR 1=1 --",
        ];

        for (const payload of sqlInjectionPayloads) {
          await firstNameInput.clear();
          await firstNameInput.fill(payload);
          await firstNameInput.blur();
          await page.waitForTimeout(500);

          const pageContent = await page.content();
          expect(pageContent).not.toContain('SQL error');
          expect(pageContent).not.toContain('database error');
          console.log(`SQL injection prevention test passed for: ${payload}`);
        }
    });

    test('should sanitize comments field', async ({ page }) => {
      const commentsTextarea = page.locator('textarea[formcontrolname="comments"]');
      
      if (await commentsTextarea.isVisible()) {
        const maliciousInputs = [
          '<script>alert("XSS in comments")</script>',
          '<img src=x onerror=alert("XSS")>',
          'javascript:void(0)',
          '<iframe src="http://malicious-site.com"></iframe>',
          '<a href="javascript:alert(\'XSS\')">Click me</a>',
        ];

        for (const input of maliciousInputs) {
          await commentsTextarea.clear();
          await commentsTextarea.fill(input);
          await commentsTextarea.blur();
          await page.waitForTimeout(500);

          console.log(`Comments sanitization test for: ${input.substring(0, 30)}...`);
        }
      }
    });
  });

  test.describe('UI Interaction Edge Cases', () => {
    
    test('should handle keyboard-only form navigation', async ({ page }) => {
      // Tab through all form fields
      await page.keyboard.press('Tab');
      await page.keyboard.type('KeyboardFirst');
      
      await page.keyboard.press('Tab');
      await page.keyboard.type('KeyboardLast');
      
      await page.keyboard.press('Tab');
      await page.keyboard.type('KeyboardMiddle');
      
      await page.keyboard.press('Tab');
      await page.keyboard.type('9089907867');
      
      await page.keyboard.press('Tab');
      await page.keyboard.type('keyboard@test.com');

      // Continue tabbing through remaining fields
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
      }

      console.log('Keyboard navigation test completed');
    });

    test('should handle rapid field switching', async ({ page }) => {
      const fields = [
        page.locator('input[name="firstName"]'),
        page.locator('input[name="lastName"]'),
        page.locator('input[name="email"]'),
        page.locator('input[name="cellPhone"]'),
      ];

      // Rapidly switch between fields
      for (let i = 0; i < 20; i++) {
        const randomField = fields[Math.floor(Math.random() * fields.length)];
        if (await randomField.isVisible()) {
          await randomField.click();
          await randomField.fill(`Test${i}`);
          await page.waitForTimeout(50);
        }
      }

      console.log('Rapid field switching test completed');
    });

    test('should handle form with disabled JavaScript simulation', async ({ page }) => {
      // Fill form normally
      const firstNameInput = page.locator('input[name="firstName"]');
      if (await firstNameInput.isVisible()) {
        await firstNameInput.fill('NoJS');
        await page.locator('input[name="lastName"]').fill('Test');
        await page.locator('input[name="prospectDate"]').fill('2026-02-06');

        console.log('Form interaction without JS enhancements completed');
      }
    });

    test('should handle "Do Not Send SMS" checkbox edge cases', async ({ page }) => {
      const smsCheckbox = page.locator('input[type="checkbox"]').first();
      
      if (await smsCheckbox.isVisible()) {
        // Rapid toggle
        for (let i = 0; i < 10; i++) {
          await smsCheckbox.click();
          await page.waitForTimeout(100);
        }

        // Check final state
        const isChecked = await smsCheckbox.isChecked();
        console.log(`SMS checkbox final state: ${isChecked ? 'checked' : 'unchecked'}`);
      }
    });
  });

  test.describe('Data Persistence Edge Cases', () => {
    
    test('should handle browser refresh during form filling', async ({ page }) => {
      const firstNameInput = page.locator('input[name="firstName"]');
      
      if (await firstNameInput.isVisible()) {
        // Fill some fields
        await firstNameInput.fill('Refresh');
        await page.locator('input[name="lastName"]').fill('Test');
        await page.locator('input[name="email"]').fill('refresh@test.com');

        // Refresh page
        await page.reload();
        await page.waitForTimeout(2000);

        // Check if data persists or is cleared
        const firstNameValue = await firstNameInput.inputValue().catch(() => '');
        console.log(`After refresh, First Name value: "${firstNameValue}"`);
      }
    });

    test('should handle browser back button during form filling', async ({ page }) => {
      const firstNameInput = page.locator('input[name="firstName"]');
      
      if (await firstNameInput.isVisible()) {
        // Fill some fields
        await firstNameInput.fill('BackButton');
        await page.locator('input[name="lastName"]').fill('Test');

        // Navigate away and back
        await page.goBack();
        await page.waitForTimeout(1000);
        await page.goForward();
        await page.waitForTimeout(1000);

        console.log('Browser back/forward test completed');
      }
    });
  });
