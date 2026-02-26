/**
 * Contacts API Routes
 *
 * CRUD operations for external contacts (assignees).
 * Contacts are external users who can be assigned to workflow steps.
 */

import { Router } from 'express';
import { db, contacts, organizations } from '../db/index.js';
import { eq, desc, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// GET /api/contacts - List all contacts
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    const allContacts = await db.query.contacts.findMany({
      ...(orgId ? { where: eq(contacts.organizationId, orgId) } : {}),
      orderBy: [desc(contacts.updatedAt)],
    });

    // Transform to API response format
    const response = allContacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      type: contact.type,
      status: contact.status,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    }));

    res.json({
      success: true,
      data: response,
    });
  })
);

// ============================================================================
// GET /api/contacts/:id - Get single contact
// ============================================================================

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const contact = await db.query.contacts.findFirst({
      where: orgId
        ? and(eq(contacts.id, id), eq(contacts.organizationId, orgId))
        : eq(contacts.id, id),
    });

    if (!contact) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: contact,
    });
  })
);

// ============================================================================
// POST /api/contacts - Create new contact
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, type = 'ASSIGNEE', status = 'ACTIVE' } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name is required' },
      });
      return;
    }

    if (!email) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email is required' },
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' },
      });
      return;
    }

    // Validate type
    if (!['ADMIN', 'MEMBER', 'ASSIGNEE'].includes(type)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Type must be ADMIN, MEMBER, or ASSIGNEE' },
      });
      return;
    }

    // Validate status
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status must be ACTIVE or INACTIVE' },
      });
      return;
    }

    // Use authenticated org context (set by orgScope middleware in production)
    let orgId = req.organizationId;

    // Dev fallback: get or create a default organization
    if (!orgId) {
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

    // Check if contact with same email already exists in the organization
    const existingContact = await db.query.contacts.findFirst({
      where: and(
        eq(contacts.email, email),
        eq(contacts.organizationId, orgId)
      ),
    });

    if (existingContact) {
      res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE', message: 'A contact with this email already exists' },
      });
      return;
    }

    // Create the contact
    const [newContact] = await db
      .insert(contacts)
      .values({
        name,
        email,
        type,
        status,
        organizationId: orgId,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newContact,
    });
  })
);

// ============================================================================
// PUT /api/contacts/:id - Update contact
// ============================================================================

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { name, email, type, status } = req.body;

    // Check if contact exists (scoped to org)
    const orgId = req.organizationId;
    const existing = await db.query.contacts.findFirst({
      where: orgId
        ? and(eq(contacts.id, id), eq(contacts.organizationId, orgId))
        : eq(contacts.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' },
      });
      return;
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' },
        });
        return;
      }

      // Check if another contact with the same email exists
      const duplicateContact = await db.query.contacts.findFirst({
        where: and(
          eq(contacts.email, email),
          eq(contacts.organizationId, existing.organizationId)
        ),
      });

      if (duplicateContact && duplicateContact.id !== id) {
        res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE', message: 'A contact with this email already exists' },
        });
        return;
      }
    }

    // Validate type if provided
    if (type && !['ADMIN', 'MEMBER', 'ASSIGNEE'].includes(type)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Type must be ADMIN, MEMBER, or ASSIGNEE' },
      });
      return;
    }

    // Validate status if provided
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status must be ACTIVE or INACTIVE' },
      });
      return;
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (type !== undefined) updates.type = type;
    if (status !== undefined) updates.status = status;

    // Update the contact
    const [updatedContact] = await db
      .update(contacts)
      .set(updates)
      .where(eq(contacts.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedContact,
    });
  })
);

// ============================================================================
// DELETE /api/contacts/:id - Delete contact
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    // Check if contact exists (scoped to org)
    const existing = await db.query.contacts.findFirst({
      where: orgId
        ? and(eq(contacts.id, id), eq(contacts.organizationId, orgId))
        : eq(contacts.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' },
      });
      return;
    }

    // Hard delete the contact
    // Note: In production, you might want to soft delete by setting status to INACTIVE
    // or check if the contact is assigned to any active flow runs before deleting
    await db.delete(contacts).where(eq(contacts.id, id));

    res.json({
      success: true,
      data: { id, deleted: true },
    });
  })
);

// ============================================================================
// PATCH /api/contacts/:id/status - Toggle contact status
// ============================================================================

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { status } = req.body;

    // Validate status
    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status must be ACTIVE or INACTIVE' },
      });
      return;
    }

    // Check if contact exists (scoped to org)
    const orgId = req.organizationId;
    const existing = await db.query.contacts.findFirst({
      where: orgId
        ? and(eq(contacts.id, id), eq(contacts.organizationId, orgId))
        : eq(contacts.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' },
      });
      return;
    }

    // Update the status
    const [updatedContact] = await db
      .update(contacts)
      .set({ status, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedContact,
    });
  })
);

export default router;
