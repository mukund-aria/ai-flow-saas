/**
 * Organization Scope Middleware
 *
 * Reads the user's active organization and attaches it to the request.
 * If activeOrganizationId is missing but the user has memberships,
 * auto-resolves to their first org (and persists it).
 * Returns 403 only if user truly has no organization memberships.
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db/client.js';
import { users, userOrganizations } from '../db/schema.js';
import { eq } from 'drizzle-orm';

declare global {
  namespace Express {
    interface Request {
      organizationId?: string;
    }
  }
}

export function orgScope(req: Request, res: Response, next: NextFunction): void {
  const user = req.user as any;

  if (!user) {
    return next(); // Let requireAuth handle unauthenticated requests
  }

  if (user.activeOrganizationId) {
    req.organizationId = user.activeOrganizationId;
    return next();
  }

  // activeOrganizationId is missing — try to auto-resolve from memberships
  resolveOrg(user)
    .then((orgId) => {
      if (orgId) {
        req.organizationId = orgId;
        user.activeOrganizationId = orgId;
        return next();
      }

      res.status(403).json({
        success: false,
        error: {
          code: 'NO_ORGANIZATION',
          message: 'No active organization. Complete onboarding first.',
          needsOnboarding: true,
        },
      });
    })
    .catch((err) => {
      console.error('orgScope: failed to resolve organization:', err);
      return next();
    });
}

async function resolveOrg(user: any): Promise<string | null> {
  const memberships = await db.query.userOrganizations.findMany({
    where: eq(userOrganizations.userId, user.id),
  });

  if (memberships.length === 0) {
    return null;
  }

  const orgId = memberships[0].organizationId;

  // Persist so future requests don't need this lookup
  await db.update(users)
    .set({ activeOrganizationId: orgId })
    .where(eq(users.id, user.id));

  return orgId;
}
