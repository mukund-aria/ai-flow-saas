/**
 * Authentication Routes
 *
 * Handles Google OAuth flow and session management.
 * Supports returnTo query param and invite tokens for post-auth redirect.
 */

import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { db } from '../db/client.js';
import { organizationInvites, userOrganizations, users, ssoConfigs } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { generateOTP, verifyOTP } from './otp-service.js';
import {
  findSsoConfigByEmail, isSsoEnforced, buildSamlInstance,
  extractUserAttributes, validateAndRecordAssertion,
  provisionCoordinatorFromSaml, provisionAssigneeFromSaml,
  generateSpMetadata,
} from './saml-service.js';
import type { AuthUser } from './passport.js';

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

  // Check if SSO is enforced for this email
  if (await isSsoEnforced(email, 'COORDINATOR')) {
    return res.status(403).json({
      success: false,
      ssoRequired: true,
      error: 'SSO login is required for this email domain',
    });
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
        authMethod: req.user.authMethod,
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
// SSO Check Routes
// ============================================================================

/**
 * Check if SSO is available/required for an email
 * POST /auth/sso/check
 */
router.post('/sso/check', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }

  const config = await findSsoConfigByEmail(email, 'COORDINATOR');
  if (!config) {
    return res.json({ ssoRequired: false, ssoAvailable: false });
  }

  res.json({
    ssoRequired: config.enforced,
    ssoAvailable: true,
    redirectUrl: `/auth/sso/login?email=${encodeURIComponent(email)}`,
  });
});

/**
 * SP-initiated SAML login redirect
 * GET /auth/sso/login?email=...&returnTo=...
 */
router.get('/sso/login', async (req: Request, res: Response) => {
  const email = req.query.email as string;
  const returnTo = req.query.returnTo as string | undefined;

  if (!email) {
    return res.redirect('/login?error=sso_email_required');
  }

  const config = await findSsoConfigByEmail(email, 'COORDINATOR');
  if (!config) {
    return res.redirect('/login?error=sso_not_configured');
  }

  // Store SSO state in session
  (req.session as any).ssoConfigId = config.id;
  (req.session as any).ssoReturnTo = returnTo;

  const saml = buildSamlInstance(config);

  try {
    const loginUrl = await saml.getAuthorizeUrlAsync('', req.headers.host || '', {});
    req.session.save((err) => {
      if (err) console.error('Session save error before SAML redirect:', err);
      res.redirect(loginUrl);
    });
  } catch (err) {
    console.error('SAML redirect error:', err);
    res.redirect('/login?error=sso_redirect_failed');
  }
});

/**
 * SAML ACS callback (coordinator)
 * POST /auth/sso/callback
 */
router.post('/sso/callback', async (req: Request, res: Response) => {
  const configId = (req.session as any).ssoConfigId;
  const returnTo = (req.session as any).ssoReturnTo;

  // Clean up session state
  delete (req.session as any).ssoConfigId;
  delete (req.session as any).ssoReturnTo;

  if (!configId) {
    return res.redirect('/login?error=sso_state_lost');
  }

  const config = await db.query.ssoConfigs.findFirst({
    where: eq(ssoConfigs.id, configId),
  });

  if (!config) {
    return res.redirect('/login?error=sso_config_not_found');
  }

  const saml = buildSamlInstance(config);

  try {
    const { profile } = await saml.validatePostResponseAsync(req.body);
    if (!profile) {
      return res.redirect('/login?error=sso_no_profile');
    }

    // Replay prevention
    const assertionId = (profile as any).sessionIndex || (profile as any).ID;
    const notOnOrAfter = (profile as any).conditions?.NotOnOrAfter
      ? new Date((profile as any).conditions.NotOnOrAfter)
      : new Date(Date.now() + 3600 * 1000);

    if (assertionId) {
      const replayCheck = await validateAndRecordAssertion(assertionId, config.id, notOnOrAfter);
      if (!replayCheck.valid) {
        return res.redirect('/login?error=sso_replay');
      }
    }

    // Extract attributes and provision user
    const attributes = extractUserAttributes(profile as Record<string, any>, config.attributeMapping);
    if (!attributes.email) {
      return res.redirect('/login?error=sso_no_email');
    }

    const { user: dbUser } = await provisionCoordinatorFromSaml(attributes, config.organizationId);

    // Build auth user
    const memberships = await db.query.userOrganizations.findMany({
      where: eq(userOrganizations.userId, dbUser.id),
      with: { organization: true },
    });

    const activeMembership = memberships.find(m => m.organizationId === config.organizationId);
    const authUser: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      picture: dbUser.picture || undefined,
      activeOrganizationId: config.organizationId,
      organizationName: (activeMembership as any)?.organization?.name || null,
      role: activeMembership?.role || null,
      needsOnboarding: memberships.length === 0,
      authMethod: 'saml',
    };

    // Establish session
    req.login(authUser, (err) => {
      if (err) {
        console.error('SAML session login error:', err);
        return res.redirect('/login?error=sso_session_failed');
      }

      // Apply SSO session TTL
      if (config.sessionMaxAgeMinutes) {
        req.session.cookie.maxAge = config.sessionMaxAgeMinutes * 60 * 1000;
      }

      req.session.save((saveErr) => {
        if (saveErr) console.error('Session save error after SAML:', saveErr);
        const redirectUrl = returnTo && isRelativePath(returnTo) ? returnTo : '/home';
        res.redirect(redirectUrl);
      });
    });
  } catch (err) {
    console.error('SAML callback error:', err);
    res.redirect('/login?error=sso_validation_failed');
  }
});

/**
 * SP metadata endpoint
 * GET /auth/sso/metadata/:configId
 */
router.get('/sso/metadata/:configId', async (req: Request, res: Response) => {
  const config = await db.query.ssoConfigs.findFirst({
    where: eq(ssoConfigs.id, req.params.configId as string),
  });

  if (!config) {
    return res.status(404).json({ error: 'Config not found' });
  }

  const xml = generateSpMetadata(config);
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// ============================================================================
// Portal SSO Routes (Assignee)
// ============================================================================

/**
 * Check if portal SSO is available/required
 * POST /auth/portal-sso/check
 */
router.post('/portal-sso/check', async (req: Request, res: Response) => {
  const { email, portalSlug } = req.body;

  if (!email || !portalSlug) {
    return res.status(400).json({ success: false, error: 'email and portalSlug are required' });
  }

  // Find portal
  const { portals } = await import('../db/schema.js');
  const portal = await db.query.portals.findFirst({
    where: eq(portals.slug, portalSlug),
  });

  if (!portal) {
    return res.json({ ssoRequired: false, ssoAvailable: false });
  }

  const config = await findSsoConfigByEmail(email, 'ASSIGNEE', portal.id);
  if (!config) {
    return res.json({ ssoRequired: false, ssoAvailable: false });
  }

  res.json({
    ssoRequired: config.enforced,
    ssoAvailable: true,
    redirectUrl: `/auth/portal-sso/login?portalSlug=${encodeURIComponent(portalSlug)}&email=${encodeURIComponent(email)}`,
  });
});

/**
 * Assignee SAML login redirect
 * GET /auth/portal-sso/login?portalSlug=...&email=...
 */
router.get('/portal-sso/login', async (req: Request, res: Response) => {
  const portalSlug = req.query.portalSlug as string;
  const email = req.query.email as string;

  if (!portalSlug) {
    return res.redirect('/?error=sso_portal_required');
  }

  const { portals } = await import('../db/schema.js');
  const portal = await db.query.portals.findFirst({
    where: eq(portals.slug, portalSlug),
  });

  if (!portal) {
    return res.redirect('/?error=sso_portal_not_found');
  }

  const config = email
    ? await findSsoConfigByEmail(email, 'ASSIGNEE', portal.id)
    : await db.query.ssoConfigs.findFirst({
        where: and(
          eq(ssoConfigs.organizationId, portal.organizationId),
          eq(ssoConfigs.target, 'ASSIGNEE'),
          eq(ssoConfigs.enabled, true)
        ),
      });

  if (!config) {
    return res.redirect(`/portal/${portalSlug}/login?error=sso_not_configured`);
  }

  // Store SSO state
  (req.session as any).portalSsoConfigId = config.id;
  (req.session as any).portalSsoSlug = portalSlug;
  (req.session as any).portalSsoPortalId = portal.id;

  const saml = buildSamlInstance(config);

  try {
    const loginUrl = await saml.getAuthorizeUrlAsync('', req.headers.host || '', {});
    req.session.save((err) => {
      if (err) console.error('Session save error before portal SAML redirect:', err);
      res.redirect(loginUrl);
    });
  } catch (err) {
    console.error('Portal SAML redirect error:', err);
    res.redirect(`/portal/${portalSlug}/login?error=sso_redirect_failed`);
  }
});

/**
 * Assignee SAML ACS callback
 * POST /auth/portal-sso/callback
 */
router.post('/portal-sso/callback', async (req: Request, res: Response) => {
  const configId = (req.session as any).portalSsoConfigId;
  const portalSlug = (req.session as any).portalSsoSlug;
  const portalId = (req.session as any).portalSsoPortalId;

  // Clean up
  delete (req.session as any).portalSsoConfigId;
  delete (req.session as any).portalSsoSlug;
  delete (req.session as any).portalSsoPortalId;

  if (!configId || !portalSlug || !portalId) {
    return res.redirect('/?error=sso_state_lost');
  }

  const config = await db.query.ssoConfigs.findFirst({
    where: eq(ssoConfigs.id, configId),
  });

  if (!config) {
    return res.redirect(`/portal/${portalSlug}/login?error=sso_config_not_found`);
  }

  const saml = buildSamlInstance(config);

  try {
    const { profile } = await saml.validatePostResponseAsync(req.body);
    if (!profile) {
      return res.redirect(`/portal/${portalSlug}/login?error=sso_no_profile`);
    }

    // Replay prevention
    const assertionId = (profile as any).sessionIndex || (profile as any).ID;
    const notOnOrAfter = (profile as any).conditions?.NotOnOrAfter
      ? new Date((profile as any).conditions.NotOnOrAfter)
      : new Date(Date.now() + 3600 * 1000);

    if (assertionId) {
      const replayCheck = await validateAndRecordAssertion(assertionId, config.id, notOnOrAfter);
      if (!replayCheck.valid) {
        return res.redirect(`/portal/${portalSlug}/login?error=sso_replay`);
      }
    }

    // Extract attributes and provision contact
    const attributes = extractUserAttributes(profile as Record<string, any>, config.attributeMapping);
    if (!attributes.email) {
      return res.redirect(`/portal/${portalSlug}/login?error=sso_no_email`);
    }

    const { token } = await provisionAssigneeFromSaml(attributes, config.organizationId, portalId);

    // Redirect to portal with token
    req.session.save((err) => {
      if (err) console.error('Session save error after portal SAML:', err);
      res.redirect(`/portal/${portalSlug}?ssoToken=${token}`);
    });
  } catch (err) {
    console.error('Portal SAML callback error:', err);
    res.redirect(`/portal/${portalSlug}/login?error=sso_validation_failed`);
  }
});

// ============================================================================
// Helpers
// ============================================================================

function isRelativePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://');
}

export default router;
