/**
 * OTP Authentication Service
 *
 * Generates and verifies one-time passwords for email-based login.
 * Rate-limited, with attempt tracking and automatic user provisioning.
 */

import crypto from 'crypto';
import { db } from '../db/client.js';
import { loginOtps, users, userOrganizations } from '../db/schema.js';
import { eq, and, gt, isNull, desc } from 'drizzle-orm';
import { isEmailAllowed } from './email-whitelist.js';
import { sendOTP } from '../services/email.js';
import type { AuthUser } from './passport.js';

// ============================================================================
// Generate OTP
// ============================================================================

export async function generateOTP(email: string): Promise<
  { success: true } | { success: false; error: string; retryAfter?: number }
> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check whitelist
  if (!(await isEmailAllowed(normalizedEmail))) {
    return { success: false, error: 'Email not authorized' };
  }

  // Rate limit: reject if most recent OTP was created < 60s ago
  const recentOtp = await db.query.loginOtps.findFirst({
    where: eq(loginOtps.email, normalizedEmail),
    orderBy: [desc(loginOtps.createdAt)],
  });

  if (recentOtp) {
    const secondsSinceCreated = (Date.now() - recentOtp.createdAt.getTime()) / 1000;
    if (secondsSinceCreated < 60) {
      const retryAfter = Math.ceil(60 - secondsSinceCreated);
      return { success: false, error: 'Please wait before requesting a new code', retryAfter };
    }
  }

  // Generate 6-digit code
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');

  // Insert into DB with 10-minute expiry
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db.insert(loginOtps).values({
    email: normalizedEmail,
    code,
    expiresAt,
  });

  // Send OTP email
  await sendOTP({ to: normalizedEmail, code });

  return { success: true };
}

// ============================================================================
// Verify OTP
// ============================================================================

export async function verifyOTP(email: string, code: string): Promise<
  { success: true; user: AuthUser; redirectTo: string } | { success: false; error: string }
> {
  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date();

  // Find most recent valid OTP: not expired, not used
  const otp = await db.query.loginOtps.findFirst({
    where: and(
      eq(loginOtps.email, normalizedEmail),
      gt(loginOtps.expiresAt, now),
      isNull(loginOtps.usedAt),
    ),
    orderBy: [desc(loginOtps.createdAt)],
  });

  if (!otp) {
    return { success: false, error: 'No valid code found. Please request a new one.' };
  }

  // Check attempt limit
  if (otp.attempts >= 5) {
    return { success: false, error: 'Too many attempts. Please request a new code.' };
  }

  // Increment attempts
  await db.update(loginOtps)
    .set({ attempts: otp.attempts + 1 })
    .where(eq(loginOtps.id, otp.id));

  // Verify code
  if (otp.code !== code) {
    return { success: false, error: 'Invalid code. Please try again.' };
  }

  // Mark as used
  await db.update(loginOtps)
    .set({ usedAt: now })
    .where(eq(loginOtps.id, otp.id));

  // Find or create user
  let dbUser = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (!dbUser) {
    const [newUser] = await db.insert(users).values({
      email: normalizedEmail,
      name: normalizedEmail,
    }).returning();
    dbUser = newUser;
  }

  // Check org memberships
  const memberships = await db.query.userOrganizations.findMany({
    where: eq(userOrganizations.userId, dbUser.id),
    with: { organization: true },
  });

  // Determine redirect
  let redirectTo: string;
  let organizationName: string | null = null;
  let role: string | null = null;

  if (memberships.length === 0) {
    redirectTo = '/onboarding';
  } else if (memberships.length === 1) {
    // Auto-set active org
    const first = memberships[0];
    await db.update(users)
      .set({ activeOrganizationId: first.organizationId })
      .where(eq(users.id, dbUser.id));
    dbUser = { ...dbUser, activeOrganizationId: first.organizationId };
    organizationName = (first as any).organization?.name || null;
    role = first.role;
    redirectTo = '/home';
  } else {
    // Multiple orgs — let user pick
    if (dbUser.activeOrganizationId) {
      const activeMembership = memberships.find(
        m => m.organizationId === dbUser!.activeOrganizationId
      );
      if (activeMembership) {
        organizationName = (activeMembership as any).organization?.name || null;
        role = activeMembership.role;
      }
    }
    redirectTo = '/org-select';
  }

  const authUser: AuthUser = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    picture: dbUser.picture || undefined,
    activeOrganizationId: dbUser.activeOrganizationId,
    organizationName,
    role,
    needsOnboarding: memberships.length === 0,
  };

  console.log(`OTP auth success for: ${normalizedEmail} (org: ${organizationName || 'none'})`);

  return { success: true, user: authUser, redirectTo };
}
