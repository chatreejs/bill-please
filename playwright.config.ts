import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
/** Second server, started with a Turnstile site key, for turnstile.spec.ts */
const TURNSTILE_PORT = 3101;

/** Fake receipt backend. e2e/fixtures.ts mocks every request to it. */
const MOCK_MCP_URL = 'http://mcp.test';

const serverEnv = {
  // Don't open a browser tab
  BROWSER: 'none',
  // Keep test traffic out of Google Analytics
  VITE_APP_GA_MEASUREMENT_ID: '',
  VITE_APP_ENV: 'local',
  VITE_APP_BILL_PLEASE_MCP_URL: MOCK_MCP_URL,
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
    // Pin locale and timezone so numbers and dates match on every machine
    locale: 'en-US',
    timezoneId: 'Asia/Bangkok',
  },
  projects: [
    {
      name: 'mobile-chrome',
      testIgnore: /turnstile\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        baseURL: `http://localhost:${PORT}`,
      },
    },
    {
      name: 'turnstile',
      testMatch: /turnstile\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        baseURL: `http://localhost:${TURNSTILE_PORT}`,
      },
    },
  ],
  webServer: [
    {
      command: `yarn vite --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      env: { ...serverEnv, VITE_APP_TURNSTILE_SITE_KEY: '' },
    },
    {
      command: `yarn vite --port ${TURNSTILE_PORT} --strictPort`,
      url: `http://localhost:${TURNSTILE_PORT}`,
      reuseExistingServer: !process.env.CI,
      env: { ...serverEnv, VITE_APP_TURNSTILE_SITE_KEY: 'e2e-site-key' },
    },
  ],
});
