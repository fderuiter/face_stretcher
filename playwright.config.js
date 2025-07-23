// @ts-check
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: 'http://localhost:3010'
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run dev -- --port 3010 --strictPort',
    port: 3010,
    reuseExistingServer: !process.env.CI
  }
};
module.exports = config;
