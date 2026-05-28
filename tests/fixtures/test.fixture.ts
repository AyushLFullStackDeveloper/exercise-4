import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/Login.page';
import { SelectInstitutePage } from '../pages/SelectInstitute.page';
import { SelectRolePage } from '../pages/SelectRole.page';
import { DashboardPage } from '../pages/Dashboard.page';

// Define the custom fixtures type
type MyFixtures = {
  loginPage: LoginPage;
  institutePage: SelectInstitutePage;
  rolePage: SelectRolePage;
  dashboardPage: DashboardPage;
};

// Extend basic test with custom fixtures
export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  institutePage: async ({ page }, use) => {
    await use(new SelectInstitutePage(page));
  },
  rolePage: async ({ page }, use) => {
    await use(new SelectRolePage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
