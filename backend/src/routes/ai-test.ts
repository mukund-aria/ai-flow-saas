/**
 * AI Test Route
 *
 * POST /api/ai/test — Run AI features in dry-run mode (no DB writes)
 */

import { Router } from 'express';
import {
  testAIReview,
  testAIPrepare,
  testAIAdvise,
  type AITestContext,
} from '../services/ai-assignee.js';

const router = Router();

router.post('/test', async (req, res) => {
  try {
    const { feature, stepDef, sampleData, context } = req.body as {
      feature: 'review' | 'prepare' | 'advise';
      stepDef: { type: string; config: Record<string, unknown> };
      sampleData?: Record<string, unknown>;
      context?: AITestContext;
    };

    if (!feature || !stepDef) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: feature, stepDef',
      });
    }

    if (!['review', 'prepare', 'advise'].includes(feature)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feature. Must be one of: review, prepare, advise',
      });
    }

    let result: unknown;

    switch (feature) {
      case 'review':
        result = await testAIReview(stepDef, sampleData || {}, context);
        break;
      case 'prepare':
        result = await testAIPrepare(stepDef, context);
        break;
      case 'advise':
        result = await testAIAdvise(stepDef, sampleData || {}, context);
        break;
    }

    return res.json({ success: true, result });
  } catch (error) {
    console.error('[AI Test] Error:', error);
    return res.status(500).json({
      success: false,
      error: `AI test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});

export default router;
