/**
 * Organization Scope Middleware
 *
 * Reads the user's active organization and attaches it to the request.
 * Returns 403 if no active organization is set (user needs onboarding).
 */

import { Request, Response, NextFunction } from 'express';

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

  if (!user.activeOrganizationId) {
    res.status(403).json({
      success: false,
      error: {
        code: 'NO_ORGANIZATION',
        message: 'No active organization. Complete onboarding first.',
        needsOnboarding: true,
      },
    });
    return;
  }

  req.organizationId = user.activeOrganizationId;
  next();
}
