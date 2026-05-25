import { Locator, Page } from '@playwright/test';
import { BasePage } from './Base.page';

export class SelectInstitutePage extends BasePage {
  readonly titleHeader: Locator;
  readonly searchInput: Locator;
  readonly instituteHeaders: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('h1');
    this.searchInput = page.getByPlaceholder('Search your institute');
    // Using accessible role matching heading level 3 for institute names
    this.instituteHeaders = page.getByRole('heading', { level: 3 });
    this.errorMessage = page.locator('div[style*="#ef4444"]');
  }

  /**
   * Search/filter the institute list by name.
   */
  async searchInstitute(name: string) {
    await this.searchInput.fill(name);
  }

  /**
   * Click on the first available institute card.
   */
  async selectFirstInstitute() {
    await this.instituteHeaders.first().click();
  }

  /**
   * Click on a specific institute card by its visible name.
   */
  async selectInstituteByName(name: string) {
    const card = this.instituteHeaders.filter({ hasText: name }).first();
    await card.click();
  }

  /**
   * Returns the count of visible institutes.
   */
  async getInstitutesCount(): Promise<number> {
    return this.instituteHeaders.count();
  }

  /**
   * Get the names of all currently visible institutes.
   */
  async getVisibleInstituteNames(): Promise<string[]> {
    return this.instituteHeaders.allTextContents();
  }
}
