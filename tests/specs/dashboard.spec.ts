import { test, expect } from '../fixtures/test.fixture';
import { USERS } from '../test-data/auth.data';
import { AssertHelper } from '../helpers/assert.helper';
import { NavigationHelper } from '../helpers/navigation.helper';
import { Logger } from '../helpers/logger.util';

test.describe('Self-Adapting Dashboard Layout & Session Management Tests', () => {

  test('Validates dashboard rendering and clean logout sessions', async ({ page, loginPage, institutePage, rolePage, dashboardPage }) => {
    const user = USERS.DIRECT_DASHBOARD;
    
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    
    // Auto-navigate to dashboard
    const resultState = await NavigationHelper.detectAndProcessFlow(page, loginPage, institutePage, rolePage, dashboardPage);
    expect(resultState).toBe('DASHBOARD');
    
    // Verify Profile widgets are visible
    await AssertHelper.assertVisible(dashboardPage.profileAvatar);
    await AssertHelper.assertVisible(dashboardPage.selectedInstituteLabel);
    
    // Dynamic welcome greeting validation (resilient to userName changes)
    await AssertHelper.assertRegexMatch(dashboardPage.titleHeader, /Hey.*Welcome.*MentrixOS/i);
    
    // Verify statistic widgets render dynamically
    const widgetsLoaded = await dashboardPage.hasStatisticsWidgets();
    expect(widgetsLoaded).toBeTruthy();
    
    const cardData = await dashboardPage.getStatCards();
    Logger.debug(`[Dashboard] Detected ${cardData.length} statistics cards at runtime.`);
    expect(cardData.length).toBeGreaterThan(0);

    // Perform Logout
    await dashboardPage.logout();
    
    // Verify redirected back to Login page
    await AssertHelper.assertURL(loginPage.page, /.*\//);
    await AssertHelper.assertVisible(loginPage.emailInput);
    
    // Verify session tokens are completely flushed from storage
    await AssertHelper.assertLocalStorage(loginPage.page, 'token', null);
    await AssertHelper.assertLocalStorage(loginPage.page, 'user', null);
    await AssertHelper.assertLocalStorage(loginPage.page, 'selectedInstitute', null);
    await AssertHelper.assertLocalStorage(loginPage.page, 'selectedRole', null);
  });
});
