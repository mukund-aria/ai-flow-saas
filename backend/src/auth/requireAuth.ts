/**
 * Authentication Middleware
 *
 * Protects routes that require authentication.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require authentication
 *
 * Usage:
 *   app.use('/api', requireAuth, apiRoutes);
 *   router.get('/protected', requireAuth, handler);
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    },
  });
}

/**
 * Middleware to optionally attach user info (doesn't block unauthenticated requests)
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  // User is already attached by passport if authenticated
  // This middleware just passes through
  next();
}
