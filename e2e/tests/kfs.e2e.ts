import { expect, http, HttpResponse, test } from '../fixtures';
import {
  APP_ID,
  mockApplicationNoEKycResponse,
  mockKfsApplicationResponse,
  mockKfsReadyApplicationResponse,
} from '../mocks/data';

// KFS_POLL_INTERVAL_MS = 5_000, KFS_POLL_MAX_ATTEMPTS = 12 — controlled via page.clock.

const BUREAU_LABEL = 'I have read and understood the Bureau consent';
const TNC_LABEL = 'I have read the terms and conditions';
const ACCURACY_LABEL =
  'I here by declare that the information provided by me on this platform is true and accurate';

test.describe('kfs page', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page, worker }) => {
    // Navigate through consent so consentState.approve() is called. The state is persisted
    // to sessionStorage, so consentRequiredGuard passes even after page.goto() reloads.
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockApplicationNoEKycResponse)
      )
    );

    await page.goto(`/buyer/consent/${APP_ID}`);
    await page.locator('prypco-checkbox', { hasText: BUREAU_LABEL }).click();
    await page.locator('prypco-checkbox', { hasText: TNC_LABEL }).click();
    await page.locator('prypco-checkbox', { hasText: ACCURACY_LABEL }).click();

    await Promise.all([
      page.waitForURL(`/buyer/buyer-details/${APP_ID}`),
      page.getByRole('button', { name: /accept and continue/i }).click(),
    ]);
  });

  test('shows "Preparing document…" while polling', async ({ page, worker }) => {
    // No kfs document in the response — button stays in preparing state.
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockKfsApplicationResponse)
      )
    );

    await page.clock.install();
    await page.goto(`/buyer/kfs/${APP_ID}`);

    // Before any poll fires the button shows the preparing label.
    await expect(page.getByText(/preparing document/i)).toBeVisible();
  });

  test('enables Read KFS button when document is ready', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockKfsReadyApplicationResponse)
      )
    );

    await page.clock.install();
    await page.goto(`/buyer/kfs/${APP_ID}`);

    // Advance 1 s — fires timer(0) initial poll; response has kfs.document so polling stops.
    await page.clock.runFor(1_000);

    await expect(page.getByRole('button', { name: /read key facts statement/i })).toBeEnabled();
  });

  test('opens bottom sheet when Read KFS button is clicked', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockKfsReadyApplicationResponse)
      )
    );

    await page.clock.install();
    await page.goto(`/buyer/kfs/${APP_ID}`);
    await page.clock.runFor(1_000);

    await page.getByRole('button', { name: /read key facts statement/i }).click();

    await expect(page.getByRole('dialog', { name: 'Key Facts Statement' })).toBeVisible();
  });

  test('Confirm button is disabled until checkbox is checked', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockKfsReadyApplicationResponse)
      )
    );

    await page.clock.install();
    await page.goto(`/buyer/kfs/${APP_ID}`);
    await page.clock.runFor(1_000);

    await page.getByRole('button', { name: /read key facts statement/i }).click();
    await expect(page.getByRole('dialog', { name: 'Key Facts Statement' })).toBeVisible();

    const confirmBtn = page.getByRole('button', { name: /^confirm$/i });
    await expect(confirmBtn).toBeDisabled();

    await page.locator('prypco-checkbox', { hasText: /key facts statement/i }).click();
    await expect(confirmBtn).not.toBeDisabled();
  });

  test('Confirm navigates to verification-completed', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockKfsReadyApplicationResponse)
      )
    );

    await page.clock.install();
    await page.goto(`/buyer/kfs/${APP_ID}`);
    await page.clock.runFor(1_000);

    await page.getByRole('button', { name: /read key facts statement/i }).click();
    await page.locator('prypco-checkbox', { hasText: /key facts statement/i }).click();

    await Promise.all([
      page.waitForURL(`/buyer/verification-completed/${APP_ID}`),
      page.getByRole('button', { name: /^confirm$/i }).click(),
    ]);
  });

  test('Download PDF triggers a file download', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockKfsReadyApplicationResponse)
      )
    );

    await page.clock.install();
    await page.goto(`/buyer/kfs/${APP_ID}`);
    await page.clock.runFor(1_000);

    await page.getByRole('button', { name: /read key facts statement/i }).click();
    await expect(page.getByRole('dialog', { name: 'Key Facts Statement' })).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /download pdf/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/TestBank_KFS_\d{8}\.pdf/);
  });

  test('navigates to /not-found when the API returns an error on load', async ({
    page,
    worker,
  }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () => new HttpResponse(null, { status: 500 }))
    );

    await page.goto(`/buyer/kfs/${APP_ID}`);

    await expect(page).toHaveURL(/not-found/);
  });

  test('closing the bottom sheet resets the accepted state', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockKfsReadyApplicationResponse)
      )
    );

    await page.clock.install();
    await page.goto(`/buyer/kfs/${APP_ID}`);
    await page.clock.runFor(1_000);

    await page.getByRole('button', { name: /read key facts statement/i }).click();
    await page.locator('prypco-checkbox', { hasText: /key facts statement/i }).click();
    await expect(page.getByRole('button', { name: /^confirm$/i })).not.toBeDisabled();

    // Close the sheet — hasAccepted resets to false
    await page.getByRole('button', { name: /close/i }).click();

    // Reopen — confirm must be disabled again
    await page.getByRole('button', { name: /read key facts statement/i }).click();
    await expect(page.getByRole('button', { name: /^confirm$/i })).toBeDisabled();
  });

  test('shows timeout error after all poll attempts are exhausted', async ({ page, worker }) => {
    // Response never has a kfs document — poll runs 12 × 5 s = 60 s before timing out.
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockKfsApplicationResponse)
      )
    );

    // Register the getApplication waiter before goto so we don't miss it.
    const getAppDone = page.waitForResponse('**/Buyer/Application/**');
    await page.clock.install();
    await page.goto(`/buyer/kfs/${APP_ID}`);
    await getAppDone;

    // Step through all 12 polls one at a time. Waiting for each HTTP response
    // before the next clock advance prevents switchMap from cancelling in-flight requests.
    for (let i = 0; i < 12; i++) {
      await Promise.all([
        page.waitForResponse('**/Buyer/Application/**'),
        page.clock.runFor(i === 0 ? 1 : 5_000),
      ]);
    }

    await expect(page.getByText(/the document is not ready yet/i)).toBeVisible();
  });
});
