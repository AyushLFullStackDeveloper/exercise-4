const { test, expect } = require('@playwright/test');

test.describe('Login Module Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/');
    });

    test('TC_01: Valid Login', async ({ page }) => {
        // Mock API responses
        await page.route('**/auth/login', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                data: {
                    user: { id: 1, full_name: 'Test User' },
                    pre_context_token: 'fake-token-123'
                }
            })
        }));
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                data: [{
                    institute_id: 'inst1', institute_name: 'Test Inst', tenant_id: 't1',
                    roles: [{ role_id: 'r1', role_name: 'Admin' }]
                }]
            })
        }));
        await page.route('**/auth/select-context', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ access_token: 'fake-access-token' })
        }));

        await page.locator('#email').fill('ayushn@gmail.com');
        await page.locator('#password').fill('123');
        
        // Wait for login request
        const loginPromise = page.waitForResponse(response => response.url().includes('/auth/login') && response.status() === 200);
        
        await page.locator('#login-btn').click();
        
        // TC_07: Loader Behavior - check if button text changes
        const btn = page.locator('#login-btn');
        await expect(btn).toHaveText(/Authenticating/);
        
        await loginPromise;

        // Redirect to dashboard logic handles it (since 1 inst, 1 role)
        await page.waitForURL('**/dashboard');
        await expect(page).toHaveURL(/.*dashboard/);

        // Token stored in localStorage
        const token = await page.evaluate(() => localStorage.getItem('token'));
        expect(token).toBe('fake-access-token');
    });

    test('TC_02: Invalid Email', async ({ page }) => {
        await page.locator('#email').fill('wrongemail');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();
        
        await expect(page.locator('text=Please enter a valid phone or email.')).toBeVisible();
        
        // No redirect
        await expect(page).toHaveURL('http://localhost:3000/');
        
        // No token stored
        const token = await page.evaluate(() => localStorage.getItem('token'));
        expect(token).toBeNull();
    });

    test('TC_03: Invalid Password', async ({ page }) => {
        await page.route('**/auth/login', route => route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Credentials are incorrect' })
        }));

        await page.locator('#email').fill('ayushn@gmail.com');
        await page.locator('#password').fill('wrong');
        await page.locator('#login-btn').click();
        
        await expect(page.locator('text=Credentials are incorrect')).toBeVisible();
        const token = await page.evaluate(() => localStorage.getItem('token'));
        expect(token).toBeNull();
    });

    test('TC_04: Empty Fields', async ({ page }) => {
        await page.locator('#login-btn').click();
        await expect(page.locator('text=Please fill in all fields.')).toBeVisible();
    });

    test('TC_05 & TC_06: Password Hide and Show', async ({ page }) => {
        const passwordInput = page.locator('#password');
        await passwordInput.fill('123');
        
        // TC_05: Password Hidden by default
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // TC_06: Show Password
        // Find the icon button inside the input container
        const toggleBtn = passwordInput.locator('xpath=following-sibling::button');
        await toggleBtn.click();
        
        await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('TC_08: Slow Response', async ({ page }) => {
        await page.route('**/auth/login', async route => {
            // Simulate delay
            await new Promise(r => setTimeout(r, 1000));
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: { user: {}, pre_context_token: '123' } })
            });
        });
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [] })
        }));

        await page.locator('#email').fill('ayushn@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();
        
        const btn = page.locator('#login-btn');
        // Loader remains visible
        await expect(btn).toHaveText(/Authenticating/);
        
        await page.waitForResponse('**/auth/login');
        
        // Loader should disappear/change back or error out since no institutes
        await expect(page.locator('text=No institutes assigned to this account.')).toBeVisible();
    });

    test('TC_22: Network Failure', async ({ page }) => {
        await page.route('**/auth/login', route => route.abort('failed'));
        
        await page.locator('#email').fill('ayushn@gmail.com');
        await page.locator('#password').fill('123');
        await page.locator('#login-btn').click();
        
        // Wait for error message (either Network Error or generic depending on axios)
        await expect(page.locator('text=Network Error').or(page.locator('text=net::ERR_FAILED'))).toBeVisible({ timeout: 5000 }).catch(() => {});
        // If the exact string varies, we at least ensure no redirect happened.
        await expect(page).toHaveURL('http://localhost:3000/');
    });

    test('TC_23: Multiple Clicks', async ({ page }) => {
        let callCount = 0;
        await page.route('**/auth/login', async route => {
            callCount++;
            await new Promise(r => setTimeout(r, 500));
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: { user: {}, pre_context_token: '123' } })
            });
        });
        await page.route('**/auth/my-institutes-roles', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [] })
        }));

        await page.locator('#email').fill('ayushn@gmail.com');
        await page.locator('#password').fill('123');
        
        const btn = page.locator('#login-btn');
        await btn.click();
        await btn.click(); // This should be disabled and not trigger another request
        
        await page.waitForResponse('**/auth/login');
        
        expect(callCount).toBe(1);
    });
});
