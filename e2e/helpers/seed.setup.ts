/**
 * Playwright Setup — Test Seed
 *
 * Calls the backend test seed endpoint to create a test user/org,
 * captures the session cookie, and saves it as storageState for
 * authenticated browser tests.
 */

import { test as setup, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:3002';

setup('seed test user and capture session', async ({ request }) => {
  const response = await request.post(`${BACKEND_URL}/api/test/seed`, {
    data: {
      orgName: 'E2E Test Org',
      orgSlug: 'e2e-test',
      userName: 'E2E Test User',
      userEmail: 'e2e@test.local',
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.success).toBe(true);
  expect(body.data.organizationId).toBeTruthy();
  expect(body.data.userId).toBeTruthy();

  // Save session cookies as storageState for browser tests
  await request.storageState({ path: '.auth/coordinator.json' });
});
