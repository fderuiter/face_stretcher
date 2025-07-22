// @ts-check
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: 'http://localhost:3000'
  },
  webServer: {
    command: 'npm run dev -- --port 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
};
module.exports = config;
