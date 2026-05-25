const { test, expect } = require('@playwright/test');

test.describe('User Persona Flows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/');
    });

    test('USER1: No access - Should show error', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { user: { full_name: 'USER1' }, pre_context_token: 't1' } })
        }));
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: [] })
        }));

        await page.locator('#email').fill('user1@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();

        await expect(page.locator('text=No institutes assigned to this account.')).toBeVisible();
        await expect(page).toHaveURL('http://localhost:3000/');
    });

    test('USER2: Direct Dashboard - 1 Inst, 1 Role', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { user: { full_name: 'USER2' }, pre_context_token: 't2' } })
        }));
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
                data: [{ 
                    institute_id: 'i1', institute_name: 'Inst 1', tenant_id: 't1',
                    roles: [{ role_id: 'r1', role_name: 'Admin' }] 
                }]
            })
        }));
        await page.route('**/auth/select-context', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { access_token: 'final-token-2' } })
        }));

        await page.locator('#email').fill('user2@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();

        await page.waitForURL('**/dashboard');
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('USER3: Role Selection - 1 Inst, Multiple Roles', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { user: { full_name: 'USER3' }, pre_context_token: 't3' } })
        }));
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
                data: [{ 
                    institute_id: 'i1', institute_name: 'Inst 1', tenant_id: 't1',
                    roles: [
                        { role_id: 'r1', role_name: 'Admin' },
                        { role_id: 'r2', role_name: 'Student' }
                    ] 
                }]
            })
        }));

        await page.locator('#email').fill('user3@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();

        await page.waitForURL('**/role-selection');
        await expect(page.locator('text=Choose Your Role')).toBeVisible();
    });

    test('USER4 & USER5: Institute -> Role Flow - Multiple Institutes', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { user: { full_name: 'USER4' }, pre_context_token: 't4' } })
        }));
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
                data: [
                    { 
                        institute_id: 'i1', institute_name: 'Institute One', tenant_id: 't1',
                        roles: [{ role_id: 'r1', role_name: 'Admin' }] 
                    },
                    { 
                        institute_id: 'i2', institute_name: 'Institute Two', tenant_id: 't2',
                        roles: [{ role_id: 'r2', role_name: 'Student' }] 
                    }
                ]
            })
        }));

        await page.locator('#email').fill('user4@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();

        // 1. Land on Institute Selection
        await page.waitForURL('**/institute-selection');
        await expect(page.locator('h3', { hasText: 'Institute Two' })).toBeVisible();
        await page.locator('h3', { hasText: 'Institute Two' }).click();

        // 2. Land on Role Selection (since it has 1 role, it auto-skips to dashboard if logic allows, 
        // but here it goes to role selection based on the institutes.length > 1 logic in Login.tsx)
        // Wait, Login.tsx logic: if institutes.length > 1, navigate("/institute-selection")
        // SelectInstitute.tsx logic: when card clicked, navigate("/role-selection", { state: { roles: inst.roles } })
        // SelectRole.tsx logic: if roles.length === 1, it doesn't auto-skip IN SelectRole.tsx, 
        // but Login.tsx has auto-skip if institutes.length === 1.
        
        await page.waitForURL('**/role-selection');
        await expect(page.locator('text=Choose Your Role')).toBeVisible();
    });
});
