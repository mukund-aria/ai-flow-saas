/**
 * Team API Routes
 *
 * Manage team members and invitations within an organization.
 */

import { Router } from 'express';
import { db, userOrganizations, organizationInvites, users, organizations } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { sendInvitation } from '../services/email.js';

const router = Router();

// ============================================================================
// GET /api/team - List team members and pending invites
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    if (!orgId) {
      res.status(403).json({ success: false, error: { code: 'NO_ORGANIZATION' } });
      return;
    }

    // Get members
    const memberships = await db.query.userOrganizations.findMany({
      where: eq(userOrganizations.organizationId, orgId),
      with: { user: true },
    });

    const members = memberships.map(m => ({
      id: (m as any).user?.id,
      name: (m as any).user?.name,
      email: (m as any).user?.email,
      picture: (m as any).user?.picture,
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    // Get pending invites
    const invites = await db.query.organizationInvites.findMany({
      where: and(
        eq(organizationInvites.organizationId, orgId),
        // Not accepted
      ),
      with: { invitedBy: true },
    });

    const pendingInvites = invites
      .filter(i => !i.acceptedAt)
      .map(i => ({
        id: i.id,
        email: i.email,
        role: i.role,
        invitedBy: (i as any).invitedBy?.name,
        createdAt: i.createdAt,
        expiresAt: i.expiresAt,
      }));

    res.json({
      success: true,
      data: { members, pendingInvites },
    });
  })
);

// ============================================================================
// POST /api/team - Send invitation
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    const orgId = req.organizationId;
    if (!orgId) {
      res.status(403).json({ success: false, error: { code: 'NO_ORGANIZATION' } });
      return;
    }

    // Check admin role
    const membership = await db.query.userOrganizations.findFirst({
      where: and(
        eq(userOrganizations.userId, user.id),
        eq(userOrganizations.organizationId, orgId)
      ),
    });

    if (membership?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can invite members' },
      });
      return;
    }

    const { email, role = 'MEMBER' } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email is required' },
      });
      return;
    }

    // Check if already a member
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      const existingMembership = await db.query.userOrganizations.findFirst({
        where: and(
          eq(userOrganizations.userId, existingUser.id),
          eq(userOrganizations.organizationId, orgId)
        ),
      });

      if (existingMembership) {
        res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE', message: 'User is already a member' },
        });
        return;
      }
    }

    // Create invite with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [invite] = await db.insert(organizationInvites).values({
      organizationId: orgId,
      email: email.toLowerCase(),
      role: role as 'ADMIN' | 'MEMBER',
      invitedById: user.id,
      expiresAt,
    }).returning();

    // Send invitation email
    const org = await db.query.organizations.findFirst({ where: eq(organizations.id, orgId) });
    await sendInvitation({
      to: email.toLowerCase(),
      inviterName: user.name,
      organizationName: org?.name || 'AI Flow',
      token: invite.token,
      role,
    });

    res.status(201).json({
      success: true,
      data: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        token: invite.token,
        expiresAt: invite.expiresAt,
      },
    });
  })
);

// ============================================================================
// DELETE /api/team/invite/:id - Revoke an invitation
// ============================================================================

router.delete(
  '/invite/:id',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    if (!orgId) {
      res.status(403).json({ success: false, error: { code: 'NO_ORGANIZATION' } });
      return;
    }

    const inviteId = req.params.id as string;

    const invite = await db.query.organizationInvites.findFirst({
      where: and(
        eq(organizationInvites.id, inviteId),
        eq(organizationInvites.organizationId, orgId)
      ),
    });

    if (!invite) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invitation not found' },
      });
      return;
    }

    await db.delete(organizationInvites).where(eq(organizationInvites.id, inviteId));

    res.json({ success: true, data: { id: inviteId, deleted: true } });
  })
);

// ============================================================================
// GET /api/team/accept-invite - Preview invite (no auth required)
// ============================================================================

router.get(
  '/accept-invite',
  asyncHandler(async (req, res) => {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Token is required' },
      });
      return;
    }

    const invite = await db.query.organizationInvites.findFirst({
      where: eq(organizationInvites.token, token),
      with: { organization: true, invitedBy: true },
    });

    if (!invite) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invitation not found or expired' },
      });
      return;
    }

    if (invite.acceptedAt) {
      res.status(400).json({
        success: false,
        error: { code: 'ALREADY_ACCEPTED', message: 'Invitation has already been accepted' },
      });
      return;
    }

    if (new Date() > invite.expiresAt) {
      res.status(400).json({
        success: false,
        error: { code: 'EXPIRED', message: 'Invitation has expired' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        email: invite.email,
        role: invite.role,
        organizationName: (invite as any).organization?.name,
        invitedBy: (invite as any).invitedBy?.name,
      },
    });
  })
);

// ============================================================================
// POST /api/team/accept-invite - Accept invitation (requires auth)
// ============================================================================

router.post(
  '/accept-invite',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const { token } = req.body;

    const invite = await db.query.organizationInvites.findFirst({
      where: eq(organizationInvites.token, token),
    });

    if (!invite || invite.acceptedAt || new Date() > invite.expiresAt) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INVITE', message: 'Invitation is invalid, expired, or already accepted' },
      });
      return;
    }

    // Create membership
    await db.insert(userOrganizations).values({
      userId: user.id,
      organizationId: invite.organizationId,
      role: invite.role,
    });

    // Mark invite as accepted
    await db.update(organizationInvites)
      .set({ acceptedAt: new Date() })
      .where(eq(organizationInvites.id, invite.id));

    // Set as active org if user doesn't have one
    if (!user.activeOrganizationId) {
      await db.update(users)
        .set({ activeOrganizationId: invite.organizationId })
        .where(eq(users.id, user.id));
    }

    res.json({
      success: true,
      data: {
        organizationId: invite.organizationId,
        role: invite.role,
      },
    });
  })
);

export default router;
