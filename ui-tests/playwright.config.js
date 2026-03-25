/**
 * Playwright configuration for jupyterlab-code-loader integration tests.
 */
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120 * 1000,
  expect: {
    timeout: 30 * 1000
  },
  use: {
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'jlpm start',
    url: 'http://localhost:8888/lab',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  }
});
