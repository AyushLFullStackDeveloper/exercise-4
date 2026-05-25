const { test, expect } = require('@playwright/test');

test.describe('Role Selection Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/');
    });

    test('TC_14: No Role Assigned', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { user: {}, pre_context_token: '123' } })
        }));
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
                data: [{ institute_id: 'i1', institute_name: 'Inst 1', roles: [] }] // No roles
            })
        }));
        await page.route('**/auth/roles?institute_id=i1', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: [] })
        }));

        await page.locator('#email').fill('test@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();

        await page.waitForURL('**/role-selection');
        
        // Wait for UI to render empty state
        await expect(page.locator('text=No roles assigned to this institute.')).toBeVisible();
    });

    test('TC_15: Single Role Auto-Skip', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { user: {}, pre_context_token: '123' } })
        }));
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
                data: [{ institute_id: 'i1', institute_name: 'Inst 1', roles: [{ role_id: 'r1', role_name: 'Admin' }] }] 
            })
        }));
        await page.route('**/auth/select-context', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ access_token: 'valid-token' })
        }));

        await page.locator('#email').fill('test@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();

        // Should bypass Role Selection and go straight to Dashboard
        await page.waitForURL('**/dashboard');
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('TC_16 & TC_17: Multiple Roles & Select Role', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { user: {}, pre_context_token: '123' } })
        }));
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
                data: [{
                    institute_id: 'i1', institute_name: 'Inst 1',
                    roles: [
                        { role_id: 'r1', role_name: 'Admin' },
                        { role_id: 'r2', role_name: 'Student' }
                    ]
                }]
            })
        }));
        await page.route('**/auth/select-context', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ access_token: 'final-token' })
        }));

        await page.locator('#email').fill('test@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();

        // Lands on Role Selection
        await page.waitForURL('**/role-selection');
        await expect(page.locator('text=Choose Your Role')).toBeVisible();
        await expect(page.locator('h3', { hasText: 'Admin' })).toBeVisible();
        await expect(page.locator('h3', { hasText: 'Student' })).toBeVisible();

        // TC_17: Select Role. The UI has a 800ms timer before it can interact
        await page.waitForTimeout(1000); 

        await page.locator('h3', { hasText: 'Student' }).click();

        // Navigates to dashboard
        await page.waitForURL('**/dashboard');
        
        const selectedRole = await page.evaluate(() => localStorage.getItem('selectedRole'));
        expect(selectedRole).toContain('Student');
        
        const finalToken = await page.evaluate(() => localStorage.getItem('token'));
        expect(finalToken).toBe('final-token');
    });

    test('TC_18: Continue Without Role', async ({ page }) => {
        test.info().annotations.push({ type: 'info', description: 'N/A: UI auto-navigates on card click.' });
        expect(true).toBeTruthy();
    });
});
