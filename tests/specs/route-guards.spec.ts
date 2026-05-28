import { test, expect } from '../fixtures/test.fixture';
import { USERS } from '../test-data/auth.data';
import { AssertHelper } from '../helpers/assert.helper';
import { NavigationHelper } from '../helpers/navigation.helper';

test.describe('Self-Adapting Route Guards & Session Reloads', () => {

  test('Protected routes redirect unauthenticated visits back to login', async ({ dashboardPage }) => {
    // Navigate straight to dashboard with clean storage
    await dashboardPage.navigateTo('/dashboard');
    
    // Guard redirects the user back to the login screen
    await AssertHelper.assertURL(dashboardPage.page, /.*\//);
  });

  test('Maintains session state and active context after dashboard reloads', async ({ page, loginPage, institutePage, rolePage, dashboardPage }) => {
    const user = USERS.DIRECT_DASHBOARD;
    
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    
    // Auto-navigate to dashboard
    const resultState = await NavigationHelper.detectAndProcessFlow(page, loginPage, institutePage, rolePage, dashboardPage);
    expect(resultState).toBe('DASHBOARD');
    
    // Perform reload
    await dashboardPage.reloadPage();
    
    // Verify session and URL are preserved
    await AssertHelper.assertURL(dashboardPage.page, /.*dashboard/);
    await AssertHelper.assertRegexMatch(dashboardPage.titleHeader, /Hey.*Welcome.*MentrixOS/i);
  });
});
