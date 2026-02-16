# Add Prospect Test Suite

## 📋 Overview

Comprehensive test automation suite for the Add Prospect feature in the Dealership Management System (DMS). Implements industry best practices with Page Object Model design pattern.

## 🎯 Quick Start

```bash
# Run all Add Prospect tests
npx playwright test tests/add-prospect/

# Run specific test suite
npx playwright test tests/add-prospect/add-prospect-functional.spec.ts

# Run with debug mode
npx playwright test tests/add-prospect/ --debug

# Run specific test by name
npx playwright test tests/add-prospect/ -g "TC-FUNC-01"
```

## 📁 File Structure

```
tests/add-prospect/
├── add-prospect-functional.spec.ts    # 10 functional tests
├── add-prospect-negative.spec.ts      # 15 negative tests
├── add-prospect-regression.spec.ts    # 15 regression tests
├── TEST_STRATEGY.md                   # Detailed test strategy
└── README.md                          # This file

pages/
└── AddProspectPage.ts                 # Page Object Model (30+ methods)
```

## 🧪 Test Coverage

### Functional Tests (10 scenarios)
- ✅ Form field visibility
- ✅ Required fields submission
- ✅ Complete form submission
- ✅ Date format validation
- ✅ Dropdown functionality
- ✅ Cancel button
- ✅ Checkbox interactions
- ✅ Email validation
- ✅ Phone validation

### Negative Tests (15 scenarios)
- ❌ Empty form submission
- ❌ Missing required fields
- ❌ Invalid formats (email, date, phone)
- ❌ Excessively long inputs
- ❌ Special characters
- ❌ SQL injection prevention
- ❌ XSS attack prevention
- ❌ Rapid submissions
- ❌ Network interruption
- ❌ Duplicate submissions

### Regression Tests (15 scenarios)
- 🔄 Form loading
- 🔄 Dropdown population
- 🔄 Validation persistence
- 🔄 Browser navigation
- 🔄 Multiple submissions
- 🔄 Keyboard accessibility
- 🔄 Session timeout
- 🔄 Responsive design
- 🔄 Performance monitoring
- 🔄 Error consistency

## 🎯 Page Object Model

### Key Methods

```typescript
// Navigation
await addProspectPage.navigateToAddProspect();

// Fill forms
await addProspectPage.fillRequiredFields({
  firstName: 'John',
  lastName: 'Doe',
  prospectDate: '02/06/2026'
});

await addProspectPage.fillCompleteForm({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  // ... more fields
});

// Interactions
await addProspectPage.selectFirstProspectSource();
await addProspectPage.clickAddButton();
await addProspectPage.toggleDoNotSendSMS();

// Verifications
await addProspectPage.verifyFormIsVisible();
await addProspectPage.verifySuccessMessage();
await addProspectPage.verifyValidationErrors();
```

## ⚠️ Known Issues & Solutions

### 1. Dropdown Timing
**Issue**: Angular Material dropdowns need time to render
**Solution**: 500ms wait after opening, 300ms after selection

### 2. Loading Spinner
**Issue**: Spinner blocks interactions
**Solution**: Always wait for spinner to hide before interactions

### 3. Form Validation
**Issue**: Validation messages appear after debounce
**Solution**: Call `.blur()` and wait 1000ms

### 4. Network Delays
**Issue**: Dropdown options load from API
**Solution**: Use `waitForLoadState('networkidle')`

## 🛡️ Stability Features

✅ Explicit waits with timeouts
✅ Graceful error handling
✅ Retry logic for flaky operations
✅ Network idle waits
✅ Strategic timeouts
✅ Robust selector strategy
✅ Test isolation

## 📊 Test Execution

### Expected Results
- **Total Tests**: 40 (Functional + Negative + Regression)
- **Execution Time**: ~15-20 minutes
- **Pass Rate Target**: >95%
- **Flakiness Target**: <5%

### CI/CD Integration
```yaml
# Example GitHub Actions
- name: Run Add Prospect Tests
  run: npx playwright test tests/add-prospect/
  
- name: Upload Test Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 🔍 Debugging

### View Test Report
```bash
npx playwright show-report
```

### Run with Trace
```bash
npx playwright test tests/add-prospect/ --trace on
```

### Run Headed Mode
```bash
npx playwright test tests/add-prospect/ --headed
```

### Run Single Test with Debug
```bash
npx playwright test tests/add-prospect/ -g "TC-FUNC-01" --debug
```

## 📝 Maintenance

### Adding New Tests
1. Add test to appropriate spec file
2. Use Page Object methods
3. Follow naming convention: `TC-[TYPE]-[NUMBER]`
4. Add console logs for debugging
5. Update TEST_STRATEGY.md

### Updating Selectors
1. Update in `AddProspectPage.ts` only
2. Test changes across all suites
3. Document any breaking changes

### Handling Flaky Tests
1. Identify failure pattern
2. Add appropriate waits
3. Implement retry logic if needed
4. Document in TEST_STRATEGY.md

## 🎓 Best Practices

✅ Use Page Object Model
✅ Explicit waits over implicit
✅ Meaningful test names
✅ Test isolation
✅ Comprehensive logging
✅ Error handling
✅ Security testing
✅ Accessibility testing
✅ Performance monitoring

## 📚 Additional Resources

- [TEST_STRATEGY.md](./TEST_STRATEGY.md) - Detailed test strategy
- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns
2. Use Page Object methods
3. Add appropriate waits
4. Include error handling
5. Update documentation
6. Test for flakiness

## 📞 Support

For issues or questions:
1. Check TEST_STRATEGY.md for known issues
2. Review test execution logs
3. Check Playwright documentation
4. Contact QA team

---

**Last Updated**: February 2026
**Test Suite Version**: 1.0.0
**Playwright Version**: 1.57.0
