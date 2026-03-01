/**
 * Contact Groups API Routes
 *
 * CRUD operations for contact groups (reusable assignment lists).
 * Groups can contain contacts and/or users as members.
 */

import { Router } from 'express';
import { db, contactGroups, contactGroupMembers, contacts, users } from '../db/index.js';
import { eq, and, sql } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// GET /api/contact-groups - List all groups with member counts
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;

    const allGroups = await db
      .select({
        id: contactGroups.id,
        name: contactGroups.name,
        description: contactGroups.description,
        defaultCompletionMode: contactGroups.defaultCompletionMode,
        createdAt: contactGroups.createdAt,
        updatedAt: contactGroups.updatedAt,
        memberCount: sql<number>`cast(count(${contactGroupMembers.id}) as int)`,
      })
      .from(contactGroups)
      .leftJoin(contactGroupMembers, eq(contactGroupMembers.groupId, contactGroups.id))
      .where(orgId ? eq(contactGroups.organizationId, orgId) : undefined)
      .groupBy(contactGroups.id)
      .orderBy(contactGroups.name);

    res.json({
      success: true,
      data: allGroups,
    });
  })
);

// ============================================================================
// POST /api/contact-groups - Create a new group
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, description, defaultCompletionMode } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name is required' },
      });
      return;
    }

    if (defaultCompletionMode && !['ANY_ONE', 'ALL', 'MAJORITY'].includes(defaultCompletionMode)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'defaultCompletionMode must be ANY_ONE, ALL, or MAJORITY' },
      });
      return;
    }

    const orgId = req.organizationId;
    if (!orgId) {
      res.status(403).json({
        success: false,
        error: { code: 'NO_ORGANIZATION', message: 'No active organization' },
      });
      return;
    }

    const [group] = await db
      .insert(contactGroups)
      .values({
        name,
        description: description || null,
        defaultCompletionMode: defaultCompletionMode || 'ANY_ONE',
        organizationId: orgId,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: group,
    });
  })
);

// ============================================================================
// GET /api/contact-groups/:id - Group detail with members
// ============================================================================

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const group = await db.query.contactGroups.findFirst({
      where: orgId
        ? and(eq(contactGroups.id, id), eq(contactGroups.organizationId, orgId))
        : eq(contactGroups.id, id),
    });

    if (!group) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact group not found' },
      });
      return;
    }

    // Fetch members with contact/user details
    const members = await db
      .select({
        id: contactGroupMembers.id,
        contactId: contactGroupMembers.contactId,
        userId: contactGroupMembers.userId,
        createdAt: contactGroupMembers.createdAt,
        contactName: contacts.name,
        contactEmail: contacts.email,
        userName: users.name,
        userEmail: users.email,
      })
      .from(contactGroupMembers)
      .leftJoin(contacts, eq(contactGroupMembers.contactId, contacts.id))
      .leftJoin(users, eq(contactGroupMembers.userId, users.id))
      .where(eq(contactGroupMembers.groupId, id));

    const membersFormatted = members.map((m) => ({
      id: m.id,
      contactId: m.contactId,
      userId: m.userId,
      contact: m.contactId ? { id: m.contactId, name: m.contactName, email: m.contactEmail } : undefined,
      user: m.userId ? { id: m.userId, name: m.userName, email: m.userEmail } : undefined,
      createdAt: m.createdAt,
    }));

    res.json({
      success: true,
      data: {
        ...group,
        members: membersFormatted,
      },
    });
  })
);

// ============================================================================
// PUT /api/contact-groups/:id - Update group metadata
// ============================================================================

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { name, description, defaultCompletionMode } = req.body;
    const orgId = req.organizationId;

    const existing = await db.query.contactGroups.findFirst({
      where: orgId
        ? and(eq(contactGroups.id, id), eq(contactGroups.organizationId, orgId))
        : eq(contactGroups.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact group not found' },
      });
      return;
    }

    if (defaultCompletionMode && !['ANY_ONE', 'ALL', 'MAJORITY'].includes(defaultCompletionMode)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'defaultCompletionMode must be ANY_ONE, ALL, or MAJORITY' },
      });
      return;
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (defaultCompletionMode !== undefined) updates.defaultCompletionMode = defaultCompletionMode;

    const [updated] = await db
      .update(contactGroups)
      .set(updates)
      .where(eq(contactGroups.id, id))
      .returning();

    res.json({
      success: true,
      data: updated,
    });
  })
);

// ============================================================================
// DELETE /api/contact-groups/:id - Delete group and its members
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const existing = await db.query.contactGroups.findFirst({
      where: orgId
        ? and(eq(contactGroups.id, id), eq(contactGroups.organizationId, orgId))
        : eq(contactGroups.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact group not found' },
      });
      return;
    }

    // Delete all members first, then the group
    await db.delete(contactGroupMembers).where(eq(contactGroupMembers.groupId, id));
    await db.delete(contactGroups).where(eq(contactGroups.id, id));

    res.json({
      success: true,
      data: { id, deleted: true },
    });
  })
);

// ============================================================================
// POST /api/contact-groups/:id/members - Add member(s) to group
// ============================================================================

router.post(
  '/:id/members',
  asyncHandler(async (req, res) => {
    const groupId = req.params.id as string;
    const orgId = req.organizationId;

    // Verify group exists and belongs to this org
    const group = await db.query.contactGroups.findFirst({
      where: orgId
        ? and(eq(contactGroups.id, groupId), eq(contactGroups.organizationId, orgId))
        : eq(contactGroups.id, groupId),
    });

    if (!group) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact group not found' },
      });
      return;
    }

    // Support both single member and batch: { contactId?, userId? } or { members: [...] }
    const memberInputs: Array<{ contactId?: string; userId?: string }> = req.body.members
      ? req.body.members
      : [{ contactId: req.body.contactId, userId: req.body.userId }];

    if (memberInputs.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'At least one member is required' },
      });
      return;
    }

    const created = [];

    for (const input of memberInputs) {
      if (!input.contactId && !input.userId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Each member must have a contactId or userId' },
        });
        return;
      }

      // Validate contact belongs to same org
      if (input.contactId) {
        const contact = await db.query.contacts.findFirst({
          where: orgId
            ? and(eq(contacts.id, input.contactId), eq(contacts.organizationId, orgId))
            : eq(contacts.id, input.contactId),
        });
        if (!contact) {
          res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: `Contact ${input.contactId} not found in this organization` },
          });
          return;
        }
      }

      // Validate user exists
      if (input.userId) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, input.userId),
        });
        if (!user) {
          res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: `User ${input.userId} not found` },
          });
          return;
        }
      }

      const [member] = await db
        .insert(contactGroupMembers)
        .values({
          groupId,
          contactId: input.contactId || null,
          userId: input.userId || null,
        })
        .returning();

      created.push(member);
    }

    res.status(201).json({
      success: true,
      data: created.length === 1 ? created[0] : created,
    });
  })
);

// ============================================================================
// DELETE /api/contact-groups/:id/members/:memberId - Remove a member
// ============================================================================

router.delete(
  '/:id/members/:memberId',
  asyncHandler(async (req, res) => {
    const groupId = req.params.id as string;
    const memberId = req.params.memberId as string;
    const orgId = req.organizationId;

    // Verify group exists and belongs to this org
    const group = await db.query.contactGroups.findFirst({
      where: orgId
        ? and(eq(contactGroups.id, groupId), eq(contactGroups.organizationId, orgId))
        : eq(contactGroups.id, groupId),
    });

    if (!group) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact group not found' },
      });
      return;
    }

    // Verify member belongs to this group
    const member = await db.query.contactGroupMembers.findFirst({
      where: and(
        eq(contactGroupMembers.id, memberId),
        eq(contactGroupMembers.groupId, groupId)
      ),
    });

    if (!member) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found in this group' },
      });
      return;
    }

    await db.delete(contactGroupMembers).where(eq(contactGroupMembers.id, memberId));

    res.json({
      success: true,
      data: { id: memberId, deleted: true },
    });
  })
);

export default router;
