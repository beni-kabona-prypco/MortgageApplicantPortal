import { defineConfig, devices } from '@playwright/test';

// Target a deployed environment by setting E2E_BASE_URL; otherwise Playwright
// starts the app locally on E2E_PORT.
//
// Deliberately NOT 4200: reuseExistingServer would silently adopt a plain
// `pnpm start` running there (local config, no mock API). Its own port makes
// the reused server always the right one.
const E2E_PORT = 4202;
const externalBaseUrl = process.env['E2E_BASE_URL'];
const baseURL = externalBaseUrl ?? `http://localhost:${E2E_PORT}`;
const isCI = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e.ts',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [
    isCI ? ['github'] : ['list'],
    ['html', { outputFolder: './playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: 'pnpm run start:e2e',
        cwd: '..',
        url: `http://localhost:${E2E_PORT}`,
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
});
