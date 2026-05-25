import { Page } from '@playwright/test';
import { LoginPage } from '../pages/Login.page';
import { SelectInstitutePage } from '../pages/SelectInstitute.page';
import { SelectRolePage } from '../pages/SelectRole.page';
import { DashboardPage } from '../pages/Dashboard.page';

export class NavigationHelper {
  /**
   * Sniffs the DOM and active URL, dynamically clicks selection cards,
   * and navigates to the terminal page (Dashboard or Login Error).
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
      // Small delay for UI transitions
      await page.waitForTimeout(400);
      
      const state = await loginPage.determineCurrentPageState();
      console.log(`[Auto-Detect] Flow Step ${i + 1}: Current Page = ${state}`);

      switch (state) {
        case 'LOGIN':
          // Check if an error message became visible on the login form
          if (await loginPage.errorMessage.isVisible()) {
            console.log('[Auto-Detect] Flow Terminated: Validation error message detected.');
            return 'ERROR';
          }
          break;

        case 'INSTITUTE_SELECTION':
          const instCount = await institutePage.getInstitutesCount();
          console.log(`[Auto-Detect] Institute Selection: Detected ${instCount} institutes.`);
          if (instCount > 0) {
            console.log('[Auto-Detect] Institute Selection: Clicking first available institute card.');
            await institutePage.selectFirstInstitute();
          } else {
            console.log('[Auto-Detect] Institute Selection: No institute cards visible yet.');
          }
          break;

        case 'ROLE_SELECTION':
          const roleCount = await rolePage.getRolesCount();
          console.log(`[Auto-Detect] Role Selection: Detected ${roleCount} roles.`);
          if (roleCount > 0) {
            console.log('[Auto-Detect] Role Selection: Clicking first available role card.');
            await rolePage.selectFirstRole();
          } else {
            console.log('[Auto-Detect] Role Selection: No role cards visible yet.');
          }
          break;

        case 'DASHBOARD':
          console.log('[Auto-Detect] Flow Terminated: Successfully landed on the Dashboard.');
          return 'DASHBOARD';
      }
    }
    
    throw new Error('Self-adapting flow engine failed to resolve within the max flow steps.');
  }
}
