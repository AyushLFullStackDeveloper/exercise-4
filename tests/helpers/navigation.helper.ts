import { Page } from '@playwright/test';
import { LoginPage } from '../pages/Login.page';
import { SelectInstitutePage } from '../pages/SelectInstitute.page';
import { SelectRolePage } from '../pages/SelectRole.page';
import { DashboardPage } from '../pages/Dashboard.page';
import { Logger } from './logger.util';

export class NavigationHelper {
  /**
   * Self-adapting flow engine that sniffs the current page state via DOM/URL,
   * automatically clicks selection cards, and drives navigation to the terminal
   * page (Dashboard or Login Error).
   *
   * Replaces all `waitForTimeout()` calls with event-driven
   * `waitForLoadState('domcontentloaded')` checks to ensure the browser has
   * settled before each state-detection iteration.
   */
  static async detectAndProcessFlow(
    page: Page,
    loginPage: LoginPage,
    institutePage: SelectInstitutePage,
    rolePage: SelectRolePage,
    dashboardPage: DashboardPage
  ): Promise<'ERROR' | 'DASHBOARD'> {
    const maxIterations = 6;

    for (let i = 0; i < maxIterations; i++) {
      // Wait for DOM to be ready before inspecting the current state.
      // This is event-driven (resolves as soon as domcontentloaded fires),
      // unlike waitForTimeout() which blocks for a fixed arbitrary delay.
      await page.waitForLoadState('domcontentloaded');

      const state = await loginPage.determineCurrentPageState();
      Logger.debug(`[Auto-Detect] Flow Step ${i + 1}: Current Page = ${state}`);

      switch (state) {
        case 'LOGIN':
          // If an error message is already visible, the flow has terminated
          if (await loginPage.errorMessage.isVisible()) {
            Logger.info('[Auto-Detect] Flow Terminated: Validation error message detected.');
            return 'ERROR';
          }
          // Still on login but no error yet — wait for a navigation to begin
          await page.waitForLoadState('networkidle');
          break;

        case 'INSTITUTE_SELECTION': {
          // Wait for institute cards to become visible before counting
          await institutePage.instituteHeaders.first().waitFor({ state: 'visible', timeout: 5_000 });
          const instCount = await institutePage.getInstitutesCount();
          Logger.debug(`[Auto-Detect] Institute Selection: Detected ${instCount} institute(s).`);
          if (instCount > 0) {
            Logger.info('[Auto-Detect] Institute Selection: Clicking first available institute card.');
            await institutePage.selectFirstInstitute();
          }
          break;
        }

        case 'ROLE_SELECTION': {
          // Wait for role cards to become visible before counting
          await rolePage.roleHeaders.first().waitFor({ state: 'visible', timeout: 5_000 });
          const roleCount = await rolePage.getRolesCount();
          Logger.debug(`[Auto-Detect] Role Selection: Detected ${roleCount} role(s).`);
          if (roleCount > 0) {
            Logger.info('[Auto-Detect] Role Selection: Clicking first available role card.');
            await rolePage.selectFirstRole();
          }
          break;
        }

        case 'DASHBOARD':
          Logger.info('[Auto-Detect] Flow Terminated: Successfully landed on the Dashboard.');
          return 'DASHBOARD';
      }
    }

    throw new Error(
      '[NavigationHelper] Self-adapting flow engine failed to resolve within the maximum flow steps. ' +
      'Increase maxIterations or investigate the application routing.'
    );
  }
}
