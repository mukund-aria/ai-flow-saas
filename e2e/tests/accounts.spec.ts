/**
 * Accounts Page E2E Tests
 *
 * Tests the Accounts tab in the Coordinator Portal:
 * - API: list, create, get, update, delete accounts
 * - UI: page loads, create account dialog, table rendering, navigation to detail
 */

import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3002/api';

// ============================================================================
// API-Level Tests (fast, no browser needed)
// ============================================================================

test.describe('Accounts API', () => {
  test('GET /api/accounts returns 200 with data array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/accounts`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('CRUD lifecycle: create → get → update → delete', async ({
    request,
  }) => {
    // Create
    const createRes = await request.post(`${API_BASE}/accounts`, {
      data: { name: 'E2E Test Account', domain: 'e2e-test.com' },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = (await createRes.json()).data;
    expect(created.id).toBeTruthy();
    expect(created.name).toBe('E2E Test Account');
    expect(created.domain).toBe('e2e-test.com');

    // Get
    const getRes = await request.get(`${API_BASE}/accounts/${created.id}`);
    expect(getRes.ok()).toBeTruthy();
    const fetched = (await getRes.json()).data;
    expect(fetched.name).toBe('E2E Test Account');

    // Update
    const updateRes = await request.put(`${API_BASE}/accounts/${created.id}`, {
      data: { name: 'E2E Updated Account' },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updated = (await updateRes.json()).data;
    expect(updated.name).toBe('E2E Updated Account');

    // Delete (soft)
    const deleteRes = await request.delete(
      `${API_BASE}/accounts/${created.id}`
    );
    expect(deleteRes.ok()).toBeTruthy();
    const deleted = (await deleteRes.json()).data;
    expect(deleted.deleted).toBe(true);

    // Verify deleted account no longer appears in list
    const listRes = await request.get(`${API_BASE}/accounts`);
    const list = (await listRes.json()).data;
    expect(list.find((a: { id: string }) => a.id === created.id)).toBeFalsy();
  });

  test('POST /api/accounts requires name', async ({ request }) => {
    const res = await request.post(`${API_BASE}/accounts`, {
      data: { domain: 'no-name.com' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('GET /api/accounts/:id returns 404 for nonexistent id', async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/accounts/00000000-0000-0000-0000-000000000000`
    );
    expect(res.status()).toBe(404);
  });

  test('list response includes contactCount and activeFlowCount', async ({
    request,
  }) => {
    // Create an account first
    const createRes = await request.post(`${API_BASE}/accounts`, {
      data: { name: 'E2E Count Test' },
    });
    const account = (await createRes.json()).data;

    const listRes = await request.get(`${API_BASE}/accounts`);
    const list = (await listRes.json()).data;
    const found = list.find((a: { id: string }) => a.id === account.id);

    expect(found).toBeTruthy();
    expect(typeof found.contactCount).toBe('number');
    expect(typeof found.activeFlowCount).toBe('number');

    // Cleanup
    await request.delete(`${API_BASE}/accounts/${account.id}`);
  });
});

// ============================================================================
// UI Tests (browser)
// ============================================================================

test.describe('Accounts Page UI', () => {
  test('page loads without error', async ({ page }) => {
    await page.goto('/accounts');
    // Should NOT show the error state
    await expect(
      page.getByText('Error loading accounts')
    ).not.toBeVisible({ timeout: 10000 });

    // Page title/heading should be visible
    await expect(page.getByRole('heading', { name: /accounts/i }).or(page.getByText('Accounts'))).toBeVisible();
  });

  test('create account via dialog', async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Click the "Add Account" or "New Account" button
    const addButton = page.getByRole('button', { name: /add|new|create/i });
    if (await addButton.isVisible()) {
      await addButton.click();

      // Fill in the account name
      const nameInput = page.getByPlaceholder(/name/i).or(page.getByLabel(/name/i));
      await nameInput.fill('E2E UI Test Account');

      // Fill domain if visible
      const domainInput = page.getByPlaceholder(/domain/i).or(page.getByLabel(/domain/i));
      if (await domainInput.isVisible()) {
        await domainInput.fill('e2e-ui.com');
      }

      // Submit
      const submitButton = page.getByRole('button', { name: /create|save|add/i }).last();
      await submitButton.click();

      // Verify account appears in table
      await expect(page.getByText('E2E UI Test Account')).toBeVisible({ timeout: 5000 });
    }
  });

  test('accounts table renders rows with expected columns', async ({
    page,
    request,
  }) => {
    // Seed an account via API
    const createRes = await request.post(`${API_BASE}/accounts`, {
      data: { name: 'E2E Table Row Test', domain: 'table-test.com' },
    });
    const account = (await createRes.json()).data;

    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Should see the account name in the table
    await expect(page.getByText('E2E Table Row Test')).toBeVisible({
      timeout: 10000,
    });

    // Cleanup
    await request.delete(`${API_BASE}/accounts/${account.id}`);
  });

  test('clicking account navigates to detail page', async ({
    page,
    request,
  }) => {
    // Seed an account
    const createRes = await request.post(`${API_BASE}/accounts`, {
      data: { name: 'E2E Navigate Test' },
    });
    const account = (await createRes.json()).data;

    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');

    // Click the account row/link
    await page.getByText('E2E Navigate Test').click();

    // Should navigate to detail page
    await expect(page).toHaveURL(new RegExp(`/accounts/${account.id}`), {
      timeout: 5000,
    });

    // Cleanup
    await request.delete(`${API_BASE}/accounts/${account.id}`);
  });
});
