import { expect, http, HttpResponse, test } from '../fixtures';
import { APP_ID, mockApplicationNoEKycResponse } from '../mocks/data';

test.describe('verify-your-identity page', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('renders the page heading and Start Verification button', async ({ page }) => {
    await page.goto(`/buyer/verify-your-identity/${APP_ID}`);

    await expect(page.getByText('Verify your identity')).toBeVisible();
    await expect(page.getByRole('button', { name: /start verification/i })).toBeVisible();
  });

  test('Start Verification redirects to the eKYC URL', async ({ page }) => {
    await page.route('https://kyc.example.com/**', route =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html>KYC</html>' })
    );

    await page.goto(`/buyer/verify-your-identity/${APP_ID}`);

    await Promise.all([
      page.waitForURL(/kyc\.example\.com/),
      page.getByRole('button', { name: /start verification/i }).click(),
    ]);

    expect(page.url()).toContain('kyc.example.com/verify');
  });

  test('shows error state and disables button when eKYC URL is missing', async ({
    page,
    worker,
  }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockApplicationNoEKycResponse)
      )
    );

    await page.goto(`/buyer/verify-your-identity/${APP_ID}`);

    await expect(page.getByText('Verification link unavailable')).toBeVisible();
    await expect(page.getByRole('button', { name: /start verification/i })).toBeDisabled();
  });

  test('navigates to /not-found when the API returns an error', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () => new HttpResponse(null, { status: 500 }))
    );

    await page.goto(`/buyer/verify-your-identity/${APP_ID}`);

    await expect(page).toHaveURL(/not-found/);
  });
});
