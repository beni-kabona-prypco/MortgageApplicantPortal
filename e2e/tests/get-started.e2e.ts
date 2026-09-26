import { expect, http, HttpResponse, test } from '../fixtures';
import { APP_ID, mockApplicationResponse, mockTerminalApplicationResponse } from '../mocks/data';

// POLL_INTERVAL_MS = 15_000 — controlled via page.clock in polling tests.

test.describe('get-started — desktop', () => {
  test('renders QR code and broker name on load', async ({ page }) => {
    await page.clock.install();
    await page.goto(`/buyer/get-started/${APP_ID}`);
    await page.clock.runFor(1_000);

    await expect(page.locator('qrcode')).toBeVisible();
    await expect(page.getByText('Test Broker', { exact: true })).toBeVisible();
  });

  test('shows the application short ID', async ({ page }) => {
    await page.goto(`/buyer/get-started/${APP_ID}`);

    await expect(page.getByText('IM-0001')).toBeVisible();
  });

  test('polling: shows success state when status becomes terminal', async ({ page, worker }) => {
    let callCount = 0;

    await worker.use(
      http.get('/Buyer/Application/:applicationId', () => {
        callCount++;

        return callCount === 1
          ? HttpResponse.json(mockApplicationResponse)
          : HttpResponse.json(mockTerminalApplicationResponse);
      })
    );

    await page.clock.install();
    await page.goto(`/buyer/get-started/${APP_ID}`);

    // Run 1 s to fire the timer(0, ...) initial poll and let Angular settle.
    await page.clock.runFor(1_000);
    await expect(page.getByText('Test Broker', { exact: true })).toBeVisible();

    // Run past the poll interval to fire the second poll with terminal status.
    await page.clock.runFor(15_000);
    await expect(page.getByText(/verification complete/i)).toBeVisible();
  });

  test('navigates to /not-found when the API returns an error', async ({ page, worker }) => {
    await worker.use(http.get('/Buyer/Application/:applicationId', () => HttpResponse.error()));

    await page.goto(`/buyer/get-started/${APP_ID}`);

    await expect(page).toHaveURL(/not-found/);
  });
});

test.describe('get-started — mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('renders the CTA button', async ({ page }) => {
    await page.goto(`/buyer/get-started/${APP_ID}`);

    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
  });

  test('Get Started button navigates to consent when status is Pending', async ({ page }) => {
    // Default handler returns status 'Pending' with consents: null — CTA goes to consent.
    await page.goto(`/buyer/get-started/${APP_ID}`);

    await Promise.all([
      page.waitForURL(`/buyer/consent/${APP_ID}`),
      page.getByRole('button', { name: /get started/i }).click(),
    ]);
  });

  test('navigates to /not-found when the API returns an error', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () => new HttpResponse(null, { status: 500 }))
    );

    await page.goto(`/buyer/get-started/${APP_ID}`);

    await expect(page).toHaveURL(/not-found/);
  });

  test('auto-navigates to verification-completed when status is terminal', async ({
    page,
    worker,
  }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockTerminalApplicationResponse)
      )
    );

    await page.goto(`/buyer/get-started/${APP_ID}`);

    await expect(page).toHaveURL(`/buyer/verification-completed/${APP_ID}`);
  });
});
