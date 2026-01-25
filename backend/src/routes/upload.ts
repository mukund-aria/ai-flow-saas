/**
 * Upload Routes
 *
 * Handles document/diagram uploads for AI analysis.
 * Supports images (PNG, JPG, GIF, WebP) via Claude Vision API
 * and PDFs via Claude Document API.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler, Errors } from '../middleware/index.js';
import {
  getLLMService,
  getOrCreateSession,
  addUserMessage,
  addAssistantMessage,
  getMessageHistory,
  handleAIResponse,
  storePendingPlan,
} from '../llm/index.js';
import type { ChatResponse } from './types.js';

const router = Router();

// ============================================================================
// Multer Configuration
// ============================================================================

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Use memory storage for base64 conversion
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Supported: PNG, JPG, GIF, WebP, PDF`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /api/chat/upload
 *
 * Upload a document/diagram for AI analysis.
 * The AI will extract workflow information from the image.
 */
router.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
      throw Errors.badRequest('No file uploaded');
    }

    // Extract request parameters
    const sessionId = req.body.sessionId as string | undefined;
    const prompt = req.body.prompt as string | undefined;
    const preview = req.body.preview !== 'false'; // Default to true

    // Get or create session
    const session = getOrCreateSession(sessionId);

    // Determine file type
    const isPDF = file.mimetype === 'application/pdf';
    const uploadType = isPDF ? 'document' : 'diagram';

    // Add user message for the upload
    addUserMessage(session, `[Uploaded ${uploadType}: ${file.originalname}]${prompt ? `\n\nContext: ${prompt}` : ''}`);

    // Get conversation history
    const history = getMessageHistory(session);
    const historyForLLM = history.slice(0, -1);

    // Convert file to base64
    const fileData = file.buffer.toString('base64');

    // Call appropriate API based on file type
    const llmService = getLLMService();
    let llmResult;

    if (isPDF) {
      // Use document analysis for PDFs
      llmResult = await llmService.analyzeDocument(
        fileData,
        prompt,
        historyForLLM,
        session.workflow,
        {}
      );
    } else {
      // Use vision API for images
      const mediaType = file.mimetype as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';
      llmResult = await llmService.analyzeImage(
        fileData,
        mediaType,
        prompt,
        historyForLLM,
        session.workflow,
        {}
      );
    }

    // Handle LLM failure
    if (!llmResult.success || !llmResult.response) {
      addAssistantMessage(session, llmResult.rawContent || '', undefined, llmResult.error);
      throw Errors.llmError(llmResult.error || `Failed to analyze ${uploadType}`);
    }

    // Process AI response (don't apply if preview mode)
    const handlerResult = await handleAIResponse(llmResult.response, session, !preview);

    // Add assistant message
    addAssistantMessage(
      session,
      llmResult.rawContent || '',
      llmResult.response,
      handlerResult.success ? undefined : handlerResult.errors?.join('; ')
    );

    // If preview mode and we have a workflow, store as pending plan
    let planId: string | undefined;
    if (preview && handlerResult.workflow) {
      const plan = storePendingPlan(session, handlerResult.workflow, handlerResult.message);
      planId = plan.id;
    }

    // Build response
    const response: ChatResponse = {
      success: handlerResult.success,
      sessionId: session.id,
      response: {
        mode: llmResult.response.mode,
        message: handlerResult.message,
        workflow: handlerResult.workflow,
        isPreview: preview && !!handlerResult.workflow,
        planId,
        clarifications: handlerResult.clarifications,
        errors: handlerResult.errors,
      },
      usage: llmResult.usage,
    };

    res.status(200).json(response);
  })
);

/**
 * Multer error handler middleware
 */
router.use((err: Error, _req: Request, res: Response, next: (err?: Error) => void) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds limit. Maximum allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }
  next(err);
});

export default router;
