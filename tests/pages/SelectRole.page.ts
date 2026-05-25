import { Locator, Page } from '@playwright/test';
import { BasePage } from './Base.page';

export class SelectRolePage extends BasePage {
  readonly titleHeader: Locator;
  readonly roleHeaders: Locator;
  readonly roleCards: Locator;
  readonly changeInstituteButton: Locator;
  readonly selectedInstituteHeader: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.getByRole('heading', { level: 1 });
    // Find all headings level 3 inside the role cards specifically (with bg-card background style)
    this.roleCards = page.locator('div[style*="var(--bg-card)"]');
    this.roleHeaders = this.roleCards.getByRole('heading', { level: 3 });
    
    // Change Institute button
    this.changeInstituteButton = page.getByRole('button', { name: /change institute/i });
    
    // Selected institute name banner
    this.selectedInstituteHeader = page.locator('div[style*="var(--banner-bg)"]').getByRole('heading', { level: 3 });
    this.errorMessage = page.locator('div[style*="#fee2e2"]');
  }

  /**
   * Click on the first available role card.
   */
  async selectFirstRole() {
    await this.roleHeaders.first().click();
  }

  /**
   * Click on a specific role by its name.
   */
  async selectRoleByName(name: string) {
    const card = this.roleHeaders.filter({ hasText: name }).first();
    await card.click();
  }

  /**
   * Get the list of all available role names.
   */
  async getVisibleRoleNames(): Promise<string[]> {
    return this.roleHeaders.allTextContents();
  }

  /**
   * Get the count of available roles.
   */
  async getRolesCount(): Promise<number> {
    return this.roleHeaders.count();
  }

  /**
   * Click the back/change institute button to go back to institute selection.
   */
  async clickChangeInstitute() {
    await this.changeInstituteButton.click();
  }
}
