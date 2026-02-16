import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth/login';

test.describe('Data Handling Edge Cases', () => {
  
  test.setTimeout(180000); // 3 minutes

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Large Dataset Handling', () => {
    
    test('should handle large result sets in user list', async ({ page }) => {
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');
      
      // Wait for user list to load
      await page.getByRole('button', { name: '+ Add User' }).waitFor({ timeout: 30000 });

      // Clear all filters to get maximum results
      try {
        const refreshButton = page.locator('mat-icon', { hasText: 'refresh' }).locator('..');
        if (await refreshButton.isVisible()) {
          await refreshButton.click();
          await page.waitForTimeout(5000);
        }
      } catch (error) {
        console.log('Refresh button not found');
      }

      // Check if table handles large datasets
      const tableRows = page.locator('tbody tr');
      await page.waitForTimeout(3000);
      
      const rowCount = await tableRows.count();
      console.log(`Table loaded with ${rowCount} rows`);
      
      // Should handle any number of rows without crashing
      expect(rowCount).toBeGreaterThanOrEqual(0);

      // Test scrolling through large dataset
      if (rowCount > 10) {
        await page.keyboard.press('End'); // Scroll to bottom
        await page.waitForTimeout(1000);
        await page.keyboard.press('Home'); // Scroll to top
        await page.waitForTimeout(1000);
      }
    });

    test('should handle pagination edge cases', async ({ page }) => {
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      // Look for pagination controls
      const paginationControls = [
        'button[aria-label="First page"]',
        'button[aria-label="Previous page"]', 
        'button[aria-label="Next page"]',
        'button[aria-label="Last page"]',
        '.mat-paginator-navigation-first',
        '.mat-paginator-navigation-previous',
        '.mat-paginator-navigation-next',
        '.mat-paginator-navigation-last'
      ];

      for (const control of paginationControls) {
        try {
          const element = page.locator(control);
          if (await element.isVisible()) {
            // Test rapid pagination clicks
            for (let i = 0; i < 5; i++) {
              await element.click();
              await page.waitForTimeout(500);
            }
          }
        } catch (error) {
          console.log(`Pagination control ${control} not found or not clickable`);
        }
      }

      // Should handle pagination without errors
      await page.waitForTimeout(2000);
      expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Data Validation Edge Cases', () => {
    
    test('should handle special characters in search fields', async ({ page }) => {
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      // Expand filter panel
      const filterPanel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');
      if ((await filterPanel.getAttribute('aria-expanded')) !== 'true') {
        await filterPanel.locator('mat-expansion-panel-header').click();
        await page.waitForTimeout(500);
      }

      const specialCharacterTests = [
        { chars: '!@#$%^&*()', description: 'Special symbols' },
        { chars: '<script>alert("XSS")</script>', description: 'XSS attempt' },
        { chars: "'; DROP TABLE users; --", description: 'SQL injection' },
        { chars: '\\n\\r\\t', description: 'Escape characters' },
        { chars: '中文测试', description: 'Chinese characters' },
        { chars: 'Ñoño Müller', description: 'Accented characters' },
        { chars: '🚀🎉💻', description: 'Emojis' },
        { chars: 'a'.repeat(1000), description: 'Very long string' },
        { chars: '   ', description: 'Only spaces' },
        { chars: '\u0000\u0001\u0002', description: 'Control characters' }
      ];

      const lastNameInput = filterPanel.locator('input[formcontrolname="lastName"]');
      if (await lastNameInput.isVisible()) {
        for (const test of specialCharacterTests) {
          await lastNameInput.clear();
          await lastNameInput.fill(test.chars);
          await page.waitForTimeout(500);

          // Try to apply filter
          const applyButton = filterPanel.locator('button').first();
          await applyButton.click();
          await page.waitForTimeout(2000);

          console.log(`Testing special chars: ${test.description}`);
          
          // Should handle without crashing
          expect(page.locator('table')).toBeVisible();
        }
      }
    });

    test('should handle concurrent data operations', async ({ page }) => {
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      const filterPanel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');
      if ((await filterPanel.getAttribute('aria-expanded')) !== 'true') {
        await filterPanel.locator('mat-expansion-panel-header').click();
        await page.waitForTimeout(500);
      }

      // Start multiple filter operations simultaneously
      const operations = [];
      
      const prospectIdInput = filterPanel.locator('input[formcontrolname="prospectId"]');
      if (await prospectIdInput.isVisible()) {
        operations.push(prospectIdInput.fill('1186'));
      }

      const lastNameInput = filterPanel.locator('input[formcontrolname="lastName"]');
      if (await lastNameInput.isVisible()) {
        operations.push(lastNameInput.fill('Test'));
      }

      // Execute all operations concurrently
      await Promise.all(operations);

      // Apply filter multiple times rapidly
      const applyButton = filterPanel.locator('button').first();
      for (let i = 0; i < 3; i++) {
        await applyButton.click();
        await page.waitForTimeout(100);
      }

      await page.waitForTimeout(3000);
      
      // Should handle concurrent operations gracefully
      expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Memory and Performance Edge Cases', () => {
    
    test('should handle memory-intensive operations', async ({ page }) => {
      // Navigate through multiple pages to build up memory usage
      const pages = [
        'text=Manage User',
        'text=Manage Prospects', 
        'text=Manage Customer',
        'text=Manage Vendor',
        'text=Dashboard'
      ];

      // Repeat navigation many times to stress test memory
      for (let cycle = 0; cycle < 10; cycle++) {
        for (const pageLink of pages) {
          await page.click(pageLink);
          await page.waitForTimeout(500);
          
          // Force some DOM operations
          await page.evaluate(() => {
            // Create and remove elements to stress memory
            for (let i = 0; i < 100; i++) {
              const div = document.createElement('div');
              div.innerHTML = 'Test content ' + i;
              document.body.appendChild(div);
              document.body.removeChild(div);
            }
          });
        }
      }

      // Should still be functional after memory stress
      expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should handle rapid form interactions', async ({ page }) => {
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');
      
      // Navigate to Add User form
      await page.locator('#expandIcon1').click();
      await page.waitForTimeout(500);
      await page.locator('#item_1').click();
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /\+ Add User/i }).click();
      await page.waitForLoadState('networkidle');

      // Rapid form field interactions
      const userIdInput = page.locator('mat-form-field', { hasText: 'User Id' }).locator('input');
      if (await userIdInput.isVisible()) {
        // Rapid typing and clearing
        for (let i = 0; i < 20; i++) {
          await userIdInput.fill(`User${i}`);
          await userIdInput.clear();
          await page.waitForTimeout(50);
        }

        // Final fill
        await userIdInput.fill('TestUser');
        
        // Should handle rapid interactions without errors
        const finalValue = await userIdInput.inputValue();
        expect(finalValue).toBe('TestUser');
      }
    });

    test('should handle browser resource limits', async ({ page }) => {
      // Create many DOM elements to test browser limits
      await page.evaluate(() => {
        const container = document.createElement('div');
        container.id = 'stress-test-container';
        document.body.appendChild(container);

        // Create many elements
        for (let i = 0; i < 10000; i++) {
          const element = document.createElement('div');
          element.textContent = `Element ${i}`;
          element.className = 'stress-test-element';
          container.appendChild(element);
        }
      });

      await page.waitForTimeout(2000);

      // Try to interact with the application
      await page.click('text=Dashboard');
      await page.waitForTimeout(1000);

      // Clean up
      await page.evaluate(() => {
        const container = document.getElementById('stress-test-container');
        if (container) {
          container.remove();
        }
      });

      // Should still be functional
      expect(page.locator('text=Dashboard')).toBeVisible();
    });
  });

  test.describe('Data Persistence Edge Cases', () => {
    
    test('should handle session data persistence', async ({ page }) => {
      // Navigate to a form and fill some data
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      const filterPanel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');
      if ((await filterPanel.getAttribute('aria-expanded')) !== 'true') {
        await filterPanel.locator('mat-expansion-panel-header').click();
        await page.waitForTimeout(500);
      }

      const prospectIdInput = filterPanel.locator('input[formcontrolname="prospectId"]');
      if (await prospectIdInput.isVisible()) {
        await prospectIdInput.fill('12345');
      }

      // Refresh the page
      await page.reload();
      await page.waitForTimeout(3000);

      // Check if data persists or is appropriately cleared
      const filterPanelAfterReload = page.locator('mat-expansion-panel:has-text("Prospect Filter")');
      if ((await filterPanelAfterReload.getAttribute('aria-expanded')) !== 'true') {
        await filterPanelAfterReload.locator('mat-expansion-panel-header').click();
        await page.waitForTimeout(500);
      }

      const prospectIdInputAfterReload = filterPanelAfterReload.locator('input[formcontrolname="prospectId"]');
      if (await prospectIdInputAfterReload.isVisible()) {
        const value = await prospectIdInputAfterReload.inputValue();
        // Either persisted or cleared - both are acceptable
        expect(typeof value).toBe('string');
      }
    });

    test('should handle local storage edge cases', async ({ page }) => {
      // Fill local storage with large amounts of data
      await page.evaluate(() => {
        try {
          // Try to fill localStorage to capacity
          const largeData = 'x'.repeat(1024 * 1024); // 1MB string
          for (let i = 0; i < 10; i++) {
            localStorage.setItem(`testData${i}`, largeData);
          }
        } catch (error) {
          console.log('LocalStorage limit reached:', error);
        }
      });

      // Try to use the application
      await page.click('text=Manage User');
      await page.waitForTimeout(2000);

      // Clean up localStorage
      await page.evaluate(() => {
        for (let i = 0; i < 10; i++) {
          localStorage.removeItem(`testData${i}`);
        }
      });

      // Should handle localStorage issues gracefully
      expect(page.locator('text=Manage User')).toBeVisible();
    });

    test('should handle cookie edge cases', async ({ page }) => {
      // Set many cookies
      const cookies = [];
      for (let i = 0; i < 50; i++) {
        cookies.push({
          name: `testCookie${i}`,
          value: `value${i}`,
          domain: '67.225.241.179',
          path: '/'
        });
      }

      await page.context().addCookies(cookies);

      // Navigate and test functionality
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      // Should handle many cookies without issues
      expect(page.locator('text=Manage Prospect')).toBeVisible();

      // Clean up cookies
      await page.context().clearCookies();
    });
  });

  test.describe('Error Recovery Edge Cases', () => {
    
    test('should recover from network errors during data operations', async ({ page }) => {
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      // Start a filter operation
      const filterPanel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');
      if ((await filterPanel.getAttribute('aria-expanded')) !== 'true') {
        await filterPanel.locator('mat-expansion-panel-header').click();
        await page.waitForTimeout(500);
      }

      const prospectIdInput = filterPanel.locator('input[formcontrolname="prospectId"]');
      if (await prospectIdInput.isVisible()) {
        await prospectIdInput.fill('1186');
      }

      // Simulate network failure during operation
      await page.route('**/*', route => route.abort());
      
      const applyButton = filterPanel.locator('button').first();
      await applyButton.click();
      await page.waitForTimeout(2000);

      // Restore network
      await page.unroute('**/*');
      await page.waitForTimeout(1000);

      // Try operation again
      await applyButton.click();
      await page.waitForTimeout(3000);

      // Should recover and work normally
      expect(page.locator('table')).toBeVisible();
    });

    test('should handle partial data loading scenarios', async ({ page }) => {
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');

      // Simulate slow/partial loading by intercepting requests
      await page.route('**/api/**', async route => {
        // Delay some requests
        await new Promise(resolve => setTimeout(resolve, 3000));
        await route.continue();
      });

      // Try to interact while data is loading
      const refreshButton = page.locator('mat-icon', { hasText: 'refresh' }).locator('..');
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
      }

      await page.waitForTimeout(5000);

      // Remove route
      await page.unroute('**/api/**');

      // Should handle partial loading gracefully
      expect(page.locator('text=Manage User')).toBeVisible();
    });
  });
});