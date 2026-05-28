import { Locator, Page } from '@playwright/test';
import { BasePage } from './Base.page';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly themeToggleButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Priority: getByPlaceholder / getByRole
    this.emailInput = page.getByPlaceholder('Enter phone or email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Continue', exact: true });
    
    // Resilient fallbacks
    this.errorMessage = page.locator('#password ~ p');
    this.themeToggleButton = page.locator('button[title*="Switch to"]');
  }

  /**
   * Navigate to the login page.
   */
  async goto() {
    await this.navigateTo('/');
  }

  /**
   * Log in using the provided credentials.
   */
  async login(email: string, password?: string) {
    await this.emailInput.fill(email);
    if (password !== undefined) {
      await this.passwordInput.fill(password);
    } else {
      await this.passwordInput.clear();
    }
    await this.loginButton.click();
  }

  /**
   * Toggles the UI theme between light and dark.
   */
  async toggleTheme() {
    await this.themeToggleButton.click();
  }

  /**
   * Reads the current validation error message if visible.
   */
  async getErrorMessageText(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return this.errorMessage.innerText();
    }
    return null;
  }
}
