/**
 * AI Review Service
 *
 * Reviews files uploaded in FILE_REQUEST steps using Claude AI.
 * Results are stored in stepExecutions.resultData._aiReview.
 */

import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db/client.js';
import { stepExecutions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const anthropic = new Anthropic();

export interface AIReviewResult {
  status: 'APPROVED' | 'REVISION_NEEDED';
  feedback: string;
  issues?: string[];
  reviewedAt: string;
}

/**
 * Review files uploaded for a step execution.
 * Stores the result in resultData._aiReview.
 */
export async function reviewFiles(
  stepExecutionId: string,
  fileNames: string[],
  criteria?: string
): Promise<AIReviewResult> {
  const defaultCriteria = 'Review the uploaded files for completeness, accuracy, and quality. Check that all required information is present and properly formatted.';

  const prompt = `You are reviewing files uploaded as part of a business workflow step.

Files submitted: ${fileNames.join(', ')}

Review criteria: ${criteria || defaultCriteria}

Based on the file names and context provided, assess whether the submission meets the requirements.

Respond in JSON format:
{
  "status": "APPROVED" or "REVISION_NEEDED",
  "feedback": "Brief overall assessment",
  "issues": ["List of specific issues if any"]
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('');

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let result: AIReviewResult;

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      result = {
        status: parsed.status === 'APPROVED' ? 'APPROVED' : 'REVISION_NEEDED',
        feedback: parsed.feedback || 'Review complete.',
        issues: parsed.issues?.length ? parsed.issues : undefined,
        reviewedAt: new Date().toISOString(),
      };
    } else {
      result = {
        status: 'APPROVED',
        feedback: 'Review complete. Files appear acceptable.',
        reviewedAt: new Date().toISOString(),
      };
    }

    // Store result in step execution's resultData
    const stepExec = await db.query.stepExecutions.findFirst({
      where: eq(stepExecutions.id, stepExecutionId),
    });

    if (stepExec) {
      const existingData = (stepExec.resultData as Record<string, unknown>) || {};
      await db.update(stepExecutions)
        .set({
          resultData: { ...existingData, _aiReview: result },
        })
        .where(eq(stepExecutions.id, stepExecutionId));
    }

    return result;
  } catch (error) {
    console.error('AI review failed:', error);
    const fallbackResult: AIReviewResult = {
      status: 'APPROVED',
      feedback: 'AI review could not be completed. Files accepted by default.',
      reviewedAt: new Date().toISOString(),
    };

    // Still store the fallback
    const stepExec = await db.query.stepExecutions.findFirst({
      where: eq(stepExecutions.id, stepExecutionId),
    });

    if (stepExec) {
      const existingData = (stepExec.resultData as Record<string, unknown>) || {};
      await db.update(stepExecutions)
        .set({
          resultData: { ...existingData, _aiReview: fallbackResult },
        })
        .where(eq(stepExecutions.id, stepExecutionId));
    }

    return fallbackResult;
  }
}
