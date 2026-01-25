/**
 * Authentication Routes
 *
 * Handles Google OAuth flow and session management.
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
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

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
    // Explicitly save session before redirect to ensure it persists
    req.session.save((err) => {
      if (err) {
        console.error('Session save error after OAuth:', err);
        return res.redirect('/login?error=session');
      }
      res.redirect('/');
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

export default router;
