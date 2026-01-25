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

const router = Router();

// Chat endpoint (AI builder)
router.use('/chat', chatRouter);

// Upload endpoint (nested under /chat for logical grouping)
router.use('/chat/upload', uploadRouter);

// Session management endpoints (AI builder sessions)
router.use('/sessions', sessionsRouter);

// Flows API (workflow templates CRUD)
router.use('/flows', flowsRouter);

// Flow Runs API (workflow execution)
// Note: POST /api/flows/:flowId/runs is handled by runsRouter
router.use('/runs', runsRouter);
router.use('/', runsRouter); // For /flows/:flowId/runs endpoint

export default router;
