import { Locator, Page } from '@playwright/test';
import { BasePage } from './Base.page';

export class DashboardPage extends BasePage {
  readonly titleHeader: Locator;
  readonly logoutButton: Locator;
  readonly profileAvatar: Locator;
  readonly selectedInstituteLabel: Locator;
  readonly statCards: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('h1');
    this.logoutButton = page.getByRole('button', { name: /logout/i });
    this.profileAvatar = page.locator('div[title="Profile"]');
    this.selectedInstituteLabel = page.locator('.institute-truncate');
    this.statCards = page.locator('div[style*="box-shadow: var(--shadow-sm)"]');
    this.menuButton = page.locator('.mobile-menu-btn');
  }

  /**
   * Click logout to terminate the session.
   */
  async logout() {
    await this.logoutButton.click();
  }

  /**
   * Get the header welcome text.
   */
  async getWelcomeText(): Promise<string> {
    return this.titleHeader.innerText();
  }

  /**
   * Returns details of all statistics cards rendered on the dashboard.
   */
  async getStatCards(): Promise<Array<{ number: string; title: string }>> {
    const cards = await this.statCards.all();
    const stats: Array<{ number: string; title: string }> = [];

    for (const card of cards) {
      const numText = await card.locator('h2').innerText();
      const titleText = await card.locator('h3').innerText();
      stats.push({ number: numText, title: titleText });
    }

    return stats;
  }

  /**
   * Returns true if there is at least one visible statistics widget.
   */
  async hasStatisticsWidgets(): Promise<boolean> {
    const count = await this.statCards.count();
    return count > 0;
  }
}
