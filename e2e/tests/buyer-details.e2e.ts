import { expect, http, HttpResponse, test } from '../fixtures';
import {
  APP_ID,
  mockApplicationNoEKycResponse,
  mockFullApplicationNoEKycResponse,
  mockFullApplicationResponse,
} from '../mocks/data';

const BUREAU_LABEL = 'I have read and understood the Bureau consent';
const TNC_LABEL = 'I have read the terms and conditions';
const ACCURACY_LABEL =
  'I here by declare that the information provided by me on this platform is true and accurate';

test.describe('buyer-details page', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page, worker }) => {
    // Use no-eKyc response so consent submit navigates within the SPA to buyer-details
    // (rather than redirecting to an external eKyc URL), which calls consentState.approve().
    // ConsentStateService persists to sessionStorage, so the approval survives page reloads.
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

  test('renders the About you section after data loads', async ({ page }) => {
    await expect(page.getByText('About you')).toBeVisible();
  });

  test('submit button is disabled when required fields are missing', async ({ page }) => {
    await expect(page.getByText('About you')).toBeVisible();
    await expect(page.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  test('submit button is enabled when all required fields are pre-filled', async ({
    page,
    worker,
  }) => {
    // Full data + no eKyc URL: reload buyer-details (consent state persists in sessionStorage)
    // so the page fetches fresh data with all required fields filled.
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockFullApplicationNoEKycResponse)
      )
    );

    await page.goto(`/buyer/buyer-details/${APP_ID}`);
    await expect(page.getByText('About you')).toBeVisible();

    await expect(page.getByRole('button', { name: /submit/i })).not.toBeDisabled();
  });

  test('submit navigates to eKYC URL on success', async ({ page, worker }) => {
    // Reload buyer-details with full data that includes an eKyc URL. After PUT + validate,
    // the component reads appData().links.eKyc.redirectUrl and navigates externally.
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockFullApplicationResponse)
      )
    );

    await page.route('https://kyc.example.com/**', route =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html>KYC</html>' })
    );

    await page.goto(`/buyer/buyer-details/${APP_ID}`);
    await expect(page.getByText('About you')).toBeVisible();

    await Promise.all([
      page.waitForURL(/kyc\.example\.com/),
      page.getByRole('button', { name: /submit/i }).click(),
    ]);

    expect(page.url()).toContain('kyc.example.com/verify');
  });

  test('Back button navigates to get-started', async ({ page }) => {
    await expect(page.getByText('About you')).toBeVisible();

    await Promise.all([
      page.waitForURL(`/buyer/get-started/${APP_ID}`),
      page.getByRole('button', { name: /back/i }).click(),
    ]);
  });

  test('navigates to /not-found when the API returns an error on load', async ({
    page,
    worker,
  }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () => new HttpResponse(null, { status: 500 }))
    );

    await page.goto(`/buyer/buyer-details/${APP_ID}`);

    await expect(page).toHaveURL(/not-found/);
  });

  test('submit failure re-enables the submit button', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockFullApplicationResponse)
      ),
      http.put('/Buyer/Application/', () => new HttpResponse(null, { status: 500 }))
    );

    await page.goto(`/buyer/buyer-details/${APP_ID}`);
    await expect(page.getByText('About you')).toBeVisible();

    const submitBtn = page.getByRole('button', { name: /submit/i });
    await expect(submitBtn).not.toBeDisabled();
    await submitBtn.click();
    await expect(submitBtn).not.toBeDisabled();
  });
});
