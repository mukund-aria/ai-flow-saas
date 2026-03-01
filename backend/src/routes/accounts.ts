/**
 * Accounts API Routes
 *
 * CRUD operations for accounts (companies, clients, vendors).
 * Accounts group contacts and can be associated with flow runs.
 */

import { Router } from 'express';
import { db, accounts, contacts, flowAccounts, flows, templates } from '../db/index.js';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// GET /api/accounts - List all accounts with contact count and active flow count
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;

    const conditions = [isNull(accounts.deletedAt)];
    if (orgId) conditions.push(eq(accounts.organizationId, orgId));

    // Fetch accounts first (simple query, no subqueries that depend on other tables)
    const allAccounts = await db
      .select()
      .from(accounts)
      .where(and(...conditions))
      .orderBy(accounts.name);

    // Then enrich with counts via separate queries (more resilient)
    const enriched = await Promise.all(
      allAccounts.map(async (account) => {
        let contactCount = 0;
        let activeFlowCount = 0;
        try {
          const [cc] = await db
            .select({ count: sql<number>`count(*)` })
            .from(contacts)
            .where(eq(contacts.accountId, account.id));
          contactCount = Number(cc?.count || 0);
        } catch { /* contacts table may not have accountId yet */ }
        try {
          const [fc] = await db
            .select({ count: sql<number>`count(*)` })
            .from(flowAccounts)
            .innerJoin(flows, eq(flowAccounts.flowId, flows.id))
            .where(and(eq(flowAccounts.accountId, account.id), eq(flows.status, 'IN_PROGRESS')));
          activeFlowCount = Number(fc?.count || 0);
        } catch { /* flowAccounts may not exist yet */ }
        return { ...account, contactCount, activeFlowCount };
      })
    );

    res.json({
      success: true,
      data: enriched,
    });
  })
);

// ============================================================================
// POST /api/accounts - Create a new account
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, domain } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name is required' },
      });
      return;
    }

    let orgId = req.organizationId;

    if (!orgId) {
      const { organizations } = await import('../db/index.js');
      let defaultOrg = await db.query.organizations.findFirst();
      if (!defaultOrg) {
        const [newOrg] = await db
          .insert(organizations)
          .values({ name: 'Default Organization', slug: 'default' })
          .returning();
        defaultOrg = newOrg;
      }
      orgId = defaultOrg.id;
    }

    const [newAccount] = await db
      .insert(accounts)
      .values({
        name,
        domain: domain || null,
        organizationId: orgId,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newAccount,
    });
  })
);

// ============================================================================
// GET /api/accounts/:id - Get account detail
// ============================================================================

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const conditions = [eq(accounts.id, id), isNull(accounts.deletedAt)];
    if (orgId) conditions.push(eq(accounts.organizationId, orgId));

    const account = await db.query.accounts.findFirst({
      where: and(...conditions),
    });

    if (!account) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: account,
    });
  })
);

// ============================================================================
// PUT /api/accounts/:id - Update account
// ============================================================================

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { name, domain } = req.body;
    const orgId = req.organizationId;

    const conditions = [eq(accounts.id, id), isNull(accounts.deletedAt)];
    if (orgId) conditions.push(eq(accounts.organizationId, orgId));

    const existing = await db.query.accounts.findFirst({
      where: and(...conditions),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' },
      });
      return;
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (name !== undefined) updates.name = name;
    if (domain !== undefined) updates.domain = domain;

    const [updatedAccount] = await db
      .update(accounts)
      .set(updates)
      .where(eq(accounts.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedAccount,
    });
  })
);

// ============================================================================
// DELETE /api/accounts/:id - Soft delete account
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const conditions = [eq(accounts.id, id), isNull(accounts.deletedAt)];
    if (orgId) conditions.push(eq(accounts.organizationId, orgId));

    const existing = await db.query.accounts.findFirst({
      where: and(...conditions),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' },
      });
      return;
    }

    await db
      .update(accounts)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(accounts.id, id));

    res.json({
      success: true,
      data: { id, deleted: true },
    });
  })
);

// ============================================================================
// GET /api/accounts/:id/contacts - List contacts for this account
// ============================================================================

router.get(
  '/:id/contacts',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    // Verify account exists and belongs to org
    const conditions = [eq(accounts.id, id), isNull(accounts.deletedAt)];
    if (orgId) conditions.push(eq(accounts.organizationId, orgId));

    const account = await db.query.accounts.findFirst({
      where: and(...conditions),
    });

    if (!account) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' },
      });
      return;
    }

    const accountContacts = await db.query.contacts.findMany({
      where: eq(contacts.accountId, id),
    });

    res.json({
      success: true,
      data: accountContacts,
    });
  })
);

// ============================================================================
// GET /api/accounts/:id/flows - List flow runs associated with this account
// ============================================================================

router.get(
  '/:id/flows',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    // Verify account exists and belongs to org
    const conditions = [eq(accounts.id, id), isNull(accounts.deletedAt)];
    if (orgId) conditions.push(eq(accounts.organizationId, orgId));

    const account = await db.query.accounts.findFirst({
      where: and(...conditions),
    });

    if (!account) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Account not found' },
      });
      return;
    }

    // Get flow run associations via flowAccounts junction table
    const associations = await db
      .select({
        flowId: flowAccounts.flowId,
        source: flowAccounts.source,
        associatedAt: flowAccounts.createdAt,
        runName: flows.name,
        runStatus: flows.status,
        runStartedAt: flows.startedAt,
        templateId: flows.templateId,
        templateName: templates.name,
      })
      .from(flowAccounts)
      .innerJoin(flows, eq(flowAccounts.flowId, flows.id))
      .innerJoin(templates, eq(flows.templateId, templates.id))
      .where(eq(flowAccounts.accountId, id));

    res.json({
      success: true,
      data: associations,
    });
  })
);

export default router;
