/**
 * Routes Index
 *
 * Aggregates all API routes.
 */

import { Router } from 'express';
import chatRouter from './chat.js';
import sessionsRouter from './sessions.js';
import uploadRouter from './upload.js';
import flowsRouter from './flows.js';
import runsRouter from './runs.js';
import contactsRouter from './contacts.js';
import organizationsRouter from './organizations.js';
import teamRouter from './team.js';
import { orgScope } from '../middleware/org-scope.js';

const router = Router();

// Organization management (no org-scope needed - used before onboarding)
router.use('/organizations', organizationsRouter);

// Team management (needs org-scope for most routes, but accept-invite is public-ish)
router.use('/team', teamRouter);

// Apply org-scope to all data-scoped routes below
router.use(orgScope);

// Chat endpoint (AI builder)
router.use('/chat', chatRouter);

// Upload endpoint (nested under /chat for logical grouping)
router.use('/chat/upload', uploadRouter);

// Session management endpoints (AI builder sessions)
router.use('/sessions', sessionsRouter);

// Templates API (workflow templates CRUD)
router.use('/templates', flowsRouter);

// Flows API (workflow execution — active instances)
// Note: POST /api/templates/:templateId/flows is handled by runsRouter
router.use('/flows', runsRouter);
router.use('/', runsRouter); // For /templates/:templateId/flows endpoint

// Contacts API (external assignees management)
router.use('/contacts', contactsRouter);

export default router;
