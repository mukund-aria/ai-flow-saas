/**
 * SAML SSO Service
 *
 * Core SAML logic: strategy building, assertion validation,
 * user provisioning, and SSO enforcement checks.
 */

import { SAML } from '@node-saml/passport-saml';
import { db } from '../db/client.js';
import {
  ssoConfigs, orgDomains, samlAssertions,
  users, userOrganizations, contacts, assigneeSessions,
} from '../db/schema.js';
import { eq, and, lt } from 'drizzle-orm';
import type { SsoTarget } from '../db/schema.js';

// ============================================================================
// Types
// ============================================================================

interface SamlUserAttributes {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

// ============================================================================
// Find SSO config by email domain
// ============================================================================

export async function findSsoConfigByEmail(
  email: string,
  target: SsoTarget,
  portalId?: string | null
): Promise<typeof ssoConfigs.$inferSelect | null> {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;

  // Find verified domain → org
  const domainRecord = await db.query.orgDomains.findFirst({
    where: and(
      eq(orgDomains.domain, domain),
      eq(orgDomains.verificationStatus, 'VERIFIED')
    ),
  });

  if (!domainRecord) return null;

  // Find SSO config for this org + target
  if (target === 'ASSIGNEE' && portalId) {
    // For assignees, look for portal-specific config first
    const portalConfig = await db.query.ssoConfigs.findFirst({
      where: and(
        eq(ssoConfigs.organizationId, domainRecord.organizationId),
        eq(ssoConfigs.portalId, portalId),
        eq(ssoConfigs.target, 'ASSIGNEE'),
        eq(ssoConfigs.enabled, true)
      ),
    });
    if (portalConfig) return portalConfig;
  }

  // Coordinator config or fallback
  const config = await db.query.ssoConfigs.findFirst({
    where: and(
      eq(ssoConfigs.organizationId, domainRecord.organizationId),
      eq(ssoConfigs.target, target),
      eq(ssoConfigs.enabled, true)
    ),
  });
  return config ?? null;
}

// ============================================================================
// Check if SSO is enforced for an email
// ============================================================================

export async function isSsoEnforced(
  email: string,
  target: SsoTarget,
  portalId?: string | null
): Promise<boolean> {
  const config = await findSsoConfigByEmail(email, target, portalId);
  return config?.enforced ?? false;
}

// ============================================================================
// Build a SAML instance for a specific config
// ============================================================================

export function buildSamlInstance(config: typeof ssoConfigs.$inferSelect): SAML {
  return new SAML({
    callbackUrl: config.spAcsUrl,
    entryPoint: config.idpSsoUrl,
    issuer: config.spEntityId,
    idpCert: config.idpCertificate,
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: false,
    audience: config.spEntityId,
  });
}

// ============================================================================
// Validate and record an assertion (replay prevention)
// ============================================================================

export async function validateAndRecordAssertion(
  assertionId: string,
  ssoConfigId: string,
  notOnOrAfter: Date
): Promise<{ valid: boolean; error?: string }> {
  if (!assertionId) {
    return { valid: false, error: 'Missing assertion ID' };
  }

  // Check for replay
  const existing = await db.query.samlAssertions.findFirst({
    where: eq(samlAssertions.assertionId, assertionId),
  });

  if (existing) {
    return { valid: false, error: 'Assertion replay detected' };
  }

  // Record assertion
  await db.insert(samlAssertions).values({
    assertionId,
    ssoConfigId,
    expiresAt: notOnOrAfter,
  });

  return { valid: true };
}

// ============================================================================
// Extract user attributes from SAML profile
// ============================================================================

export function extractUserAttributes(
  profile: Record<string, any>,
  mapping?: typeof ssoConfigs.$inferSelect['attributeMapping']
): SamlUserAttributes {
  const attrMap = mapping || {};

  // Try mapped attributes first, then common SAML attributes
  const email = (
    getProfileValue(profile, attrMap.email) ||
    getProfileValue(profile, 'email') ||
    getProfileValue(profile, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress') ||
    profile.nameID
  )?.toLowerCase();

  const firstName =
    getProfileValue(profile, attrMap.firstName) ||
    getProfileValue(profile, 'firstName') ||
    getProfileValue(profile, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname') ||
    '';

  const lastName =
    getProfileValue(profile, attrMap.lastName) ||
    getProfileValue(profile, 'lastName') ||
    getProfileValue(profile, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname') ||
    '';

  const displayName =
    getProfileValue(profile, attrMap.displayName) ||
    getProfileValue(profile, 'displayName') ||
    getProfileValue(profile, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name') ||
    [firstName, lastName].filter(Boolean).join(' ') ||
    email;

  return { email, firstName, lastName, displayName };
}

function getProfileValue(profile: Record<string, any>, key?: string): string | undefined {
  if (!key) return undefined;
  const val = profile[key];
  if (Array.isArray(val)) return val[0];
  if (typeof val === 'string') return val;
  return undefined;
}

// ============================================================================
// Provision coordinator user from SAML attributes
// ============================================================================

export async function provisionCoordinatorFromSaml(
  attributes: SamlUserAttributes,
  orgId: string
): Promise<{ user: typeof users.$inferSelect; isNew: boolean }> {
  // Find existing user
  let dbUser = await db.query.users.findFirst({
    where: eq(users.email, attributes.email),
  });

  const isNew = !dbUser;

  if (!dbUser) {
    // Create new user
    const [newUser] = await db.insert(users).values({
      email: attributes.email,
      name: attributes.displayName || attributes.email,
      authMethod: 'saml',
    }).returning();
    dbUser = newUser;
  } else {
    // Update auth method
    await db.update(users)
      .set({ authMethod: 'saml', updatedAt: new Date() })
      .where(eq(users.id, dbUser.id));
  }

  // Ensure org membership
  const membership = await db.query.userOrganizations.findFirst({
    where: and(
      eq(userOrganizations.userId, dbUser.id),
      eq(userOrganizations.organizationId, orgId)
    ),
  });

  if (!membership) {
    await db.insert(userOrganizations).values({
      userId: dbUser.id,
      organizationId: orgId,
      role: 'MEMBER',
    });
  }

  // Set active org
  if (dbUser.activeOrganizationId !== orgId) {
    await db.update(users)
      .set({ activeOrganizationId: orgId })
      .where(eq(users.id, dbUser.id));
  }

  return { user: dbUser, isNew };
}

// ============================================================================
// Provision assignee contact from SAML attributes
// ============================================================================

export async function provisionAssigneeFromSaml(
  attributes: SamlUserAttributes,
  orgId: string,
  portalId: string
): Promise<{ contact: typeof contacts.$inferSelect; token: string }> {
  // Find existing contact
  let contact = await db.query.contacts.findFirst({
    where: and(
      eq(contacts.email, attributes.email),
      eq(contacts.organizationId, orgId)
    ),
  });

  if (!contact) {
    const [newContact] = await db.insert(contacts).values({
      email: attributes.email,
      name: attributes.displayName || attributes.email,
      organizationId: orgId,
      portalId,
      type: 'ASSIGNEE',
      status: 'ACTIVE',
    }).returning();
    contact = newContact;
  }

  // Create assignee session (30 days)
  const [session] = await db.insert(assigneeSessions).values({
    contactId: contact.id,
    organizationId: orgId,
    portalId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }).returning();

  return { contact, token: session.token };
}

// ============================================================================
// Generate SP metadata XML
// ============================================================================

export function generateSpMetadata(config: typeof ssoConfigs.$inferSelect): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="${escapeXml(config.spEntityId)}">
  <SPSSODescriptor
    AuthnRequestsSigned="false"
    WantAssertionsSigned="true"
    protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${escapeXml(config.spAcsUrl)}"
      index="0"
      isDefault="true" />
  </SPSSODescriptor>
</EntityDescriptor>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// Cleanup expired assertions
// ============================================================================

export async function cleanupExpiredAssertions(): Promise<number> {
  const result = await db.delete(samlAssertions)
    .where(lt(samlAssertions.expiresAt, new Date()));
  return (result as any).rowCount ?? 0;
}
