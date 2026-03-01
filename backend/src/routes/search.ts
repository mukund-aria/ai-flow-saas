/**
 * Search API Routes
 *
 * Global search endpoint for flows, templates, and contacts.
 * Used by the Command Palette (Cmd+K).
 */

import { Router } from 'express';
import { db } from '../db/client.js';
import { flows, templates, contacts } from '../db/schema.js';
import { and, eq, or, sql } from 'drizzle-orm';

const router = Router();

// GET /api/search?q=<query>
router.get('/', async (req, res) => {
  try {
    const query = (req.query.q as string || '').trim();
    const orgId = req.organizationId!;

    if (!query || query.length < 2) {
      return res.json({ success: true, data: { flows: [], templates: [], contacts: [] } });
    }

    const searchPattern = `%${query}%`;

    const [matchedFlows, matchedTemplates, matchedContacts] = await Promise.all([
      db.select({
        id: flows.id,
        name: flows.name,
        status: flows.status,
      })
      .from(flows)
      .innerJoin(templates, eq(flows.templateId, templates.id))
      .where(and(
        eq(templates.organizationId, orgId),
        sql`lower(${flows.name}) like lower(${searchPattern})`
      ))
      .limit(5),

      db.select({
        id: templates.id,
        name: templates.name,
        status: templates.status,
      })
      .from(templates)
      .where(and(
        eq(templates.organizationId, orgId),
        sql`lower(${templates.name}) like lower(${searchPattern})`
      ))
      .limit(5),

      db.select({
        id: contacts.id,
        name: contacts.name,
        email: contacts.email,
      })
      .from(contacts)
      .where(and(
        eq(contacts.organizationId, orgId),
        or(
          sql`lower(${contacts.name}) like lower(${searchPattern})`,
          sql`lower(${contacts.email}) like lower(${searchPattern})`
        )
      ))
      .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        flows: matchedFlows,
        templates: matchedTemplates,
        contacts: matchedContacts,
      },
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: { code: 'SEARCH_ERROR', message: 'Search failed' } });
  }
});

export default router;
