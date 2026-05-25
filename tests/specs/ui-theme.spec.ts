import { test, expect } from '../fixtures/test.fixture';
import { AssertHelper } from '../helpers/assert.helper';

test.describe('Self-Adapting UI Theme Tests', () => {

  test('Theme toggles and persists preference on page reload', async ({ loginPage }) => {
    await loginPage.goto();
    
    // Sniff document's default attribute
    const defaultTheme = await loginPage.getThemeAttribute();
    expect(defaultTheme === 'light' || defaultTheme === null).toBeTruthy();

    // Toggle theme to Dark mode
    await loginPage.toggleTheme();
    await AssertHelper.assertThemeAttribute(loginPage.page, 'dark');
    await AssertHelper.assertLocalStorage(loginPage.page, 'appTheme', 'dark');

    // Toggle back to Light mode
    await loginPage.toggleTheme();
    await AssertHelper.assertThemeAttribute(loginPage.page, 'light');
    await AssertHelper.assertLocalStorage(loginPage.page, 'appTheme', 'light');

    // Toggle back to Dark mode before reload
    await loginPage.toggleTheme();
    await AssertHelper.assertThemeAttribute(loginPage.page, 'dark');

    // Perform page reload
    await loginPage.reloadPage();

    // Verify dark mode setting remains active
    await AssertHelper.assertThemeAttribute(loginPage.page, 'dark');
    await AssertHelper.assertLocalStorage(loginPage.page, 'appTheme', 'dark');
  });
});
