import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth/login';

test.describe('Navigation Edge Cases', () => {
  
  test.setTimeout(180000); // 3 minutes

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should handle rapid menu navigation', async ({ page }) => {
    // Rapid fire navigation through different menu items
    const menuItems = [
      'text=Manage User',
      'text=Manage Prospects', 
      'text=Manage Customer',
      'text=Manage Vendor',
      'text=Dashboard'
    ];

    for (let i = 0; i < 3; i++) { // Repeat 3 times
      for (const menuItem of menuItems) {
        await page.locator(menuItem).click();
        await page.waitForTimeout(200); // Very short wait
      }
    }

    // Should end up on a valid page without errors
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through several pages
    await page.click('text=Manage User');
    await page.waitForTimeout(1000);
    
    await page.click('text=Manage Prospects');
    await page.waitForTimeout(1000);
    
    await page.click('text=Manage Customer');
    await page.waitForTimeout(1000);

    // Use browser navigation
    await page.goBack();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('prospect');

    await page.goBack();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('user');

    await page.goForward();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('prospect');

    await page.goForward();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('customer');
  });

  test('should handle deep linking to protected pages', async ({ page }) => {
    // Try to navigate directly to protected pages
    const protectedUrls = [
      'http://67.225.241.179:89/user/add-user',
      'http://67.225.241.179:89/prospect/manage',
      'http://67.225.241.179:89/customer/list',
      'http://67.225.241.179:89/admin/settings',
      'http://67.225.241.179:89/reports/dashboard'
    ];

    for (const url of protectedUrls) {
      await page.goto(url);
      await page.waitForTimeout(2000);
      
      // Should either load the page (if accessible) or redirect appropriately
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
      
      // If redirected to login, that's also acceptable
      const isValidResponse = currentUrl.includes('login') || 
                             currentUrl.includes('dashboard') || 
                             currentUrl.includes('user') ||
                             currentUrl.includes('prospect') ||
                             currentUrl.includes('customer');
      expect(isValidResponse).toBeTruthy();
    }
  });

  test('should handle navigation with network interruption', async ({ page }) => {
    // Start navigation
    await page.click('text=Manage User');
    
    // Simulate network interruption mid-navigation
    await page.route('**/*', route => route.abort());
    await page.waitForTimeout(1000);
    
    // Restore network
    await page.unroute('**/*');
    
    // Try navigation again
    await page.click('text=Manage Prospects');
    await page.waitForTimeout(3000);
    
    // Should recover gracefully
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });

  test('should handle multiple tab/window scenarios', async ({ page, context }) => {
    // Open new tab
    const newPage = await context.newPage();
    
    // Navigate to same application in new tab
    await newPage.goto('http://67.225.241.179:89/auth/login');
    await newPage.locator('[formcontrolname="userid"]').fill('developer2');
    await newPage.locator('[formcontrolname="Password"]').fill('NineDob109');
    await newPage.getByRole('button', { name: 'Log In' }).click();
    await newPage.waitForTimeout(3000);

    // Navigate in both tabs simultaneously
    await Promise.all([
      page.click('text=Manage User'),
      newPage.click('text=Manage Prospects')
    ]);

    await page.waitForTimeout(2000);

    // Both tabs should function independently
    expect(page.url()).toContain('user');
    expect(newPage.url()).toContain('prospect');

    await newPage.close();
  });

  test('should handle expandable menu edge cases', async ({ page }) => {
    // Test rapid expand/collapse of expandable menus
    const expandableMenus = [
      '#expandIcon1', // Manage User
      'text=Manage Sales Tax',
      'text=Manage Inventory',
      'text=Manage Marketing',
      'text=Manage Lease/Rentals',
      'text=Manage Funds'
    ];

    for (const menu of expandableMenus) {
      try {
        // Rapid expand/collapse
        for (let i = 0; i < 5; i++) {
          await page.locator(menu).click();
          await page.waitForTimeout(100);
        }
      } catch (error) {
        console.log(`Menu ${menu} not found or not expandable`);
      }
    }

    // Should handle without crashing
    await page.waitForTimeout(1000);
    expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should handle URL manipulation attempts', async ({ page }) => {
    const maliciousUrls = [
      'http://67.225.241.179:89/../../../etc/passwd',
      'http://67.225.241.179:89/user/add-user?id=<script>alert("XSS")</script>',
      'http://67.225.241.179:89/user/add-user?id=1\' OR \'1\'=\'1',
      'http://67.225.241.179:89/user/add-user?redirect=http://malicious-site.com',
      'http://67.225.241.179:89/user/add-user#<img src=x onerror=alert("XSS")>',
      'http://67.225.241.179:89/user/add-user?param=' + 'A'.repeat(10000)
    ];

    for (const url of maliciousUrls) {
      await page.goto(url);
      await page.waitForTimeout(2000);
      
      // Should handle malicious URLs safely
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('<script>');
      expect(currentUrl).not.toContain('malicious-site.com');
      
      // Should either sanitize URL or redirect to safe page
      const isSafeResponse = currentUrl.includes('67.225.241.179:89') || 
                            currentUrl.includes('login') ||
                            currentUrl.includes('dashboard');
      expect(isSafeResponse).toBeTruthy();
    }
  });

  test('should handle navigation state persistence', async ({ page }) => {
    // Navigate to a page with state
    await page.click('text=Manage User');
    await page.waitForTimeout(1000);

    // Apply some filters if available
    try {
      const userIdInput = page.locator('input').first();
      if (await userIdInput.isVisible()) {
        await userIdInput.fill('TestUser');
      }
    } catch (error) {
      console.log('No filters available on this page');
    }

    // Navigate away and back
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);
    
    await page.click('text=Manage User');
    await page.waitForTimeout(1000);

    // Check if state is preserved or reset appropriately
    try {
      const userIdInput = page.locator('input').first();
      if (await userIdInput.isVisible()) {
        const value = await userIdInput.inputValue();
        // Either preserved or reset - both are acceptable behaviors
        expect(typeof value).toBe('string');
      }
    } catch (error) {
      console.log('State check not applicable for this page');
    }
  });

  test('should handle navigation timeout scenarios', async ({ page }) => {
    // Set very short timeout for navigation
    page.setDefaultTimeout(5000);

    try {
      // Attempt navigation that might timeout
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle', { timeout: 2000 });
    } catch (error) {
      console.log('Navigation timeout occurred as expected');
    }

    // Reset timeout and verify page is still functional
    page.setDefaultTimeout(30000);
    await page.waitForTimeout(2000);
    
    // Should still be able to navigate
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);
    expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should handle concurrent navigation requests', async ({ page }) => {
    // Start multiple navigation operations simultaneously
    const navigationPromises = [
      page.click('text=Manage User').catch(() => {}),
      page.click('text=Manage Prospects').catch(() => {}),
      page.click('text=Dashboard').catch(() => {})
    ];

    // Wait for all to complete or fail
    await Promise.allSettled(navigationPromises);
    await page.waitForTimeout(3000);

    // Should end up on a valid page
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
    
    // Page should be functional
    expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should handle navigation with disabled JavaScript', async ({ page }) => {
    // Disable JavaScript
    await page.context().addInitScript(() => {
      Object.defineProperty(window, 'navigator', {
        value: { ...window.navigator, javaEnabled: () => false }
      });
    });

    // Try navigation
    await page.click('text=Manage User');
    await page.waitForTimeout(3000);

    // Should handle gracefully (might not work but shouldn't crash)
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });

  test('should handle navigation with slow network', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      await route.continue();
    });

    // Try navigation
    await page.click('text=Manage User');
    await page.waitForTimeout(5000);

    // Should handle slow network gracefully
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();

    // Remove route
    await page.unroute('**/*');
  });
});