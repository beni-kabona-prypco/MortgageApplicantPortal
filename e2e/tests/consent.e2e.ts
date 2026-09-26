import { expect, http, HttpResponse, test } from '../fixtures';
import { APP_ID, mockApplicationNoEKycResponse } from '../mocks/data';

const BUREAU_LABEL = 'I have read and understood the Bureau consent';
const TNC_LABEL = 'I have read the terms and conditions';
const ACCURACY_LABEL =
  'I here by declare that the information provided by me on this platform is true and accurate';

test.describe('consent page', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/buyer/consent/${APP_ID}`);
    await expect(page.locator('app-consent-page')).toBeVisible();
  });

  test('renders the 3 consent checkboxes', async ({ page }) => {
    await expect(page.getByText(BUREAU_LABEL)).toBeVisible();
    await expect(page.getByText(TNC_LABEL)).toBeVisible();
    await expect(page.getByText(ACCURACY_LABEL)).toBeVisible();
  });

  test('accept button is disabled until all 3 checkboxes are checked', async ({ page }) => {
    const acceptBtn = page.getByRole('button', { name: /accept and continue/i });

    await expect(acceptBtn).toBeDisabled();

    // Checking only bureau — still disabled
    await page.locator('prypco-checkbox', { hasText: BUREAU_LABEL }).click();
    await expect(acceptBtn).toBeDisabled();

    // Adding T&C — still disabled
    await page.locator('prypco-checkbox', { hasText: TNC_LABEL }).click();
    await expect(acceptBtn).toBeDisabled();

    // All 3 — now enabled
    await page.locator('prypco-checkbox', { hasText: ACCURACY_LABEL }).click();
    await expect(acceptBtn).not.toBeDisabled();
  });

  test('submit redirects to the eKYC URL after all 3 checkboxes are checked', async ({ page }) => {
    // Intercept the external eKYC navigation so the test doesn't leave localhost.
    await page.route('https://kyc.example.com/**', route =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html>KYC</html>' })
    );

    await page.locator('prypco-checkbox', { hasText: BUREAU_LABEL }).click();
    await page.locator('prypco-checkbox', { hasText: TNC_LABEL }).click();
    await page.locator('prypco-checkbox', { hasText: ACCURACY_LABEL }).click();

    await Promise.all([
      page.waitForURL(/kyc\.example\.com/),
      page.getByRole('button', { name: /accept and continue/i }).click(),
    ]);

    expect(page.url()).toContain('kyc.example.com/verify');
  });

  test('submit navigates to buyer-details when the application has no eKYC URL', async ({
    page,
    worker,
  }) => {
    // Fresh fetch after consent submit returns a response without an eKYC URL.
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockApplicationNoEKycResponse)
      )
    );

    await page.locator('prypco-checkbox', { hasText: BUREAU_LABEL }).click();
    await page.locator('prypco-checkbox', { hasText: TNC_LABEL }).click();
    await page.locator('prypco-checkbox', { hasText: ACCURACY_LABEL }).click();

    await Promise.all([
      page.waitForURL(`/buyer/buyer-details/${APP_ID}`),
      page.getByRole('button', { name: /accept and continue/i }).click(),
    ]);
  });
});
