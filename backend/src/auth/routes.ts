/**
 * Authentication Routes
 *
 * Handles Google OAuth flow and session management.
 * Supports returnTo query param and invite tokens for post-auth redirect.
 */

import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { db } from '../db/client.js';
import { organizationInvites, userOrganizations, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { generateOTP, verifyOTP } from './otp-service.js';

const router = Router();

// ============================================================================
// Google OAuth Routes
// ============================================================================

/**
 * Initiate Google OAuth flow
 * GET /auth/google
 *
 * Reads optional returnTo query param and invite token, stores in session.
 */
router.get('/google', (req: Request, res: Response, next: NextFunction) => {
  // Store returnTo in session before OAuth redirect
  const returnTo = req.query.returnTo as string | undefined;
  if (returnTo && isRelativePath(returnTo)) {
    (req.session as any).returnTo = returnTo;
  }

  // Store invite token if present
  const inviteToken = req.query.invite as string | undefined;
  if (inviteToken) {
    (req.session as any).inviteToken = inviteToken;
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
  async (req: Request, res: Response) => {
    const sessionData = req.session as any;
    const returnTo = sessionData.returnTo as string | undefined;
    const inviteToken = sessionData.inviteToken as string | undefined;

    // Clear session data
    delete sessionData.returnTo;
    delete sessionData.inviteToken;

    // Auto-accept invite if token was stored
    if (inviteToken && req.user) {
      try {
        const invite = await db.query.organizationInvites.findFirst({
          where: eq(organizationInvites.token, inviteToken),
        });

        if (invite && !invite.acceptedAt && new Date() <= invite.expiresAt) {
          // Create membership
          await db.insert(userOrganizations).values({
            userId: req.user.id,
            organizationId: invite.organizationId,
            role: invite.role,
          }).onConflictDoNothing();

          // Mark invite as accepted
          await db.update(organizationInvites)
            .set({ acceptedAt: new Date() })
            .where(eq(organizationInvites.id, invite.id));

          // Set as active org
          await db.update(users)
            .set({ activeOrganizationId: invite.organizationId })
            .where(eq(users.id, req.user.id));
        }
      } catch (err) {
        console.error('Failed to auto-accept invite:', err);
      }
    }

    // Determine redirect
    let redirectUrl = '/home';
    if (req.user?.needsOnboarding && !inviteToken) {
      redirectUrl = '/onboarding';
    } else if (!req.user?.needsOnboarding && !inviteToken) {
      // User has orgs — go to org selection screen
      redirectUrl = returnTo && isRelativePath(returnTo) ? returnTo : '/org-select';
    } else if (returnTo && isRelativePath(returnTo)) {
      redirectUrl = returnTo;
    }

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
// OTP Routes
// ============================================================================

/**
 * Send OTP code to email
 * POST /auth/otp/send
 */
router.post('/otp/send', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }

  const result = await generateOTP(email);

  if (!result.success) {
    const statusCode = 'retryAfter' in result && result.retryAfter ? 429 : 403;
    return res.status(statusCode).json(result);
  }

  res.json({ success: true });
});

/**
 * Verify OTP code and establish session
 * POST /auth/otp/verify
 */
router.post('/otp/verify', async (req: Request, res: Response) => {
  const { email, code, inviteToken } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: 'Code is required' });
  }

  const result = await verifyOTP(email, code);

  if (!result.success) {
    return res.status(401).json(result);
  }

  // Establish session via Passport's req.login
  req.login(result.user, async (err) => {
    if (err) {
      console.error('Session login error:', err);
      return res.status(500).json({ success: false, error: 'Failed to establish session' });
    }

    // Auto-accept invite if token was provided
    if (inviteToken) {
      try {
        const invite = await db.query.organizationInvites.findFirst({
          where: eq(organizationInvites.token, inviteToken),
        });

        if (invite && !invite.acceptedAt && new Date() <= invite.expiresAt) {
          await db.insert(userOrganizations).values({
            userId: result.user.id,
            organizationId: invite.organizationId,
            role: invite.role,
          }).onConflictDoNothing();

          await db.update(organizationInvites)
            .set({ acceptedAt: new Date() })
            .where(eq(organizationInvites.id, invite.id));

          await db.update(users)
            .set({ activeOrganizationId: invite.organizationId })
            .where(eq(users.id, result.user.id));
        }
      } catch (inviteErr) {
        console.error('Failed to auto-accept invite:', inviteErr);
      }
    }

    // Save session before responding
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Session save error after OTP:', saveErr);
        return res.status(500).json({ success: false, error: 'Failed to save session' });
      }

      res.json({
        success: true,
        user: result.user,
        redirectTo: result.redirectTo,
      });
    });
  });
});

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
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture,
        activeOrganizationId: req.user.activeOrganizationId,
        organizationName: req.user.organizationName,
        role: req.user.role,
        needsOnboarding: req.user.needsOnboarding,
      },
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

function isRelativePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://');
}

export default router;
