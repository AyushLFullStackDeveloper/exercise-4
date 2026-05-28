import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test-specific environment variables from frontend/.env
// This must happen BEFORE any test module is imported so that
// process.env values are available when auth.data.ts is evaluated.
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Playwright Configuration
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /* Directory containing test spec files */
  testDir: './tests/specs',

  /* Only run TypeScript spec files — no legacy JS leaks through */
  testMatch: ['**/*.spec.ts'],

  /* Maximum time one test can run before timing out */
  timeout: 30_000,

  /* Maximum time Playwright waits for expect() assertions */
  expect: {
    timeout: 5_000,
  },

  /* Run tests in each file in parallel */
  fullyParallel: true,

  /* Fail the build on CI if test.only was accidentally left in source */
  forbidOnly: !!process.env.CI,

  /* Retry on CI to handle transient flakiness */
  retries: process.env.CI ? 2 : 1,

  /* Limit parallelism on CI to avoid resource contention */
  workers: process.env.CI ? 1 : undefined,

  /* Reporters: HTML for local review, list for terminal output */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  /* Shared settings applied to all projects */
  use: {
    /**
     * Base URL for all page.goto('/') calls.
     * Loaded from PLAYWRIGHT_TEST_BASE_URL env var (set in .env).
     * Falls back to http://localhost:3000 if the variable is not set.
     */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    /* Collect full trace on first retry to diagnose failures */
    trace: 'retain-on-failure',

    /* Save video on failure for visual debugging */
    video: 'retain-on-failure',

    /* Screenshot only on failure to keep artifacts lightweight */
    screenshot: 'only-on-failure',

    /* Standard desktop viewport */
    viewport: { width: 1280, height: 720 },
  },

  /* Configure projects for cross-browser testing */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
