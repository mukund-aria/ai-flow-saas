/**
 * Test Seed Route (Development Only)
 *
 * POST /api/test/seed
 * Creates or finds an e2e test user and organization, logs them in,
 * and returns the session cookie for authenticated API calls.
 */

import { Router } from 'express';
import { db, organizations, users, userOrganizations, portals } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

router.post(
  '/seed',
  asyncHandler(async (req, res) => {
    const {
      orgName = 'E2E Test Org',
      orgSlug = 'e2e-test',
      userName = 'E2E Test User',
      userEmail = 'e2e@test.local',
    } = req.body || {};

    // 1. Create or find organization
    let org = await db.query.organizations.findFirst({
      where: eq(organizations.slug, orgSlug),
    });
    if (!org) {
      const [newOrg] = await db
        .insert(organizations)
        .values({ name: orgName, slug: orgSlug })
        .returning();
      org = newOrg;

      // Create default portal for the org
      await db.insert(portals).values({
        organizationId: org.id,
        name: 'Default',
        slug: 'default',
        isDefault: true,
      });
    }

    // 2. Create or find user
    let user = await db.query.users.findFirst({
      where: eq(users.email, userEmail),
    });
    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          email: userEmail,
          name: userName,
          activeOrganizationId: org.id,
        })
        .returning();
      user = newUser;
    } else if (user.activeOrganizationId !== org.id) {
      await db
        .update(users)
        .set({ activeOrganizationId: org.id })
        .where(eq(users.id, user.id));
    }

    // 3. Create membership if missing
    const membership = await db.query.userOrganizations.findFirst({
      where: and(
        eq(userOrganizations.userId, user.id),
        eq(userOrganizations.organizationId, org.id)
      ),
    });
    if (!membership) {
      await db.insert(userOrganizations).values({
        userId: user.id,
        organizationId: org.id,
        role: 'ADMIN',
      });
    }

    // 4. Log user in via Passport session
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture ?? undefined,
      activeOrganizationId: org.id,
      organizationName: org.name,
      role: 'ADMIN' as const,
      needsOnboarding: false,
    };

    await new Promise<void>((resolve, reject) => {
      req.login(authUser, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      success: true,
      data: {
        organizationId: org.id,
        userId: user.id,
      },
    });
  })
);

export default router;
