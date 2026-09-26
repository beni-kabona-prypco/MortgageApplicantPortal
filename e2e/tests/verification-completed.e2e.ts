import { expect, http, HttpResponse, test } from '../fixtures';
import {
  APP_ID,
  mockIneligibleApplicationResponse,
  mockTerminalApplicationResponse,
} from '../mocks/data';

test.describe('verification-completed page', () => {
  test('shows success heading for eligible status', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockTerminalApplicationResponse)
      )
    );

    await page.goto(`/buyer/verification-completed/${APP_ID}`);

    await expect(page.getByText('Verification completed successfully!')).toBeVisible();
  });

  test('shows broker name in the body text', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockTerminalApplicationResponse)
      )
    );

    await page.goto(`/buyer/verification-completed/${APP_ID}`);

    await expect(page.getByText(/Test Broker will be in touch with you now/)).toBeVisible();
  });

  test('shows ineligible heading for rejected status', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () =>
        HttpResponse.json(mockIneligibleApplicationResponse)
      )
    );

    await page.goto(`/buyer/verification-completed/${APP_ID}`);

    await expect(page.getByText('Thank you for applying!')).toBeVisible();
  });

  test('navigates to /not-found when the API returns an error', async ({ page, worker }) => {
    await worker.use(
      http.get('/Buyer/Application/:applicationId', () => new HttpResponse(null, { status: 500 }))
    );

    await page.goto(`/buyer/verification-completed/${APP_ID}`);

    await expect(page).toHaveURL(/not-found/);
  });
});
