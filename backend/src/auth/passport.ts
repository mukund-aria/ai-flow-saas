/**
 * Passport.js Configuration for Google OAuth 2.0
 *
 * Handles authentication via Google and enforces email whitelist.
 */

import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';

// ============================================================================
// Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
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

// Email whitelist from environment (comma-separated)
// If empty, all authenticated users are allowed
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(e => e.length > 0);

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
    (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: (error: Error | null, user?: AuthUser | false, info?: { message: string }) => void
    ) => {
      const email = profile.emails?.[0]?.value?.toLowerCase();

      if (!email) {
        return done(null, false, { message: 'No email provided by Google' });
      }

      // Check if email is in whitelist (if whitelist is configured)
      if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email)) {
        console.log(`Auth denied for email: ${email} (not in whitelist)`);
        return done(null, false, { message: 'Email not authorized' });
      }

      const user: AuthUser = {
        id: profile.id,
        email,
        name: profile.displayName || email,
        picture: profile.photos?.[0]?.value,
      };

      console.log(`Auth success for: ${email}`);
      return done(null, user);
    }
  ));

  // Serialize user to session
  passport.serializeUser((user: Express.User, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user: AuthUser, done) => {
    done(null, user);
  });

  console.log('Google OAuth configured');
  if (ALLOWED_EMAILS.length > 0) {
    console.log(`Email whitelist: ${ALLOWED_EMAILS.length} email(s) allowed`);
  } else {
    console.log('No email whitelist configured - all Google accounts allowed');
  }
}

export default passport;
