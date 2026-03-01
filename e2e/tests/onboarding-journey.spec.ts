/**
 * Onboarding Journey E2E Test
 *
 * Full end-to-end test: coordinator creates a flow, starts a run,
 * assignee completes tasks via magic links, flow completes.
 *
 * Steps tested:
 * 1. FORM — Client fills information (browser)
 * 2. APPROVAL — Coordinator approves (API)
 * 3. FILE_REQUEST — Client uploads document (browser)
 * 4. TODO — Coordinator completes checklist (API)
 * 5. ACKNOWLEDGEMENT — Client accepts terms (browser)
 * 6. DECISION — Client chooses package (browser)
 */

import { test, expect } from '@playwright/test';
import { CoordinatorAPI } from '../helpers/api';
import * as db from '../helpers/db';
import {
  CLIENT_ONBOARDING_FLOW,
  FORM_DATA,
  TEST_CONTACT,
} from '../fixtures/onboarding-flow';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let api: CoordinatorAPI;
let templateId: string;
let contactId: string;
let runId: string;

test.describe.serial('Client Onboarding Journey', () => {
  test.beforeAll(async () => {
    // Read cookie from auth state saved by setup project
    const authPath = path.resolve(__dirname, '../.auth/coordinator.json');
    const authState = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
    const cookies = authState.cookies || [];
    const cookieHeader = cookies
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join('; ');
    api = new CoordinatorAPI(cookieHeader);

    // Create template via API
    const templateRes = await api.createTemplate(
      `E2E Onboarding ${Date.now()}`,
      CLIENT_ONBOARDING_FLOW
    );
    templateId = templateRes.data.id;

    // Create test contact
    const contactRes = await api.createContact(
      TEST_CONTACT.name,
      TEST_CONTACT.email
    );
    contactId = contactRes.data.id;
  });

  test.afterAll(async () => {
    await db.closePool();
  });

  test('Start flow run', async () => {
    const res = await api.startFlowRun(templateId, {
      roleAssignments: { Client: contactId },
      isTest: true,
    });
    runId = res.data.id;
    expect(res.data.status).toBe('IN_PROGRESS');
  });

  test('FORM — Client fills information', async ({ page }) => {
    // Get step execution for form step
    const stepExec = await db.getStepExecutionByStepId(runId, 'step-form');
    expect(stepExec).toBeTruthy();

    // Get magic link token
    const token = await db.getMagicLinkToken(stepExec.id);
    expect(token).toBeTruthy();

    // Navigate to task via magic link
    await page.goto(`/task/${token}`);
    await page.waitForSelector('[data-testid="step-card"]', {
      timeout: 15000,
    });

    // Fill form fields
    await page
      .locator('[data-testid="field-client_name"] input')
      .fill(FORM_DATA.client_name);
    await page
      .locator('[data-testid="field-client_email"] input')
      .fill(FORM_DATA.client_email);
    await page
      .locator('[data-testid="field-company_size"] select')
      .selectOption(FORM_DATA.company_size);

    // Submit the form
    await page.click('[data-testid="form-submit"]');
    await page.waitForSelector('[data-testid="completion-dialog"]', {
      timeout: 15000,
    });
  });

  test('APPROVAL — Coordinator approves', async () => {
    await db.waitForStepStatus(runId, 'step-approval', 'IN_PROGRESS');
    const res = await api.completeStep(runId, 'step-approval', {
      decision: 'APPROVED',
    });
    expect(res.success).toBe(true);
  });

  test('FILE_REQUEST — Client uploads document', async ({ page }) => {
    await db.waitForStepStatus(runId, 'step-files', 'IN_PROGRESS');

    const stepExec = await db.getStepExecutionByStepId(runId, 'step-files');
    const token = await db.getMagicLinkToken(stepExec.id);
    expect(token).toBeTruthy();

    await page.goto(`/task/${token}`);
    await page.waitForSelector('[data-testid="step-card"]', {
      timeout: 15000,
    });

    // Upload a test file using Playwright's setInputFiles
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test file content for e2e'),
    });

    await page.click('[data-testid="file-submit"]');
    await page.waitForSelector('[data-testid="completion-dialog"]', {
      timeout: 15000,
    });
  });

  test('TODO — Coordinator completes checklist', async () => {
    await db.waitForStepStatus(runId, 'step-todo', 'IN_PROGRESS');
    const res = await api.completeStep(runId, 'step-todo', {
      completed: true,
    });
    expect(res.success).toBe(true);
  });

  test('ACKNOWLEDGEMENT — Client accepts terms', async ({ page }) => {
    await db.waitForStepStatus(runId, 'step-ack', 'IN_PROGRESS');

    const stepExec = await db.getStepExecutionByStepId(runId, 'step-ack');
    const token = await db.getMagicLinkToken(stepExec.id);
    expect(token).toBeTruthy();

    await page.goto(`/task/${token}`);
    await page.waitForSelector('[data-testid="step-card"]', {
      timeout: 15000,
    });

    await page.click('[data-testid="acknowledge-btn"]');
    await page.waitForSelector('[data-testid="completion-dialog"]', {
      timeout: 15000,
    });
  });

  test('DECISION — Client chooses package', async ({ page }) => {
    await db.waitForStepStatus(runId, 'step-decision', 'IN_PROGRESS');

    const stepExec = await db.getStepExecutionByStepId(
      runId,
      'step-decision'
    );
    const token = await db.getMagicLinkToken(stepExec.id);
    expect(token).toBeTruthy();

    await page.goto(`/task/${token}`);
    await page.waitForSelector('[data-testid="step-card"]', {
      timeout: 15000,
    });

    await page.click('[data-testid="decision-growth"]');
    await page.waitForSelector('[data-testid="completion-dialog"]', {
      timeout: 15000,
    });
  });

  test('Flow completes successfully', async () => {
    await db.waitForFlowRunStatus(runId, 'COMPLETED', 20000);

    const steps = await db.getStepExecutions(runId);
    const allCompleted = steps.every(
      (s: { status: string }) => s.status === 'COMPLETED'
    );
    expect(allCompleted).toBe(true);
  });

  test('Coordinator can view completed flow', async ({ page }) => {
    await page.goto(`/flows/${runId}`);
    // Verify the flow detail page loads with completed status
    await expect(
      page.getByText(/completed/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
