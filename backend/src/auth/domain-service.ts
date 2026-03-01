/**
 * Domain Verification Service
 *
 * Manages email domain claiming and verification for SSO.
 * Orgs must verify ownership of a domain before SSO can be enabled.
 */

import dns from 'dns/promises';
import { db } from '../db/client.js';
import { orgDomains } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const VERIFICATION_PREFIX = '_serviceflow-verify';

// ============================================================================
// Claim a domain for an organization
// ============================================================================

export async function claimDomain(
  orgId: string,
  domain: string
): Promise<{ success: true; domain: typeof orgDomains.$inferSelect } | { success: false; error: string }> {
  // Normalize and validate
  const normalizedDomain = domain.toLowerCase().trim();

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(normalizedDomain)) {
    return { success: false, error: 'Invalid domain format' };
  }

  // Block common free email domains
  const blocked = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'];
  if (blocked.includes(normalizedDomain)) {
    return { success: false, error: 'Free email domains cannot be claimed' };
  }

  // Check if domain is already claimed by another org
  const existing = await db.query.orgDomains.findFirst({
    where: eq(orgDomains.domain, normalizedDomain),
  });

  if (existing) {
    if (existing.organizationId === orgId) {
      return { success: false, error: 'Domain already claimed by your organization' };
    }
    return { success: false, error: 'Domain is already claimed by another organization' };
  }

  // Create domain record
  const [record] = await db.insert(orgDomains).values({
    organizationId: orgId,
    domain: normalizedDomain,
  }).returning();

  return { success: true, domain: record };
}

// ============================================================================
// Verify a domain via DNS TXT record
// ============================================================================

export async function verifyDomain(
  domainId: string,
  orgId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const record = await db.query.orgDomains.findFirst({
    where: and(eq(orgDomains.id, domainId), eq(orgDomains.organizationId, orgId)),
  });

  if (!record) {
    return { success: false, error: 'Domain not found' };
  }

  if (record.verificationStatus === 'VERIFIED') {
    return { success: true };
  }

  // DNS TXT verification
  const expectedRecord = `${VERIFICATION_PREFIX}=${record.verificationToken}`;

  try {
    const txtRecords = await dns.resolveTxt(`${VERIFICATION_PREFIX}.${record.domain}`);
    const flatRecords = txtRecords.map(r => r.join(''));

    if (flatRecords.some(r => r === expectedRecord)) {
      await db.update(orgDomains)
        .set({ verificationStatus: 'VERIFIED', verifiedAt: new Date() })
        .where(eq(orgDomains.id, domainId));

      return { success: true };
    }

    await db.update(orgDomains)
      .set({ verificationStatus: 'FAILED' })
      .where(eq(orgDomains.id, domainId));

    return { success: false, error: `DNS TXT record not found. Add a TXT record for ${VERIFICATION_PREFIX}.${record.domain} with value: ${expectedRecord}` };
  } catch (err: any) {
    // ENOTFOUND or ENODATA means the record doesn't exist yet
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return {
        success: false,
        error: `DNS TXT record not found. Add a TXT record for ${VERIFICATION_PREFIX}.${record.domain} with value: ${expectedRecord}`,
      };
    }

    console.error('DNS verification error:', err);
    return { success: false, error: 'DNS lookup failed. Please try again.' };
  }
}

// ============================================================================
// List domains for an organization
// ============================================================================

export async function listOrgDomains(orgId: string) {
  return db.query.orgDomains.findMany({
    where: eq(orgDomains.organizationId, orgId),
  });
}

// ============================================================================
// Remove a domain
// ============================================================================

export async function removeDomain(
  domainId: string,
  orgId: string
): Promise<{ success: boolean; error?: string }> {
  const record = await db.query.orgDomains.findFirst({
    where: and(eq(orgDomains.id, domainId), eq(orgDomains.organizationId, orgId)),
  });

  if (!record) {
    return { success: false, error: 'Domain not found' };
  }

  await db.delete(orgDomains).where(eq(orgDomains.id, domainId));
  return { success: true };
}
