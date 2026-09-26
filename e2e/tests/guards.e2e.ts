import { expect, test } from '../fixtures';
import { APP_ID } from '../mocks/data';

// consentRequiredGuard blocks buyer-details and kfs until the buyer has completed the consent
// step. ConsentStateService persists approval in sessionStorage; a fresh page context has none.

test.describe('consent-required guard', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('redirects buyer-details to get-started when consent is not approved', async ({ page }) => {
    await page.goto(`/buyer/buyer-details/${APP_ID}`);

    await expect(page).toHaveURL(`/buyer/get-started/${APP_ID}`);
  });

  test('redirects kfs to get-started when consent is not approved', async ({ page }) => {
    await page.goto(`/buyer/kfs/${APP_ID}`);

    await expect(page).toHaveURL(`/buyer/get-started/${APP_ID}`);
  });
});
