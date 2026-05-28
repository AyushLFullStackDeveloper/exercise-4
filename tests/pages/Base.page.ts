import { Page } from '@playwright/test';

export type ActivePageState = 'LOGIN' | 'INSTITUTE_SELECTION' | 'ROLE_SELECTION' | 'DASHBOARD';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a path relative to the baseURL.
   * Waits for the page to reach 'load' state before resolving.
   */
  async navigateTo(path: string = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'load' });
  }

  /**
   * Get the current browser URL.
   */
  async getURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for a specific URL pattern using Playwright's built-in URL watcher.
   * Uses 'load' state to guarantee the page has fully rendered before returning.
   */
  async waitForURL(pattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(pattern, { waitUntil: 'load', timeout: 10_000 });
  }

  /**
   * Reload the current page and wait for it to fully load.
   */
  async reloadPage(): Promise<void> {
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
   *
   * Uses `waitForLoadState('domcontentloaded')` to ensure the page has
   * painted before reading the URL — eliminates the need for waitForTimeout().
   */
  async determineCurrentPageState(): Promise<ActivePageState> {
    // Wait for DOM to be ready (no static delay needed)
    await this.page.waitForLoadState('domcontentloaded');

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
