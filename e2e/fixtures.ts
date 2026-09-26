import { expect, test as base } from '@playwright/test';
import { http, HttpResponse } from 'msw';
import { createWorkerFixture, type MockServiceWorker } from 'playwright-msw';

import { handlers } from './mocks/handlers';

// Base test fixture with MSW wired to page.route().
// Use `worker.use(...)` inside a test to override specific handlers.
const test = base.extend<{ worker: MockServiceWorker }>({
  worker: createWorkerFixture(handlers),
});

export { expect, http, HttpResponse, test };
