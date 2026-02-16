# Add Prospect Feature - Comprehensive Test Strategy

## 📋 Table of Contents
1. [Feature Overview](#feature-overview)
2. [Test Scenarios](#test-scenarios)
3. [Selector Strategy](#selector-strategy)
4. [Potential Failure Points](#potential-failure-points)
5. [Stability Recommendations](#stability-recommendations)
6. [Page Object Model](#page-object-model)
7. [Test Execution](#test-execution)

---

## 🎯 Feature Overview

**Feature**: Add Prospect Form
**Purpose**: Allow users to create new prospect records in the DMS system
**Location**: Manage Prospects > + Add Prospect

### Form Fields
| Field Name | Type | Required | Validation |
|------------|------|----------|------------|
| First Name | Text Input | Yes | Max length, No special chars |
| Last Name | Text Input | Yes | Max length, No special chars |
| Middle Name | Text Input | No | Max length |
| Cell Phone | Text Input | No | Phone format (10 digits) |
| Email | Text Input | No | Email format |
| Prospect Date | Date Input | Yes | MM/DD/YYYY format |
| Prospect Category | Dropdown | No | Predefined options |
| Lead Status | Dropdown | No | Predefined options |
| Prospect Source | Dropdown | Yes | Predefined options |
| Assigned To | Dropdown | No | User list |
| Affiliated Base | Text Input | No | - |
| Referred By | Text Input | No | - |
| Referral Contact | Text Input | No | - |
| Comments | Textarea | No | Max length |
| Do Not Send SMS | Checkbox | No | Boolean |

---

## 🧪 Test Scenarios

### 1. Functional Tests (10 scenarios)
✅ **TC-FUNC-01**: Verify all form fields are displayed
✅ **TC-FUNC-02**: Submit form with only required fields
✅ **TC-FUNC-03**: Submit form with all fields filled
✅ **TC-FUNC-04**: Verify Prospect Date field accepts valid date format
✅ **TC-FUNC-05**: Verify Prospect Source dropdown functionality
✅ **TC-FUNC-06**: Verify Lead Status dropdown functionality
✅ **TC-FUNC-07**: Verify Cancel button functionality
✅ **TC-FUNC-08**: Verify Do Not Send SMS checkbox
✅ **TC-FUNC-09**: Verify email field accepts valid email
✅ **TC-FUNC-10**: Verify phone number field accepts valid formats

### 2. Negative Tests (15 scenarios)
❌ **TC-NEG-01**: Submit empty form - should show validation errors
❌ **TC-NEG-02**: Submit with missing First Name
❌ **TC-NEG-03**: Submit with missing Last Name
❌ **TC-NEG-04**: Submit with missing Prospect Date
❌ **TC-NEG-05**: Submit with missing Prospect Source
❌ **TC-NEG-06**: Invalid email format
❌ **TC-NEG-07**: Invalid date format
❌ **TC-NEG-08**: Excessively long First Name
❌ **TC-NEG-09**: Special characters in name fields
❌ **TC-NEG-10**: Invalid phone number formats
❌ **TC-NEG-11**: SQL Injection attempt in First Name
❌ **TC-NEG-12**: XSS attempt in Comments field
❌ **TC-NEG-13**: Rapid form submissions
❌ **TC-NEG-14**: Form submission with network interruption
❌ **TC-NEG-15**: Duplicate prospect submission

### 3. Edge Cases (20+ scenarios)
🔸 **Boundary Values**:
- Single character names
- Maximum length inputs (255+ characters)
- Empty strings with spaces
- Unicode characters (Chinese, Arabic, Emojis)

🔸 **Date Edge Cases**:
- Past dates (1900-01-01)
- Future dates (2099-12-31)
- Invalid dates (02/31/2026, 13/01/2026)
- Leap year dates

🔸 **Dropdown Edge Cases**:
- Rapid selection changes
- Selecting first/last options
- Keyboard navigation in dropdowns

🔸 **Security Edge Cases**:
- XSS payloads in all text fields
- SQL injection in all input fields
- Command injection attempts
- LDAP injection

### 4. Regression Tests (15 scenarios)
🔄 **TC-REG-01**: Form loads correctly after navigation
🔄 **TC-REG-02**: All dropdowns populate with options
🔄 **TC-REG-03**: Form validation still works after page reload
🔄 **TC-REG-04**: Data persistence check - form clears after cancel
🔄 **TC-REG-05**: Browser back button handling
🔄 **TC-REG-06**: Multiple form submissions in same session
🔄 **TC-REG-07**: Form accessibility - keyboard navigation
🔄 **TC-REG-08**: Form state after session timeout simulation
🔄 **TC-REG-09**: Form rendering on different viewport sizes
🔄 **TC-REG-10**: Form performance - load time
🔄 **TC-REG-11**: Dropdown selection persistence
🔄 **TC-REG-12**: Error message display consistency
🔄 **TC-REG-13**: Form field character limits
🔄 **TC-REG-14**: Date picker functionality
🔄 **TC-REG-15**: Form submission button state

---

## 🎯 Selector Strategy

### Robust Selector Hierarchy
1. **Primary**: `formcontrolname` attributes (Angular-specific)
2. **Secondary**: ARIA roles and labels
3. **Tertiary**: Text content with regex
4. **Fallback**: CSS selectors with structural context

### Recommended Selectors

#### Input Fields
```typescript
// ✅ BEST - Angular form control name
page.locator('input[formcontrolname="firstName"]')

// ⚠️ AVOID - Generic selectors
page.locator('input').nth(0)  // Fragile!
page.locator('#firstName')     // May change
```

#### Dropdowns (Angular Material)
```typescript
// ✅ BEST - Material select with form control
page.locator('mat-select[formcontrolname="prospectSource"]')

// ✅ GOOD - Options within dropdown
page.locator('mat-option:has-text("WALK-IN")')

// ⚠️ AVOID
page.locator('select')  // Won't work with mat-select
```

#### Buttons
```typescript
// ✅ BEST - Multiple strategies with .or()
page.locator('button:has-text("Add")')
  .or(page.locator('button[type="submit"]'))
  .or(page.getByRole('button', { name: /add/i }))

// ✅ GOOD - Role-based
page.getByRole('button', { name: 'Add Prospect' })
```

#### Validation Messages
```typescript
// ✅ BEST - Material error component
page.locator('mat-error')

// ✅ GOOD - Specific error text
page.locator('mat-error:has-text("required")')
```

### Selector Anti-Patterns to Avoid
❌ `page.locator('input').nth(5)` - Position-dependent
❌ `page.locator('.class-xyz123')` - Auto-generated classes
❌ `page.locator('div > div > input')` - Deep nesting
❌ `page.locator('[id^="mat-"]')` - Dynamic IDs

---

## ⚠️ Potential Failure Points

### 1. **Timing Issues** (HIGH RISK)
**Problem**: Angular Material components load asynchronously
**Symptoms**:
- "Element not found" errors
- "Element not visible" failures
- Flaky dropdown interactions

**Solutions**:
```typescript
// ❌ BAD
await page.click('mat-select');
await page.click('mat-option');  // May fail!

// ✅ GOOD
await page.locator('mat-select').click();
await page.waitForTimeout(500);  // Wait for animation
await page.locator('mat-option').first().click();
await page.waitForTimeout(300);  // Wait for selection

// ✅ BETTER
await page.locator('mat-select').click();
await page.locator('mat-option').first().waitFor({ state: 'visible' });
await page.locator('mat-option').first().click();
```

### 2. **Spinner/Loading States** (HIGH RISK)
**Problem**: Page has loading spinner that blocks interactions
**Solution**:
```typescript
// Always wait for spinner to disappear
await page.waitForSelector('.ngx-spinner-overlay', {
  state: 'hidden',
  timeout: 10000
}).catch(() => {});  // Graceful fallback
```

### 3. **Network Delays** (MEDIUM RISK)
**Problem**: Dropdown options load from API
**Solution**:
```typescript
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);  // Additional buffer
```

### 4. **Form Validation Timing** (MEDIUM RISK)
**Problem**: Validation errors appear after debounce delay
**Solution**:
```typescript
await inputField.fill('value');
await inputField.blur();  // Trigger validation
await page.waitForTimeout(1000);  // Wait for validation
```

### 5. **Dropdown Option Visibility** (HIGH RISK)
**Problem**: Mat-options render in overlay, may be outside viewport
**Solution**:
```typescript
await dropdown.scrollIntoViewIfNeeded();
await dropdown.click();
await page.waitForSelector('mat-option', { state: 'visible' });
```

---

## 🛡️ Stability Recommendations

### 1. **Wait Strategies**

#### Use Explicit Waits
```typescript
// ✅ Wait for specific state
await element.waitFor({ state: 'visible', timeout: 10000 });
await element.waitFor({ state: 'enabled' });
```

#### Use Network Idle
```typescript
// ✅ Wait for API calls to complete
await page.waitForLoadState('networkidle');
```

#### Strategic Timeouts
```typescript
// ✅ After dropdown interactions
await page.waitForTimeout(500);

// ✅ After form submission
await page.waitForTimeout(3000);

// ⚠️ Use sparingly - prefer explicit waits
```

### 2. **Assertion Best Practices**

```typescript
// ✅ GOOD - With timeout
await expect(element).toBeVisible({ timeout: 15000 });

// ✅ GOOD - Soft assertions for non-critical checks
await expect.soft(element).toHaveText('Expected');

// ✅ GOOD - Multiple conditions
await expect(element).toBeVisible();
await expect(element).toBeEnabled();
await expect(element).toHaveValue('expected');
```

### 3. **Error Handling**

```typescript
// ✅ Graceful fallback
const isVisible = await element.isVisible().catch(() => false);

// ✅ Try-catch for optional elements
try {
  await optionalElement.fill('value');
} catch (error) {
  console.log('Optional element not found');
}

// ✅ Conditional interactions
if (await element.isVisible()) {
  await element.click();
}
```

### 4. **Retry Logic**

```typescript
// ✅ Retry flaky operations
async function clickWithRetry(locator: Locator, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await locator.click({ timeout: 5000 });
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}
```

### 5. **Isolation Between Tests**

```typescript
test.beforeEach(async ({ page }) => {
  // ✅ Fresh state for each test
  await page.context().clearCookies();
  await login(page);
  await navigateToForm();
});

test.afterEach(async ({ page }) => {
  // ✅ Cleanup
  await page.close();
});
```

---

## 📦 Page Object Model

### Structure
```
pages/
└── AddProspectPage.ts       # All locators and actions

tests/
└── add-prospect/
    ├── add-prospect-functional.spec.ts
    ├── add-prospect-negative.spec.ts
    ├── add-prospect-regression.spec.ts
    └── TEST_STRATEGY.md
```

### Benefits
✅ **Maintainability**: Change selectors in one place
✅ **Reusability**: Share methods across tests
✅ **Readability**: Tests read like user actions
✅ **Abstraction**: Hide implementation details

### Usage Example
```typescript
// ❌ WITHOUT POM
test('submit form', async ({ page }) => {
  await page.locator('input[formcontrolname="firstName"]').fill('John');
  await page.locator('input[formcontrolname="lastName"]').fill('Doe');
  await page.locator('mat-select[formcontrolname="prospectSource"]').click();
  await page.locator('mat-option').first().click();
  await page.locator('button:has-text("Add")').click();
});

// ✅ WITH POM
test('submit form', async ({ page }) => {
  const addProspectPage = new AddProspectPage(page);
  await addProspectPage.fillRequiredFields({
    firstName: 'John',
    lastName: 'Doe',
    prospectDate: '02/06/2026'
  });
  await addProspectPage.clickAddButton();
});
```

---

## 🚀 Test Execution

### Run All Tests
```bash
npx playwright test tests/add-prospect/
```

### Run Specific Suite
```bash
npx playwright test tests/add-prospect/add-prospect-functional.spec.ts
npx playwright test tests/add-prospect/add-prospect-negative.spec.ts
npx playwright test tests/add-prospect/add-prospect-regression.spec.ts
```

### Run with Debug
```bash
npx playwright test tests/add-prospect/ --debug
```

### Run with UI Mode
```bash
npx playwright test tests/add-prospect/ --ui
```

### Run Specific Test
```bash
npx playwright test tests/add-prospect/ -g "TC-FUNC-01"
```

### Generate Report
```bash
npx playwright test tests/add-prospect/
npx playwright show-report
```

---

## 📊 Test Coverage Summary

| Category | Test Count | Priority |
|----------|------------|----------|
| Functional | 10 | HIGH |
| Negative | 15 | HIGH |
| Edge Cases | 20+ | MEDIUM |
| Regression | 15 | HIGH |
| **TOTAL** | **60+** | - |

---

## 🎯 Success Criteria

✅ All functional tests pass
✅ All negative tests handle errors gracefully
✅ No security vulnerabilities detected
✅ Form loads within 5 seconds
✅ No console errors during normal operation
✅ Tests are stable (< 5% flakiness)
✅ 95%+ test coverage of user workflows

---

## 📝 Maintenance Notes

### When to Update Tests
- ✏️ Form fields added/removed
- ✏️ Validation rules changed
- ✏️ UI framework updated (Angular Material)
- ✏️ API endpoints modified
- ✏️ Business logic changes

### Flakiness Monitoring
- Track test failure rates
- Identify patterns in failures
- Add retries for known flaky operations
- Increase timeouts if needed
- Report persistent issues

### Best Practices
- Keep tests independent
- Use meaningful test names
- Add console logs for debugging
- Take screenshots on failure
- Document known issues
- Review and refactor regularly
