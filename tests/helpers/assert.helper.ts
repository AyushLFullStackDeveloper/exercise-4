import { expect, Locator, Page } from '@playwright/test';

/**
 * Reusable dynamic and resilient assertion wrappers for elements, state, and storage
 */
export class AssertHelper {
  
  /**
   * Normalizes a text string by:
   * 1. Converting to lower case.
   * 2. Removing punctuation characters.
   * 3. Replacing multiple spaces/newlines with a single space.
   * 4. Trimming spacing from both ends.
   */
  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Asserts that an error indicator or element is visible.
   */
  static async assertErrorVisible(locator: Locator, message?: string) {
    await expect(locator, message || 'Error container should be visible').toBeVisible({ timeout: 5000 });
  }

  /**
   * Asserts that a validation message container is visible and has non-empty text.
   */
  static async assertValidationMessage(locator: Locator, message?: string) {
    await this.assertErrorVisible(locator, message);
    const text = await locator.innerText();
    expect(text.trim().length, message || 'Validation message should not be empty').toBeGreaterThan(0);
  }

  /**
   * Asserts that the element text contains all specified keywords (fuzzy match).
   * Normalizes both the element text and the keywords for robust checks.
   */
  static async assertSemanticTextMatch(locator: Locator, expectedKeywords: string[], message?: string) {
    await this.assertErrorVisible(locator, message);
    const rawText = await locator.innerText();
    const normalizedActual = this.normalizeText(rawText);

    for (const keyword of expectedKeywords) {
      const normalizedKeyword = this.normalizeText(keyword);
      expect(normalizedActual, message || `Actual text "${rawText}" should contain keyword "${keyword}"`).toContain(normalizedKeyword);
    }
  }

  /**
   * Asserts that an element is visible on the page.
   */
  static async assertVisible(locator: Locator, message?: string) {
    await expect(locator, message).toBeVisible({ timeout: 5000 });
  }

  /**
   * Asserts that an element is hidden or not visible on the page.
   */
  static async assertHidden(locator: Locator, message?: string) {
    await expect(locator, message).toBeHidden({ timeout: 5000 });
  }

  /**
   * Asserts that an element contains a specific text snippet (exact match).
   */
  static async assertContainsText(locator: Locator, expectedText: string, message?: string) {
    await expect(locator, message).toContainText(expectedText, { timeout: 5000 });
  }

  /**
   * Asserts that an element contains a specific text snippet (case-insensitive & partial).
   */
  static async assertContainsTextCaseInsensitive(locator: Locator, expectedText: string, message?: string) {
    const rawText = await locator.innerText();
    expect(rawText.toLowerCase(), message).toContain(expectedText.toLowerCase());
  }

  /**
   * Asserts that an element's text matches a regular expression pattern.
   */
  static async assertRegexMatch(locator: Locator, regex: RegExp, message?: string) {
    await expect(locator, message).toHaveText(regex, { timeout: 5000 });
  }

  /**
   * Asserts that the current URL matches the expected pattern or string.
   */
  static async assertURL(page: Page, expectedPattern: string | RegExp, message?: string) {
    await expect(page, message).toHaveURL(expectedPattern, { timeout: 5000 });
  }

  /**
   * Asserts that a localStorage item matches a specific value.
   */
  static async assertLocalStorage(page: Page, key: string, expectedValue: string | null, message?: string) {
    const actualValue = await page.evaluate((k) => localStorage.getItem(k), key);
    expect(actualValue, message).toBe(expectedValue);
  }

  /**
   * Asserts that a localStorage item exists.
   */
  static async assertLocalStorageExists(page: Page, key: string, message?: string) {
    const actualValue = await page.evaluate((k) => localStorage.getItem(k), key);
    expect(actualValue, message).not.toBeNull();
  }

  /**
   * Asserts the active UI theme matching 'light' or 'dark'.
   */
  static async assertThemeAttribute(page: Page, expectedTheme: 'light' | 'dark', message?: string) {
    const actualTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(actualTheme, message).toBe(expectedTheme);
  }
}
