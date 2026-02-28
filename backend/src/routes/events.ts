/**
 * Events Route — SSE Endpoint
 *
 * Provides real-time Server-Sent Events for coordinator portal updates.
 * Auth required, org-scoped.
 */

import { Router, Request, Response } from 'express';
import { sseManager } from '../services/sse-manager.js';

const router = Router();

/**
 * GET /api/events — SSE stream
 *
 * Opens a persistent connection for real-time event delivery.
 * Events are scoped to the user's organization.
 */
router.get('/', (req: Request, res: Response) => {
  const orgId = req.organizationId;
  if (!orgId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Set SSE headers — disable compression to prevent buffering
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering if present
  });

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ connected: true })}\n\n`);

  // Register client
  sseManager.addClient(orgId, res);

  // Clean up on disconnect
  req.on('close', () => {
    sseManager.removeClient(orgId, res);
  });
});

export default router;
