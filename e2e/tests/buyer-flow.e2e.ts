import { expect, http, HttpResponse, test } from '../fixtures';
import {
  APP_ID,
  mockApplicationNoEKycResponse,
  mockFullApplicationResponse,
  mockKfsReadyApplicationResponse,
  mockTerminalApplicationResponse,
} from '../mocks/data';

const BUREAU_LABEL = 'I have read and understood the Bureau consent';
const TNC_LABEL = 'I have read the terms and conditions';
const ACCURACY_LABEL =
  'I here by declare that the information provided by me on this platform is true and accurate';

test.describe('buyer flow — end-to-end funnel', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('consent → buyer-details → kfs → verification-completed', async ({ page, worker }) => {
    // ── 1. Consent ────────────────────────────────────────────────────────────
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

    // ── 2. Buyer details ──────────────────────────────────────────────────────
    // Full pre-filled data + eKyc URL so the form is ready and submit navigates externally.
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockFullApplicationResponse)
      )
    );
    await page.route('https://kyc.example.com/**', route =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html>KYC</html>' })
    );

    await page.goto(`/buyer/buyer-details/${APP_ID}`);
    await expect(page.getByRole('button', { name: /submit/i })).not.toBeDisabled();
    await Promise.all([
      page.waitForURL(/kyc\.example\.com/),
      page.getByRole('button', { name: /submit/i }).click(),
    ]);

    // ── 3. KFS (simulating user return from eKyc) ─────────────────────────────
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockKfsReadyApplicationResponse)
      )
    );

    // No fake clock needed here — real timer(0) fires immediately, poll resolves
    // with the ready document, and the button becomes enabled within milliseconds.
    await page.goto(`/buyer/kfs/${APP_ID}`);
    await expect(page.getByRole('button', { name: /read key facts statement/i })).toBeEnabled();

    await page.getByRole('button', { name: /read key facts statement/i }).click();
    await expect(page.getByRole('dialog', { name: 'Key Facts Statement' })).toBeVisible();
    await page.locator('prypco-checkbox', { hasText: /key facts statement/i }).click();

    // ── 4. Verification completed ─────────────────────────────────────────────
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockTerminalApplicationResponse)
      )
    );
    await Promise.all([
      page.waitForURL(`/buyer/verification-completed/${APP_ID}`),
      page.getByRole('button', { name: /^confirm$/i }).click(),
    ]);

    await expect(page.getByText('Verification completed successfully!')).toBeVisible();
  });
});
