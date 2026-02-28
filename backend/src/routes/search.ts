/**
 * Search API Routes
 *
 * Global search endpoint for flows, templates, and contacts.
 * Used by the Command Palette (Cmd+K).
 */

import { Router } from 'express';
import { db } from '../db/client.js';
import { flowRuns, flows, contacts } from '../db/schema.js';
import { and, eq, or, sql } from 'drizzle-orm';

const router = Router();

// GET /api/search?q=<query>
router.get('/', async (req, res) => {
  try {
    const query = (req.query.q as string || '').trim();
    const orgId = req.organizationId!;

    if (!query || query.length < 2) {
      return res.json({ success: true, data: { runs: [], templates: [], contacts: [] } });
    }

    const searchPattern = `%${query}%`;

    const [matchedRuns, matchedTemplates, matchedContacts] = await Promise.all([
      db.select({
        id: flowRuns.id,
        name: flowRuns.name,
        status: flowRuns.status,
      })
      .from(flowRuns)
      .innerJoin(flows, eq(flowRuns.flowId, flows.id))
      .where(and(
        eq(flows.organizationId, orgId),
        sql`lower(${flowRuns.name}) like lower(${searchPattern})`
      ))
      .limit(5),

      db.select({
        id: flows.id,
        name: flows.name,
        status: flows.status,
      })
      .from(flows)
      .where(and(
        eq(flows.organizationId, orgId),
        sql`lower(${flows.name}) like lower(${searchPattern})`
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
        runs: matchedRuns,
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
