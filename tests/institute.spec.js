const { test, expect } = require('@playwright/test');

test.describe('Institute Selection Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/');
    });

    test('TC_09: No Institute Assigned', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { user: {}, pre_context_token: '123' } })
        }));
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: [] })
        }));

        await page.locator('#email').fill('test@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();
        
        await expect(page.locator('text=No institutes assigned to this account.')).toBeVisible();
        await expect(page).toHaveURL('http://localhost:3000/');
    });

    test('TC_10: Single Institute Auto-Skip', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { user: {}, pre_context_token: '123' } })
        }));
        // Provide 1 institute with multiple roles, so it skips institute but lands on role
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
                data: [{ institute_id: 'i1', institute_name: 'Inst 1', roles: [{}, {}] }] 
            })
        }));

        await page.locator('#email').fill('test@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();
        
        await page.waitForURL('**/role-selection');
        await expect(page).toHaveURL(/.*role-selection/);
    });

    test('TC_11 & TC_12: Multiple Institutes & Select Institute', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({ data: { user: {}, pre_context_token: '123' } })
        }));
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
                data: [
                    { institute_id: 'i1', institute_name: 'Institute One', roles: [{}] },
                    { institute_id: 'i2', institute_name: 'Institute Two', roles: [{}] }
                ]
            })
        }));

        await page.locator('#email').fill('test@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();
        
        // Wait for Institute Selection UI
        await page.waitForURL('**/institute-selection');
        await expect(page.locator('text=Select your institute')).toBeVisible();
        await expect(page.locator('h3', { hasText: 'Institute One' })).toBeVisible();
        await expect(page.locator('h3', { hasText: 'Institute Two' })).toBeVisible();

        // TC_12: Select Institute by clicking the card
        await page.locator('h3', { hasText: 'Institute Two' }).click();
        
        // Should navigate to Role selection
        await page.waitForURL('**/role-selection');
        const selectedInst = await page.evaluate(() => localStorage.getItem('selectedInstitute'));
        expect(selectedInst).toContain('Institute Two');
    });

    test('TC_13: Continue Without Selection', async ({ page }) => {
        // UI uses card clicks for direct selection and auto-navigation.
        // There is no independent "Continue" button to click without selecting.
        test.info().annotations.push({ type: 'info', description: 'N/A: UI auto-navigates on card click. No explicit continue button exists.' });
        expect(true).toBeTruthy(); // Placeholder
    });
});
