import { test, expect } from '../fixtures/test.fixture';
import { USERS } from '../test-data/auth.data';
import { AssertHelper } from '../helpers/assert.helper';
import { NavigationHelper } from '../helpers/navigation.helper';

test.describe('Self-Adapting Authentication & Flow Tests', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('Flow 1: User Without Institute (ayushb@gmail.com)', async ({ page, loginPage, institutePage, rolePage, dashboardPage }) => {
    await loginPage.login(USERS.NO_INSTITUTE.email, USERS.NO_INSTITUTE.password);

    // Auto-detect handles the flow dynamically and returns the terminal state
    const resultState = await NavigationHelper.detectAndProcessFlow(page, loginPage, institutePage, rolePage, dashboardPage);
    
    // Assert we ended in an error state on the login page
    expect(resultState).toBe('ERROR');
    
    // Resilient Semantic Assertion: Verifies matching keywords like 'no' and 'institute' (ignoring punctuation, plurals, verbs)
    await AssertHelper.assertSemanticTextMatch(loginPage.errorMessage, ['no', 'institute']);
    
    // Verify session tokens are not created/stored
    await AssertHelper.assertLocalStorage(page, 'token', null);
  });

  test('Flow 2: User with 1 Institute + 1 Role (ayushn@gmail.com)', async ({ page, loginPage, institutePage, rolePage, dashboardPage }) => {
    const user = USERS.DIRECT_DASHBOARD;
    await loginPage.login(user.email, user.password);

    // Auto-detect runs the flow and navigates to the dashboard automatically
    const resultState = await NavigationHelper.detectAndProcessFlow(page, loginPage, institutePage, rolePage, dashboardPage);
    
    // Assert terminal state is dashboard
    expect(resultState).toBe('DASHBOARD');
    
    // Validate session keys exist
    await AssertHelper.assertLocalStorageExists(page, 'token');
    await AssertHelper.assertLocalStorageExists(page, 'selectedInstitute');
    await AssertHelper.assertLocalStorageExists(page, 'selectedRole');

    // Dynamic assertion: verify dashboard shows a welcome message (matching regular expression pattern)
    await AssertHelper.assertRegexMatch(dashboardPage.titleHeader, /Hey.*Welcome.*MentrixOS/i);
    
    // Dynamic validation: make sure stats widgets are present and logout button is visible
    expect(await dashboardPage.hasStatisticsWidgets()).toBeTruthy();
    await AssertHelper.assertVisible(dashboardPage.logoutButton);
  });

  test('Flow 3: User with 1 Institute + Multiple Roles (divyanshu@gmail.com)', async ({ page, loginPage, institutePage, rolePage, dashboardPage }) => {
    const user = USERS.ROLE_SELECTION;
    await loginPage.login(user.email, user.password);

    // Auto-detect will notice a role selection screen, click the first available role card, and land on the dashboard
    const resultState = await NavigationHelper.detectAndProcessFlow(page, loginPage, institutePage, rolePage, dashboardPage);
    
    expect(resultState).toBe('DASHBOARD');
    
    // Dynamic assertions on dashboard widgets and welcome text patterns
    await AssertHelper.assertRegexMatch(dashboardPage.titleHeader, /Hey.*Welcome.*MentrixOS/i);
    expect(await dashboardPage.hasStatisticsWidgets()).toBeTruthy();
    await AssertHelper.assertVisible(dashboardPage.logoutButton);
  });

  test('Flow 4: User with Multiple Institutes + Multiple Roles (ayushl@gmail.com)', async ({ page, loginPage, institutePage, rolePage, dashboardPage }) => {
    const user = USERS.MULTIPLE_INSTITUTES;
    await loginPage.login(user.email, user.password);

    // Auto-detect handles selection steps dynamically and navigates successfully
    const resultState = await NavigationHelper.detectAndProcessFlow(page, loginPage, institutePage, rolePage, dashboardPage);
    
    expect(resultState).toBe('DASHBOARD');
    
    await AssertHelper.assertRegexMatch(dashboardPage.titleHeader, /Hey.*Welcome.*MentrixOS/i);
    expect(await dashboardPage.hasStatisticsWidgets()).toBeTruthy();
    await AssertHelper.assertVisible(dashboardPage.logoutButton);
  });

  test('Flow 4 (Alternate): User with Multiple Institutes + Multiple Roles (pratik@gmail.com)', async ({ page, loginPage, institutePage, rolePage, dashboardPage }) => {
    const user = USERS.MULTIPLE_INSTITUTES_2;
    await loginPage.login(user.email, user.password);

    // Auto-detect handles selection steps dynamically and navigates successfully
    const resultState = await NavigationHelper.detectAndProcessFlow(page, loginPage, institutePage, rolePage, dashboardPage);
    
    expect(resultState).toBe('DASHBOARD');
    
    await AssertHelper.assertRegexMatch(dashboardPage.titleHeader, /Hey.*Welcome.*MentrixOS/i);
    expect(await dashboardPage.hasStatisticsWidgets()).toBeTruthy();
    await AssertHelper.assertVisible(dashboardPage.logoutButton);
  });

  test('Authentication Edge Cases: Resilient Invalid/Empty credentials checks', async ({ loginPage }) => {
    // 1. Invalid password
    await loginPage.login(USERS.INVALID_PASSWORD.email, USERS.INVALID_PASSWORD.password);
    await AssertHelper.assertSemanticTextMatch(loginPage.errorMessage, ['invalid', 'credentials']);

    // 2. Empty fields
    await loginPage.login('', '');
    // Verifies that a generic validation container is visible and has meaningful text
    await AssertHelper.assertValidationMessage(loginPage.errorMessage);
    await AssertHelper.assertSemanticTextMatch(loginPage.errorMessage, ['fields']); // "Please fill in all fields"

    // 3. Malformed Email Address
    await loginPage.login(USERS.MALFORMED_EMAIL.email, USERS.MALFORMED_EMAIL.password);
    await AssertHelper.assertSemanticTextMatch(loginPage.errorMessage, ['email']);
  });
});
