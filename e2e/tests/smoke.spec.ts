/**
 * Smoke Tests
 *
 * Quick health checks to verify the test infrastructure is working.
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Backend health check', async ({ request }) => {
    const response = await request.get('http://localhost:3002/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });

  test('Frontend loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveTitle('');
  });

  test('Coordinator portal accessible', async ({ page }) => {
    await page.goto('/home');
    // Page should load without crashing — check that body has content
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('Invalid magic link shows error', async ({ page }) => {
    await page.goto('/task/invalid-uuid-token');
    // Should show an error state, not crash
    await expect(page.locator('body')).not.toBeEmpty();
    // Wait a moment for the page to settle and check for error indicators
    await page.waitForTimeout(2000);
    const pageContent = await page.textContent('body');
    // The page should indicate something is wrong
    expect(
      pageContent?.toLowerCase().includes('not available') ||
        pageContent?.toLowerCase().includes('invalid') ||
        pageContent?.toLowerCase().includes('expired') ||
        pageContent?.toLowerCase().includes('not found') ||
        pageContent?.toLowerCase().includes('failed') ||
        pageContent?.toLowerCase().includes('error')
    ).toBeTruthy();
  });
});
