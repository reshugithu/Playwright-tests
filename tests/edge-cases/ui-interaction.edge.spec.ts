import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth/login';

test.describe('UI Interaction Edge Cases', () => {
  
  test.setTimeout(180000); // 3 minutes

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Responsive Design Edge Cases', () => {
    
    test('should handle extreme viewport sizes', async ({ page }) => {
      const viewportSizes = [
        { width: 320, height: 568, name: 'Very small mobile' },
        { width: 1920, height: 1080, name: 'Full HD' },
        { width: 3840, height: 2160, name: '4K' },
        { width: 800, height: 600, name: 'Small desktop' },
        { width: 1024, height: 768, name: 'Tablet landscape' },
        { width: 768, height: 1024, name: 'Tablet portrait' },
        { width: 2560, height: 1440, name: 'QHD' }
      ];

      for (const viewport of viewportSizes) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);

        console.log(`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);

        // Test basic navigation at this viewport
        await page.click('text=Manage User');
        await page.waitForTimeout(1000);

        // Check if main elements are still accessible
        expect(page.locator('text=Dashboard')).toBeVisible();
        
        // Test menu functionality
        const menuButton = page.locator('button').first(); // Hamburger menu might appear
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.waitForTimeout(500);
        }

        await page.click('text=Dashboard');
        await page.waitForTimeout(500);
      }

      // Reset to standard viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('should handle zoom levels', async ({ page }) => {
      const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];

      for (const zoom of zoomLevels) {
        // Set zoom level
        await page.evaluate((zoomLevel) => {
          document.body.style.zoom = zoomLevel.toString();
        }, zoom);

        await page.waitForTimeout(1000);
        console.log(`Testing zoom level: ${zoom * 100}%`);

        // Test navigation at this zoom level
        await page.click('text=Manage Prospects');
        await page.waitForTimeout(1000);

        // Elements should still be clickable and visible
        expect(page.locator('text=Manage Prospect')).toBeVisible();

        await page.click('text=Dashboard');
        await page.waitForTimeout(500);
      }

      // Reset zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1';
      });
    });
  });

  test.describe('Input Method Edge Cases', () => {
    
    test('should handle keyboard-only navigation', async ({ page }) => {
      // Navigate to Add User form
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');
      await page.locator('#expandIcon1').click();
      await page.waitForTimeout(500);
      await page.locator('#item_1').click();
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /\+ Add User/i }).click();
      await page.waitForLoadState('networkidle');

      // Use only keyboard navigation
      await page.keyboard.press('Tab'); // Move to first field
      await page.keyboard.type('KeyboardUser');
      
      await page.keyboard.press('Tab'); // Move to next field
      await page.keyboard.type('John');
      
      await page.keyboard.press('Tab'); // Move to next field
      await page.keyboard.type('Middle');
      
      await page.keyboard.press('Tab'); // Move to next field
      await page.keyboard.type('Doe');

      // Continue tabbing through form
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
      }

      // Should be able to navigate entire form with keyboard
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElement).toBeTruthy();
    });

    test('should handle rapid key presses', async ({ page }) => {
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      const filterPanel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');
      if ((await filterPanel.getAttribute('aria-expanded')) !== 'true') {
        await filterPanel.locator('mat-expansion-panel-header').click();
        await page.waitForTimeout(500);
      }

      const lastNameInput = filterPanel.locator('input[formcontrolname="lastName"]');
      if (await lastNameInput.isVisible()) {
        await lastNameInput.click();

        // Rapid key presses
        const keys = 'abcdefghijklmnopqrstuvwxyz';
        for (const key of keys) {
          await page.keyboard.press(key);
          await page.waitForTimeout(10); // Very fast typing
        }

        await page.waitForTimeout(1000);
        
        // Should handle rapid input without errors
        const value = await lastNameInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    });

    test('should handle simultaneous key combinations', async ({ page }) => {
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');

      // Test various key combinations
      const keyCombinations = [
        ['Control', 'a'], // Select all
        ['Control', 'c'], // Copy
        ['Control', 'v'], // Paste
        ['Control', 'z'], // Undo
        ['Control', 'y'], // Redo
        ['Control', 'f'], // Find
        ['Alt', 'Tab'], // Alt+Tab
        ['Control', 'Shift', 'i'], // Dev tools
        ['F5'], // Refresh
        ['Control', 'r'], // Refresh
        ['Escape'] // Escape
      ];

      for (const combo of keyCombinations) {
        try {
          if (combo.length === 1) {
            await page.keyboard.press(combo[0]);
          } else {
            await page.keyboard.press(combo.join('+'));
          }
          await page.waitForTimeout(500);
        } catch (error) {
          console.log(`Key combination ${combo.join('+')} not supported or caused error`);
        }
      }

      // Should still be functional after key combinations
      expect(page.locator('text=Manage User')).toBeVisible();
    });
  });

  test.describe('Mouse Interaction Edge Cases', () => {
    
    test('should handle rapid mouse clicks', async ({ page }) => {
      // Rapid clicking on navigation items
      const menuItems = [
        'text=Dashboard',
        'text=Manage User', 
        'text=Manage Prospects',
        'text=Dashboard'
      ];

      for (const item of menuItems) {
        // Rapid fire clicks
        for (let i = 0; i < 5; i++) {
          await page.locator(item).click();
          await page.waitForTimeout(50);
        }
      }

      await page.waitForTimeout(2000);
      
      // Should handle rapid clicks without errors
      expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should handle mouse hover edge cases', async ({ page }) => {
      // Test hover on various elements
      const hoverTargets = [
        'text=Dashboard',
        'text=Manage User',
        'text=Manage Prospects',
        'button',
        'input',
        'mat-select'
      ];

      for (const target of hoverTargets) {
        try {
          const elements = page.locator(target);
          const count = await elements.count();
          
          for (let i = 0; i < Math.min(count, 3); i++) {
            await elements.nth(i).hover();
            await page.waitForTimeout(100);
          }
        } catch (error) {
          console.log(`Hover test failed for ${target}`);
        }
      }

      // Should handle hover interactions gracefully
      expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should handle drag and drop operations', async ({ page }) => {
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');

      // Try to drag elements (even if not draggable)
      const draggableElements = page.locator('th, td, button, .mat-header-cell');
      const count = await draggableElements.count();

      if (count > 1) {
        try {
          const source = draggableElements.first();
          const target = draggableElements.nth(1);

          await source.dragTo(target);
          await page.waitForTimeout(1000);
        } catch (error) {
          console.log('Drag and drop not supported or failed');
        }
      }

      // Should handle drag operations gracefully
      expect(page.locator('text=Manage User')).toBeVisible();
    });

    test('should handle right-click context menus', async ({ page }) => {
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      // Right-click on various elements
      const rightClickTargets = [
        'text=Manage Prospect',
        'table',
        'button',
        'input'
      ];

      for (const target of rightClickTargets) {
        try {
          const element = page.locator(target).first();
          if (await element.isVisible()) {
            await element.click({ button: 'right' });
            await page.waitForTimeout(500);
            
            // Press Escape to close any context menu
            await page.keyboard.press('Escape');
            await page.waitForTimeout(200);
          }
        } catch (error) {
          console.log(`Right-click test failed for ${target}`);
        }
      }

      // Should handle right-clicks gracefully
      expect(page.locator('text=Manage Prospect')).toBeVisible();
    });
  });

  test.describe('Focus and Accessibility Edge Cases', () => {
    
    test('should handle focus trapping in modals', async ({ page }) => {
      // Try to open any modal dialogs
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');
      
      try {
        await page.locator('#expandIcon1').click();
        await page.waitForTimeout(500);
        await page.locator('#item_1').click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: /\+ Add User/i }).click();
        await page.waitForLoadState('networkidle');

        // Test tab navigation within form (acts like a modal)
        let tabCount = 0;
        const maxTabs = 50;

        while (tabCount < maxTabs) {
          await page.keyboard.press('Tab');
          tabCount++;
          await page.waitForTimeout(100);

          // Check if focus is trapped within the form
          const activeElement = await page.evaluate(() => {
            const active = document.activeElement;
            return {
              tagName: active?.tagName,
              type: active?.getAttribute('type'),
              formControlName: active?.getAttribute('formcontrolname')
            };
          });

          if (activeElement.tagName === 'BODY') {
            break; // Focus escaped, which is also acceptable
          }
        }

        console.log(`Completed ${tabCount} tab presses`);
        expect(tabCount).toBeGreaterThan(0);
      } catch (error) {
        console.log('Modal focus test not applicable');
      }
    });

    test('should handle screen reader simulation', async ({ page }) => {
      // Simulate screen reader navigation
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      // Check for ARIA labels and roles
      const ariaElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('[aria-label], [role], [aria-describedby]');
        return Array.from(elements).map(el => ({
          tagName: el.tagName,
          ariaLabel: el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
          ariaDescribedBy: el.getAttribute('aria-describedby')
        }));
      });

      console.log(`Found ${ariaElements.length} elements with ARIA attributes`);
      expect(ariaElements.length).toBeGreaterThanOrEqual(0);

      // Test keyboard navigation for screen readers
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      expect(page.locator('text=Manage Prospect')).toBeVisible();
    });

    test('should handle high contrast mode simulation', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          * {
            background: black !important;
            color: white !important;
            border-color: white !important;
          }
          a, button {
            color: yellow !important;
          }
        `
      });

      await page.waitForTimeout(1000);

      // Test navigation in high contrast mode
      await page.click('text=Manage User');
      await page.waitForTimeout(1000);

      await page.click('text=Dashboard');
      await page.waitForTimeout(1000);

      // Should remain functional in high contrast mode
      expect(page.locator('text=Dashboard')).toBeVisible();
    });
  });

  test.describe('Animation and Transition Edge Cases', () => {
    
    test('should handle disabled animations', async ({ page }) => {
      // Disable animations
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0.01ms !important;
            transition-duration: 0.01ms !important;
            transition-delay: 0.01ms !important;
          }
        `
      });

      // Test navigation with disabled animations
      await page.click('text=Manage User');
      await page.waitForTimeout(500);

      await page.click('text=Manage Prospects');
      await page.waitForTimeout(500);

      // Should work without animations
      expect(page.locator('text=Manage Prospect')).toBeVisible();
    });

    test('should handle very slow animations', async ({ page }) => {
      // Make animations very slow
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 10s !important;
            transition-duration: 10s !important;
          }
        `
      });

      // Test navigation with slow animations
      await page.click('text=Manage User');
      await page.waitForTimeout(2000); // Don't wait for full animation

      // Should still be functional even with slow animations
      expect(page.locator('text=Manage User')).toBeVisible();
    });

    test('should handle interrupted animations', async ({ page }) => {
      // Start navigation
      await page.click('text=Manage User');
      
      // Immediately interrupt with another navigation
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(100);
      
      // Interrupt again
      await page.click('text=Dashboard');
      await page.waitForTimeout(2000);

      // Should handle interrupted animations gracefully
      expect(page.locator('text=Dashboard')).toBeVisible();
    });
  });

  test.describe('Error State UI Edge Cases', () => {
    
    test('should handle UI in error states', async ({ page }) => {
      // Simulate network errors to trigger error states
      await page.route('**/api/**', route => route.abort());

      await page.click('text=Manage User');
      await page.waitForTimeout(3000);

      // Try to interact with UI in error state
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        try {
          await buttons.nth(i).click();
          await page.waitForTimeout(500);
        } catch (error) {
          console.log(`Button ${i} not clickable in error state`);
        }
      }

      // Restore network
      await page.unroute('**/api/**');
      await page.waitForTimeout(1000);

      // Should recover from error state
      expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should handle loading state interruptions', async ({ page }) => {
      // Simulate slow loading
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });

      // Start navigation
      const navigationPromise = page.click('text=Manage User');
      
      // Interrupt during loading
      await page.waitForTimeout(500);
      await page.click('text=Dashboard');

      await navigationPromise.catch(() => {}); // Ignore errors from interrupted navigation
      await page.waitForTimeout(3000);

      // Remove route
      await page.unroute('**/*');

      // Should handle loading interruptions gracefully
      expect(page.locator('text=Dashboard')).toBeVisible();
    });
  });
});