/**
 * Authentication Routes
 *
 * Handles Google OAuth flow and session management.
 * Supports returnTo query param for post-auth redirect.
 */

import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';

const router = Router();

// ============================================================================
// Google OAuth Routes
// ============================================================================

/**
 * Initiate Google OAuth flow
 * GET /auth/google
 *
 * Reads optional returnTo query param and stores in session.
 */
router.get('/google', (req: Request, res: Response, next: NextFunction) => {
  // Store returnTo in session before OAuth redirect
  const returnTo = req.query.returnTo as string | undefined;
  if (returnTo && isRelativePath(returnTo)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req.session as any).returnTo = returnTo;
  }

  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })(req, res, next);
});

/**
 * Google OAuth callback
 * GET /auth/google/callback
 */
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login?error=unauthorized',
    failureMessage: true,
  }),
  (req: Request, res: Response) => {
    // Read returnTo from session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionData = req.session as any;
    const returnTo = sessionData.returnTo as string | undefined;
    // Clear it from session
    delete sessionData.returnTo;

    const redirectUrl = returnTo && isRelativePath(returnTo) ? returnTo : '/home';

    // Explicitly save session before redirect to ensure it persists
    req.session.save((err) => {
      if (err) {
        console.error('Session save error after OAuth:', err);
        return res.redirect('/login?error=session');
      }
      res.redirect(redirectUrl);
    });
  }
);

// ============================================================================
// Session Routes
// ============================================================================

/**
 * Get current authenticated user
 * GET /auth/me
 */
router.get('/me', (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    res.json({
      success: true,
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }
});

/**
 * Logout current user
 * POST /auth/logout
 */
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return next(err);
    }

    // Destroy session
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('Session destroy error:', sessionErr);
      }

      res.clearCookie('connect.sid');
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });
});

// ============================================================================
// Helpers
// ============================================================================

/**
 * Validate that a returnTo path is a relative path (prevent open redirect)
 */
function isRelativePath(path: string): boolean {
  // Must start with / and not contain protocol or double slashes
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://');
}

export default router;
