/**
 * Routes Index
 *
 * Aggregates all API routes.
 */

import { Router } from 'express';
import chatRouter from './chat.js';
import sessionsRouter from './sessions.js';
import uploadRouter from './upload.js';
import pdfUploadRouter from './pdf-upload.js';
import flowsRouter from './flows.js';
import foldersRouter from './folders.js';
import runsRouter from './runs.js';
import contactsRouter from './contacts.js';
import notificationsRouter from './notifications.js';
import attentionRouter from './attention.js';
import messagesRouter from './messages.js';
import organizationsRouter from './organizations.js';
import teamRouter from './team.js';
import reportsRouter from './reports.js';
import schedulesRouter from './schedules.js';
import searchRouter from './search.js';
import filesRouter from './files.js';
import eventsRouter from './events.js';
import integrationsRouter from './integrations.js';
import embedRouter from './embed.js';
import galleryRouter from './gallery.js';
import analyzeRouter from './analyze.js';
import portalsRouter from './portals.js';
import emailTemplatesRouter from './email-templates.js';
import accountsRouter from './accounts.js';
import contactGroupsRouter from './contact-groups.js';
import ssoRouter from './sso.js';
import aiTestRouter from './ai-test.js';
import { orgScope } from '../middleware/org-scope.js';

const router = Router();

// Organization management (no org-scope needed - used before onboarding)
router.use('/organizations', organizationsRouter);

// Team management (needs org-scope for most routes, but accept-invite is public-ish)
router.use('/team', teamRouter);

// Analyze API (no org-scope needed — pure computation, no DB access)
router.use('/analyze', analyzeRouter);

// AI Test API (no org-scope needed — dry-run AI features, no DB writes)
router.use('/ai', aiTestRouter);

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

// Embed config API (generate embed config for a template)
router.use('/templates', embedRouter);

// Folders API (template folder organization)
router.use('/folders', foldersRouter);

// Contacts API (external assignees management)
router.use('/contacts', contactsRouter);

// Notifications API (in-app notifications)
router.use('/notifications', notificationsRouter);

// Attention API (coordinator attention needed items)
router.use('/attention', attentionRouter);

// Messages API (in-flow chat conversations)
router.use('/flows', messagesRouter);

// PDF upload API
router.use('/pdf', pdfUploadRouter);

// Reports API (analytics & dashboard metrics)
router.use('/reports', reportsRouter);

// Schedules API (scheduled workflow triggers)
router.use('/schedules', schedulesRouter);

// Search API (command palette global search)
router.use('/search', searchRouter);

// Files API (cloud file storage)
router.use('/files', filesRouter);

// Events API (SSE real-time updates)
router.use('/events', eventsRouter);

// Integrations API (Slack/Teams/Custom webhooks)
router.use('/integrations', integrationsRouter);

// Gallery API (curated template gallery with import)
router.use('/gallery', galleryRouter);

// Portals API (assignee portal management)
router.use('/portals', portalsRouter);

// Email Templates API (email template customization)
router.use('/email-templates', emailTemplatesRouter);

// Accounts API (companies, clients, vendors)
router.use('/accounts', accountsRouter);

// Contact Groups API (reusable assignment lists)
router.use('/contact-groups', contactGroupsRouter);

// SSO Admin API (domain management, SSO config CRUD)
router.use('/sso', ssoRouter);

// Flows API (workflow execution — active instances)
// Note: POST /api/templates/:templateId/flows is handled by runsRouter
// IMPORTANT: The catch-all `router.use('/', runsRouter)` must be LAST
// because runsRouter has a `/:id` route that would swallow other paths.
router.use('/flows', runsRouter);
router.use('/', runsRouter); // For /templates/:templateId/flows endpoint

export default router;
