import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Add Prospect Form
 * Encapsulates all locators and actions for the Add Prospect feature
 */
export class AddProspectPage {
  readonly page: Page;

  // Form Field Locators
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly cellPhoneInput: Locator;
  readonly emailInput: Locator;
  readonly prospectDateInput: Locator;
  readonly prospectCategoryDropdown: Locator;
  readonly leadStatusDropdown: Locator;
  readonly prospectSourceDropdown: Locator;
  readonly assignedToDropdown: Locator;
  readonly affiliatedBaseInput: Locator;
  readonly referredByInput: Locator;
  readonly referralContactInput: Locator;
  readonly commentsTextarea: Locator;

  // Checkbox Locators
  readonly doNotSendSMSCheckbox: Locator;

  // Button Locators
  readonly addButton: Locator;
  readonly cancelButton: Locator;

  // Validation Message Locators
  readonly successMessage: Locator;
  readonly errorMessages: Locator;
  readonly requiredFieldErrors: Locator;

  // Page Header Locators
  readonly pageTitle: Locator;
  readonly addProspectHeader: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize Form Field Locators with robust selectors
    this.firstNameInput = page.locator('input[formcontrolname="firstName"]');
    this.lastNameInput = page.locator('input[formcontrolname="lastName"]');
    this.middleNameInput = page.locator('input[formcontrolname="middleName"]');
    this.cellPhoneInput = page.locator('input[formcontrolname="contactNumber"]');
    this.emailInput = page.locator('input[formcontrolname="email"]');
    this.prospectDateInput = page.locator('input[formcontrolname="prospectDate"]');
    
    // Dropdown locators using Angular Material selectors
    this.prospectCategoryDropdown = page.locator('mat-select[formcontrolname="prospectCategory"]');
    this.leadStatusDropdown = page.locator('mat-select[formcontrolname="leadStatus"]');
    this.prospectSourceDropdown = page.locator('mat-select[formcontrolname="prospectSource"]');
    this.assignedToDropdown = page.locator('mat-select[formcontrolname="assignedTo"]');
    
    // Additional fields
    this.affiliatedBaseInput = page.locator('input[formcontrolname="affiliatedBase"]');
    this.referredByInput = page.locator('input[formcontrolname="referredBy"]');
    this.referralContactInput = page.locator('input[formcontrolname="referralContact"]');
    this.commentsTextarea = page.locator('textarea[formcontrolname="comments"]');

    // Checkbox
    this.doNotSendSMSCheckbox = page.locator('input[type="checkbox"]').first();

    // Buttons with multiple selector strategies for robustness
    this.addButton = page.locator('button:has-text("Add")').first();
    this.cancelButton = page.locator('button:has-text("Cancel")').first();

    // Validation messages
    this.successMessage = page.locator('text=/prospect added successfully/i');
    this.errorMessages = page.locator('mat-error, .error-message, .mat-form-field-invalid');
    this.requiredFieldErrors = page.locator('mat-error:has-text("required")');

    // Page headers
    this.pageTitle = page.locator('text=Manage Prospect');
    this.addProspectHeader = page.locator('text=Add Prospect');
  }

  /**
   * Navigate to Add Prospect form
   */
  async navigateToAddProspect() {
    // Wait for spinner to disappear
    await this.page.waitForSelector('.ngx-spinner-overlay', {
      state: 'hidden',
      timeout: 10000
    }).catch(() => {});

    // Click Manage Prospects
    await this.page.click('text=Manage Prospects');
    await this.page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 });

    // Wait for page to settle
    await this.page.waitForTimeout(2000);

    // Click Add Prospect button
    const addProspectButton = this.page.locator('button:has-text("+ Add Prospect")')
      .or(this.page.locator('button:has-text("Add Prospect")'))
      .or(this.page.locator('button').filter({ hasText: /add prospect/i }));

    await addProspectButton.waitFor({ state: 'visible', timeout: 10000 });
    await addProspectButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await addProspectButton.click();

    // Wait for form to appear
    await this.page.waitForTimeout(1000);
    await expect(this.firstNameInput).toBeVisible({ timeout: 10000 });
  }

  /**
   * Fill First Name field
   */
  async fillFirstName(firstName: string) {
    await this.firstNameInput.waitFor({ state: 'visible' });
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(firstName);
  }

  /**
   * Fill Last Name field
   */
  async fillLastName(lastName: string) {
    await this.lastNameInput.waitFor({ state: 'visible' });
    await this.lastNameInput.clear();
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Fill Middle Name field
   */
  async fillMiddleName(middleName: string) {
    if (await this.middleNameInput.isVisible()) {
      await this.middleNameInput.clear();
      await this.middleNameInput.fill(middleName);
    }
  }

  /**
   * Fill Cell Phone field
   */
  async fillCellPhone(phone: string) {
    await this.cellPhoneInput.waitFor({ state: 'visible' });
    await this.cellPhoneInput.clear();
    await this.cellPhoneInput.fill(phone);
  }

  /**
   * Fill Email field
   */
  async fillEmail(email: string) {
    await this.emailInput.waitFor({ state: 'visible' });
    await this.emailInput.clear();
    await this.emailInput.fill(email);
  }

  /**
   * Fill Prospect Date field
   * @param date - Date in MM/DD/YYYY format
   */
  async fillProspectDate(date: string) {
    await this.prospectDateInput.waitFor({ state: 'visible' });
    await this.prospectDateInput.clear();
    await this.prospectDateInput.fill(date);
  }

  /**
   * Select Prospect Category from dropdown
   */
  async selectProspectCategory(category: string) {
    if (await this.prospectCategoryDropdown.isVisible()) {
      await this.prospectCategoryDropdown.click();
      await this.page.waitForTimeout(500);
      await this.page.locator(`mat-option:has-text("${category}")`).click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Select Lead Status from dropdown
   */
  async selectLeadStatus(status: string) {
    await this.leadStatusDropdown.waitFor({ state: 'visible' });
    await this.leadStatusDropdown.click();
    await this.page.waitForTimeout(500);
    await this.page.locator(`mat-option:has-text("${status}")`).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Select Prospect Source from dropdown
   */
  async selectProspectSource(source: string) {
    await this.prospectSourceDropdown.waitFor({ state: 'visible' });
    await this.prospectSourceDropdown.click();
    await this.page.waitForTimeout(500);
    await this.page.locator(`mat-option:has-text("${source}")`).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Select first available option from Prospect Source dropdown
   */
  async selectFirstProspectSource() {
    await this.prospectSourceDropdown.waitFor({ state: 'visible' });
    await this.prospectSourceDropdown.click();
    await this.page.waitForTimeout(500);
    await this.page.locator('mat-option').first().click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Select Assigned To from dropdown
   */
  async selectAssignedTo(assignee: string) {
    if (await this.assignedToDropdown.isVisible()) {
      await this.assignedToDropdown.click();
      await this.page.waitForTimeout(500);
      await this.page.locator(`mat-option:has-text("${assignee}")`).click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Fill Comments field
   */
  async fillComments(comments: string) {
    if (await this.commentsTextarea.isVisible()) {
      await this.commentsTextarea.clear();
      await this.commentsTextarea.fill(comments);
    }
  }

  /**
   * Toggle Do Not Send SMS checkbox
   */
  async toggleDoNotSendSMS() {
    if (await this.doNotSendSMSCheckbox.isVisible()) {
      await this.doNotSendSMSCheckbox.click();
    }
  }

  /**
   * Click Add button to submit form
   */
  async clickAddButton() {
    await this.addButton.waitFor({ state: 'visible' });
    await this.addButton.click();
  }

  /**
   * Click Cancel button
   */
  async clickCancelButton() {
    if (await this.cancelButton.isVisible()) {
      await this.cancelButton.click();
    }
  }

  /**
   * Fill form with minimum required fields
   */
  async fillRequiredFields(data: {
    firstName: string;
    lastName: string;
    prospectDate: string;
  }) {
    await this.fillFirstName(data.firstName);
    await this.fillLastName(data.lastName);
    await this.fillProspectDate(data.prospectDate);
    await this.selectFirstProspectSource();
  }

  /**
   * Fill complete form with all fields
   */
  async fillCompleteForm(data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    cellPhone?: string;
    email?: string;
    prospectDate: string;
    prospectCategory?: string;
    leadStatus?: string;
    prospectSource?: string;
    assignedTo?: string;
    comments?: string;
  }) {
    await this.fillFirstName(data.firstName);
    await this.fillLastName(data.lastName);
    
    if (data.middleName) await this.fillMiddleName(data.middleName);
    if (data.cellPhone) await this.fillCellPhone(data.cellPhone);
    if (data.email) await this.fillEmail(data.email);
    
    await this.fillProspectDate(data.prospectDate);
    
    if (data.prospectCategory) await this.selectProspectCategory(data.prospectCategory);
    if (data.leadStatus) await this.selectLeadStatus(data.leadStatus);
    if (data.prospectSource) {
      await this.selectProspectSource(data.prospectSource);
    } else {
      await this.selectFirstProspectSource();
    }
    if (data.assignedTo) await this.selectAssignedTo(data.assignedTo);
    if (data.comments) await this.fillComments(data.comments);
  }

  /**
   * Verify form is visible and ready
   */
  async verifyFormIsVisible() {
    await expect(this.addProspectHeader).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.prospectDateInput).toBeVisible();
    await expect(this.prospectSourceDropdown).toBeVisible();
    await expect(this.addButton).toBeVisible();
  }

  /**
   * Verify success message is displayed
   */
  async verifySuccessMessage() {
    await expect(this.successMessage).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify validation errors are displayed
   */
  async verifyValidationErrors() {
    const errorCount = await this.errorMessages.count();
    expect(errorCount).toBeGreaterThan(0);
  }

  /**
   * Verify specific required field error
   */
  async verifyRequiredFieldError(fieldName: string) {
    const errorMessage = this.page.locator(`mat-error:has-text("${fieldName}")`);
    await expect(errorMessage).toBeVisible();
  }

  /**
   * Get all dropdown options for a specific dropdown
   */
  async getDropdownOptions(dropdown: Locator): Promise<string[]> {
    await dropdown.click();
    await this.page.waitForTimeout(500);
    const options = await this.page.locator('mat-option').allTextContents();
    await this.page.keyboard.press('Escape');
    return options.filter(opt => opt.trim() !== '');
  }

  /**
   * Get field value
   */
  async getFieldValue(field: Locator): Promise<string> {
    return await field.inputValue();
  }

  /**
   * Verify field has specific value
   */
  async verifyFieldValue(field: Locator, expectedValue: string) {
    await expect(field).toHaveValue(expectedValue);
  }

  /**
   * Clear all form fields
   */
  async clearAllFields() {
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    if (await this.middleNameInput.isVisible()) await this.middleNameInput.clear();
    if (await this.cellPhoneInput.isVisible()) await this.cellPhoneInput.clear();
    if (await this.emailInput.isVisible()) await this.emailInput.clear();
    await this.prospectDateInput.clear();
    if (await this.commentsTextarea.isVisible()) await this.commentsTextarea.clear();
  }
}
