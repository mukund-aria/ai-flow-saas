/**
 * Passport.js Configuration for Google OAuth 2.0
 *
 * Handles authentication via Google, syncs users to DB,
 * and manages organization memberships.
 */

import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { db } from '../db/client.js';
import { users, userOrganizations } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// ============================================================================
// Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  activeOrganizationId?: string | null;
  organizationName?: string | null;
  role?: string | null;
  needsOnboarding?: boolean;
}

// Extend Express Request to include our user type
declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

// ============================================================================
// Configuration
// ============================================================================

// Email/domain whitelist from environment (comma-separated)
// Supports full emails (user@example.com) or domains (@example.com)
const ALLOWED_LIST = (process.env.ALLOWED_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(e => e.length > 0);

const ALLOWED_DOMAINS = ALLOWED_LIST.filter(e => e.startsWith('@')).map(e => e.slice(1));
const ALLOWED_EMAILS = ALLOWED_LIST.filter(e => !e.startsWith('@'));

// ============================================================================
// Google OAuth Strategy
// ============================================================================

export function configurePassport(): void {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn('Google OAuth not configured: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing');
    return;
  }

  passport.use(new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: (error: Error | null, user?: AuthUser | false, info?: { message: string }) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();

        if (!email) {
          return done(null, false, { message: 'No email provided by Google' });
        }

        // Check if email is in whitelist (if whitelist is configured)
        if (ALLOWED_LIST.length > 0) {
          const emailDomain = email.split('@')[1];
          const isAllowed = ALLOWED_EMAILS.includes(email) || ALLOWED_DOMAINS.includes(emailDomain);
          if (!isAllowed) {
            console.log(`Auth denied for email: ${email} (not in whitelist)`);
            return done(null, false, { message: 'Email not authorized' });
          }
        }

        // Find or create user in DB
        let dbUser = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!dbUser) {
          // Create new user
          const [newUser] = await db.insert(users).values({
            email,
            name: profile.displayName || email,
            picture: profile.photos?.[0]?.value,
          }).returning();
          dbUser = newUser;
        } else {
          // Update existing user's profile
          await db.update(users)
            .set({
              name: profile.displayName || dbUser.name,
              picture: profile.photos?.[0]?.value || dbUser.picture,
              updatedAt: new Date(),
            })
            .where(eq(users.id, dbUser.id));
        }

        // Check org memberships
        const memberships = await db.query.userOrganizations.findMany({
          where: eq(userOrganizations.userId, dbUser.id),
          with: { organization: true },
        });

        const needsOnboarding = memberships.length === 0;

        // Get active org info
        let organizationName: string | null = null;
        let role: string | null = null;
        if (dbUser.activeOrganizationId) {
          const activeMembership = memberships.find(
            m => m.organizationId === dbUser!.activeOrganizationId
          );
          if (activeMembership) {
            organizationName = (activeMembership as any).organization?.name || null;
            role = activeMembership.role;
          }
        } else if (memberships.length > 0) {
          // Auto-set first org as active
          const first = memberships[0];
          await db.update(users)
            .set({ activeOrganizationId: first.organizationId })
            .where(eq(users.id, dbUser.id));
          dbUser = { ...dbUser, activeOrganizationId: first.organizationId };
          organizationName = (first as any).organization?.name || null;
          role = first.role;
        }

        const authUser: AuthUser = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          picture: dbUser.picture || undefined,
          activeOrganizationId: dbUser.activeOrganizationId,
          organizationName,
          role,
          needsOnboarding,
        };

        console.log(`Auth success for: ${email} (org: ${organizationName || 'none'})`);
        return done(null, authUser);
      } catch (err) {
        console.error('OAuth callback error:', err);
        return done(err as Error);
      }
    }
  ));

  // Serialize only user ID to session
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  // Deserialize user from DB
  passport.deserializeUser(async (id: string, done) => {
    try {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!dbUser) {
        return done(null, false);
      }

      // Get active org info
      let activeOrgId = dbUser.activeOrganizationId;
      let organizationName: string | null = null;
      let role: string | null = null;
      let needsOnboarding = true;

      const memberships = await db.query.userOrganizations.findMany({
        where: eq(userOrganizations.userId, dbUser.id),
        with: { organization: true },
      });

      needsOnboarding = memberships.length === 0;

      if (activeOrgId) {
        const activeMembership = memberships.find(
          m => m.organizationId === activeOrgId
        );
        if (activeMembership) {
          organizationName = (activeMembership as any).organization?.name || null;
          role = activeMembership.role;
        }
      } else if (memberships.length > 0) {
        // Auto-set first org as active during session restore
        const first = memberships[0];
        activeOrgId = first.organizationId;
        await db.update(users)
          .set({ activeOrganizationId: activeOrgId })
          .where(eq(users.id, dbUser.id));
        organizationName = (first as any).organization?.name || null;
        role = first.role;
      }

      const authUser: AuthUser = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        picture: dbUser.picture || undefined,
        activeOrganizationId: activeOrgId,
        organizationName,
        role,
        needsOnboarding,
      };

      done(null, authUser);
    } catch (err) {
      done(err);
    }
  });

  console.log('Google OAuth configured');
  if (ALLOWED_LIST.length > 0) {
    console.log(`Email whitelist: ${ALLOWED_DOMAINS.length} domain(s), ${ALLOWED_EMAILS.length} email(s) allowed`);
  } else {
    console.log('No email whitelist configured - all Google accounts allowed');
  }
}

export default passport;
