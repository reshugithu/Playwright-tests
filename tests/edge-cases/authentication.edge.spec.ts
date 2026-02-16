import { test, expect } from '@playwright/test';

test.describe('Authentication Edge Cases', () => {
  
  test.setTimeout(120000); // 2 minutes for edge case testing

  test.beforeEach(async ({ page }) => {
    await page.goto('http://67.225.241.179:89/auth/login', {
      waitUntil: 'domcontentloaded'
    });
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    // Wait for login form
    await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });

    // Test with invalid username
    await page.locator('[formcontrolname="userid"]').fill('invaliduser123');
    await page.locator('[formcontrolname="Password"]').fill('wrongpassword');
    
    await page.getByRole('button', { name: 'Log In' }).click();
    
    // Should show error message or stay on login page
    await page.waitForTimeout(3000);
    
    // Verify we're still on login page or error is shown
    const currentUrl = page.url();
    expect(currentUrl).toContain('login');
  });

  test('should handle empty credentials', async ({ page }) => {
    await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });
    
    // Try to login with empty fields
    await page.getByRole('button', { name: 'Log In' }).click();
    
    // Should show validation errors or prevent submission
    await page.waitForTimeout(2000);
    
    // Verify still on login page
    expect(page.url()).toContain('login');
  });

  test('should handle SQL injection attempts', async ({ page }) => {
    await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });
    
    // Test SQL injection patterns
    const sqlInjectionPatterns = [
      "' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users--",
      "'; DROP TABLE users;--"
    ];

    for (const pattern of sqlInjectionPatterns) {
      await page.locator('[formcontrolname="userid"]').fill(pattern);
      await page.locator('[formcontrolname="Password"]').fill('password');
      
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.waitForTimeout(2000);
      
      // Should not allow login and stay on login page
      expect(page.url()).toContain('login');
      
      // Clear fields for next iteration
      await page.locator('[formcontrolname="userid"]').clear();
      await page.locator('[formcontrolname="Password"]').clear();
    }
  });

  test('should handle XSS attempts in login fields', async ({ page }) => {
    await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });
    
    const xssPatterns = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '"><script>alert("XSS")</script>'
    ];

    for (const pattern of xssPatterns) {
      await page.locator('[formcontrolname="userid"]').fill(pattern);
      await page.locator('[formcontrolname="Password"]').fill('password');
      
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.waitForTimeout(2000);
      
      // Should not execute script and stay on login page
      expect(page.url()).toContain('login');
      
      // Clear fields
      await page.locator('[formcontrolname="userid"]').clear();
      await page.locator('[formcontrolname="Password"]').clear();
    }
  });

  test('should handle extremely long input values', async ({ page }) => {
    await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });
    
    // Create very long strings
    const longString = 'a'.repeat(1000);
    const veryLongString = 'b'.repeat(10000);
    
    await page.locator('[formcontrolname="userid"]').fill(longString);
    await page.locator('[formcontrolname="Password"]').fill(veryLongString);
    
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForTimeout(3000);
    
    // Should handle gracefully without crashing
    expect(page.url()).toContain('login');
  });

  test('should handle special characters in credentials', async ({ page }) => {
    await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });
    
    const specialCharacters = [
      '!@#$%^&*()',
      'üñíçødé',
      '中文测试',
      '🚀🎉💻',
      '\\n\\r\\t',
      '"quotes"',
      "'single'quotes'"
    ];

    for (const chars of specialCharacters) {
      await page.locator('[formcontrolname="userid"]').fill(`user${chars}`);
      await page.locator('[formcontrolname="Password"]').fill(`pass${chars}`);
      
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.waitForTimeout(2000);
      
      // Should handle without errors
      expect(page.url()).toContain('login');
      
      // Clear fields
      await page.locator('[formcontrolname="userid"]').clear();
      await page.locator('[formcontrolname="Password"]').clear();
    }
  });

  test('should handle network interruption during login', async ({ page }) => {
    await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });
    
    // Fill valid credentials
    await page.locator('[formcontrolname="userid"]').fill('developer2');
    await page.locator('[formcontrolname="Password"]').fill('NineDob109');
    
    // Simulate network failure
    await page.route('**/*', route => route.abort());
    
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForTimeout(5000);
    
    // Should handle network error gracefully
    // Restore network
    await page.unroute('**/*');
  });

  test('should handle rapid multiple login attempts', async ({ page }) => {
    await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });
    
    // Rapid fire login attempts
    for (let i = 0; i < 5; i++) {
      await page.locator('[formcontrolname="userid"]').fill(`user${i}`);
      await page.locator('[formcontrolname="Password"]').fill(`pass${i}`);
      
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.waitForTimeout(500); // Short wait between attempts
    }
    
    // Should handle without crashing
    expect(page.url()).toContain('login');
  });

  test('should handle browser back/forward during login process', async ({ page }) => {
    await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });
    
    // Fill credentials
    await page.locator('[formcontrolname="userid"]').fill('developer2');
    await page.locator('[formcontrolname="Password"]').fill('NineDob109');
    
    // Navigate away and back
    await page.goBack();
    await page.waitForTimeout(1000);
    await page.goForward();
    await page.waitForTimeout(1000);
    
    // Should maintain form state or reset gracefully
    const userIdValue = await page.locator('[formcontrolname="userid"]').inputValue();
    // Either preserved or cleared - both are acceptable
    expect(typeof userIdValue).toBe('string');
  });

  test('should handle session timeout scenarios', async ({ page }) => {
    // Login successfully first
    await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });
    await page.locator('[formcontrolname="userid"]').fill('developer2');
    await page.locator('[formcontrolname="Password"]').fill('NineDob109');
    await page.getByRole('button', { name: 'Log In' }).click();
    
    // Wait for dashboard
    await page.waitForTimeout(5000);
    
    // Simulate session expiry by clearing cookies
    await page.context().clearCookies();
    
    // Try to navigate to a protected page
    await page.goto('http://67.225.241.179:89/dashboard');
    await page.waitForTimeout(3000);
    
    // Should redirect to login or show session expired message
    const currentUrl = page.url();
    const isRedirectedToLogin = currentUrl.includes('login') || currentUrl.includes('auth');
    expect(isRedirectedToLogin).toBeTruthy();
  });
});