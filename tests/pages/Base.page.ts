import { Page } from '@playwright/test';

export type ActivePageState = 'LOGIN' | 'INSTITUTE_SELECTION' | 'ROLE_SELECTION' | 'DASHBOARD';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a path relative to the baseURL.
   */
  async navigateTo(path: string = '/') {
    await this.page.goto(path);
  }

  /**
   * Get the current browser URL.
   */
  async getURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for a specific URL pattern.
   */
  async waitForURL(pattern: string | RegExp) {
    await this.page.waitForURL(pattern, { waitUntil: 'load', timeout: 5000 });
  }

  /**
   * Reload the current page.
   */
  async reloadPage() {
    await this.page.reload({ waitUntil: 'load' });
  }

  /**
   * Read item from localStorage.
   */
  async getLocalStorageItem(key: string): Promise<string | null> {
    return this.page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
  }

  /**
   * Read document's active theme attribute.
   */
  async getThemeAttribute(): Promise<string | null> {
    return this.page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  }

  /**
   * Detects the active page state based on the current URL.
   */
  async determineCurrentPageState(): Promise<ActivePageState> {
    // Wait briefly for any redirects to resolve
    await this.page.waitForTimeout(200);
    const url = this.page.url();
    if (url.includes('dashboard')) {
      return 'DASHBOARD';
    }
    if (url.includes('role-selection')) {
      return 'ROLE_SELECTION';
    }
    if (url.includes('institute-selection')) {
      return 'INSTITUTE_SELECTION';
    }
    return 'LOGIN';
  }
}
