/**
 * Analyze Route
 *
 * POST /api/analyze — evaluate workflow against analysis rules
 */

import { Router } from 'express';
import { getAnalysisRules } from '../config/loader.js';
import { analyzeWorkflow } from '../services/workflow-analyzer.js';

const router = Router();

router.post('/', (req, res) => {
  try {
    const { workflow } = req.body;

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: 'Missing workflow in request body',
      });
    }

    const rules = getAnalysisRules();
    const result = analyzeWorkflow(workflow, rules);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Analyze] Error:', error);
    return res.json({
      success: false,
      error: 'Analysis failed',
    });
  }
});

export default router;
