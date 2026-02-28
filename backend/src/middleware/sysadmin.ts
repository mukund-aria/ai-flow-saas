/**
 * Sysadmin Middleware
 *
 * Restricts access to platform admin routes.
 * Checks session email against SYSADMIN_EMAILS env var.
 */

import { Request, Response, NextFunction } from 'express';

const SYSADMIN_EMAILS = (process.env.SYSADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(e => e.length > 0);

export function requireSysadmin(req: Request, res: Response, next: NextFunction): void {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }

  if (SYSADMIN_EMAILS.length > 0 && !SYSADMIN_EMAILS.includes(user.email.toLowerCase())) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Sysadmin access required' },
    });
    return;
  }

  next();
}
