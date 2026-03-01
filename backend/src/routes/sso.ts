/**
 * SSO Admin Routes
 *
 * Organization-scoped admin routes for managing SAML SSO:
 * domain claiming/verification and SSO config CRUD.
 */

import { Router } from 'express';
import { db } from '../db/client.js';
import { ssoConfigs, userOrganizations } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { claimDomain, verifyDomain, listOrgDomains, removeDomain } from '../auth/domain-service.js';
import { generateSpMetadata } from '../auth/saml-service.js';

const router = Router();

// ============================================================================
// Helpers
// ============================================================================

async function requireAdmin(req: any, res: any): Promise<boolean> {
  const user = req.user as any;
  if (!user || !req.organizationId) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    return false;
  }

  const membership = await db.query.userOrganizations.findFirst({
    where: and(
      eq(userOrganizations.userId, user.id),
      eq(userOrganizations.organizationId, req.organizationId)
    ),
  });

  if (!membership || membership.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required' },
    });
    return false;
  }

  return true;
}

// ============================================================================
// Domain Management
// ============================================================================

// POST /api/sso/domains — Claim a domain
router.post('/domains', asyncHandler(async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const { domain } = req.body;
  if (!domain || typeof domain !== 'string') {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Domain is required' } });
    return;
  }

  const result = await claimDomain(req.organizationId!, domain);
  if (!result.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: result.error } });
    return;
  }

  res.status(201).json({ success: true, data: result.domain });
}));

// GET /api/sso/domains — List domains
router.get('/domains', asyncHandler(async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const domains = await listOrgDomains(req.organizationId!);
  res.json({ success: true, data: domains });
}));

// POST /api/sso/domains/:id/verify — Verify a domain
router.post('/domains/:id/verify', asyncHandler(async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const result = await verifyDomain(req.params.id as string, req.organizationId!);
  if (!result.success) {
    res.status(400).json({ success: false, error: { code: 'VERIFICATION_FAILED', message: result.error } });
    return;
  }

  res.json({ success: true });
}));

// DELETE /api/sso/domains/:id — Remove a domain
router.delete('/domains/:id', asyncHandler(async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const result = await removeDomain(req.params.id as string, req.organizationId!);
  if (!result.success) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: result.error } });
    return;
  }

  res.json({ success: true });
}));

// ============================================================================
// SSO Config Management
// ============================================================================

// POST /api/sso/configs — Create SSO config
router.post('/configs', asyncHandler(async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const { target, portalId, idpEntityId, idpSsoUrl, idpCertificate, idpSloUrl, attributeMapping } = req.body;

  if (!target || !['COORDINATOR', 'ASSIGNEE'].includes(target)) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'target must be COORDINATOR or ASSIGNEE' } });
    return;
  }

  if (!idpEntityId || !idpSsoUrl || !idpCertificate) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'idpEntityId, idpSsoUrl, and idpCertificate are required' },
    });
    return;
  }

  // Auto-generate SP fields
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  const callbackPath = target === 'COORDINATOR' ? '/auth/sso/callback' : '/auth/portal-sso/callback';
  const spEntityId = `${baseUrl}/saml/${req.organizationId}/${target.toLowerCase()}`;
  const spAcsUrl = `${baseUrl}${callbackPath}`;

  try {
    const [config] = await db.insert(ssoConfigs).values({
      organizationId: req.organizationId!,
      portalId: target === 'ASSIGNEE' ? portalId : null,
      target,
      idpEntityId,
      idpSsoUrl,
      idpCertificate,
      idpSloUrl: idpSloUrl || null,
      spEntityId,
      spAcsUrl,
      attributeMapping: attributeMapping || null,
    }).returning();

    res.status(201).json({ success: true, data: config });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'SSO config already exists for this target' },
      });
      return;
    }
    throw err;
  }
}));

// GET /api/sso/configs — List SSO configs
router.get('/configs', asyncHandler(async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const configs = await db.query.ssoConfigs.findMany({
    where: eq(ssoConfigs.organizationId, req.organizationId!),
  });

  // Strip certificate from list view for safety
  const safeConfigs = configs.map(c => ({
    ...c,
    idpCertificate: c.idpCertificate ? '***configured***' : null,
  }));

  res.json({ success: true, data: safeConfigs });
}));

// PUT /api/sso/configs/:id — Update SSO config
router.put('/configs/:id', asyncHandler(async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const configId = req.params.id as string;
  const existing = await db.query.ssoConfigs.findFirst({
    where: and(eq(ssoConfigs.id, configId), eq(ssoConfigs.organizationId, req.organizationId!)),
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SSO config not found' } });
    return;
  }

  const {
    idpEntityId, idpSsoUrl, idpCertificate, idpSloUrl,
    enabled, enforced, autoProvision, sessionMaxAgeMinutes,
    attributeMapping,
  } = req.body;

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (idpEntityId !== undefined) updates.idpEntityId = idpEntityId;
  if (idpSsoUrl !== undefined) updates.idpSsoUrl = idpSsoUrl;
  if (idpCertificate !== undefined) updates.idpCertificate = idpCertificate;
  if (idpSloUrl !== undefined) updates.idpSloUrl = idpSloUrl;
  if (enabled !== undefined) updates.enabled = enabled;
  if (enforced !== undefined) updates.enforced = enforced;
  if (autoProvision !== undefined) updates.autoProvision = autoProvision;
  if (sessionMaxAgeMinutes !== undefined) updates.sessionMaxAgeMinutes = sessionMaxAgeMinutes;
  if (attributeMapping !== undefined) updates.attributeMapping = attributeMapping;

  const [updated] = await db.update(ssoConfigs)
    .set(updates)
    .where(eq(ssoConfigs.id, configId))
    .returning();

  res.json({ success: true, data: updated });
}));

// DELETE /api/sso/configs/:id — Delete SSO config
router.delete('/configs/:id', asyncHandler(async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const configId = req.params.id as string;
  const existing = await db.query.ssoConfigs.findFirst({
    where: and(eq(ssoConfigs.id, configId), eq(ssoConfigs.organizationId, req.organizationId!)),
  });

  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SSO config not found' } });
    return;
  }

  await db.delete(ssoConfigs).where(eq(ssoConfigs.id, configId));
  res.json({ success: true });
}));

// GET /api/sso/configs/:id/metadata — Download SP metadata XML
router.get('/configs/:id/metadata', asyncHandler(async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  const configId = req.params.id as string;
  const config = await db.query.ssoConfigs.findFirst({
    where: and(eq(ssoConfigs.id, configId), eq(ssoConfigs.organizationId, req.organizationId!)),
  });

  if (!config) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SSO config not found' } });
    return;
  }

  const xml = generateSpMetadata(config);
  res.set('Content-Type', 'application/xml');
  res.send(xml);
}));

export default router;
