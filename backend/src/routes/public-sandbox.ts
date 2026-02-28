/**
 * Public Sandbox Routes
 *
 * Unauthenticated endpoints for the viral onboarding funnel.
 * Allows visitors to save AI-generated flows and start test runs
 * before creating an account.
 */

import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { asyncHandler } from '../middleware/async-handler.js';
import {
  saveSandboxFlow,
  getSandboxFlow,
  materializeSandboxFlowForTest,
} from '../services/sandbox.js';
import { isEmailAllowed } from '../auth/email-whitelist.js';

const router = Router();

// ============================================================================
// Rate Limiters
// ============================================================================

const saveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many flow saves. Please try again later.',
    },
  },
});

const testLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many test starts. Please try again later.',
    },
  },
});

// ============================================================================
// POST /api/public/sandbox/flows — Save a sandbox flow
// ============================================================================

router.post(
  '/flows',
  saveLimiter,
  asyncHandler(async (req, res) => {
    const { name, description, definition, prompt, sessionId } = req.body;

    if (!name || !definition || !prompt) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'name, definition, and prompt are required',
        },
      });
      return;
    }

    const result = await saveSandboxFlow({
      name,
      description,
      definition,
      prompt,
      sessionId,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  }),
);

// ============================================================================
// GET /api/public/sandbox/flows/:id — Get a sandbox flow
// ============================================================================

router.get(
  '/flows/:id',
  asyncHandler(async (req, res) => {
    const flow = await getSandboxFlow(req.params.id as string);

    if (!flow) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Sandbox flow not found or expired',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: flow,
    });
  }),
);

// ============================================================================
// POST /api/public/sandbox/flows/:id/test — Start a test run
// ============================================================================

router.post(
  '/flows/:id/test',
  testLimiter,
  asyncHandler(async (req, res) => {
    const { contactName, contactEmail } = req.body;

    if (!contactName || !contactEmail) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'contactName and contactEmail are required',
        },
      });
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email address',
        },
      });
      return;
    }

    // Check email whitelist
    if (!(await isEmailAllowed(contactEmail))) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Email not authorized for sandbox testing',
        },
      });
      return;
    }

    try {
      const result = await materializeSandboxFlowForTest(
        req.params.id as string,
        contactName,
        contactEmail,
      );

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const taskUrl = `${frontendUrl}/task/${result.token}`;

      res.status(201).json({
        success: true,
        data: {
          token: result.token,
          taskUrl,
        },
      });
    } catch (err: any) {
      const message = err?.message || 'Failed to start test';
      const status = message.includes('not found') || message.includes('expired') ? 404 : 500;

      res.status(status).json({
        success: false,
        error: {
          code: status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
          message,
        },
      });
    }
  }),
);

export default router;
