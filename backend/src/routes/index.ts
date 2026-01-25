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

const router = Router();

// Chat endpoint (AI builder)
router.use('/chat', chatRouter);

// Upload endpoint (nested under /chat for logical grouping)
router.use('/chat/upload', uploadRouter);

// Session management endpoints (AI builder sessions)
router.use('/sessions', sessionsRouter);

// Flows API (workflow templates CRUD)
router.use('/flows', flowsRouter);

export default router;
