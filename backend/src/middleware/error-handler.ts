/**
 * Error Handling Middleware
 *
 * Provides consistent error responses across the API.
 */

import { Request, Response, NextFunction } from 'express';

// ============================================================================
// Custom Error Class
// ============================================================================

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: string[]
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ============================================================================
// Error Factories
// ============================================================================

export const Errors = {
  badRequest: (message: string, details?: string[]) =>
    new APIError(400, 'BAD_REQUEST', message, details),

  notFound: (resource: string) =>
    new APIError(404, 'NOT_FOUND', `${resource} not found`),

  validationFailed: (errors: string[]) =>
    new APIError(400, 'VALIDATION_FAILED', 'Request validation failed', errors),

  llmError: (message: string) =>
    new APIError(502, 'LLM_ERROR', message),

  internalError: (message = 'Internal server error') =>
    new APIError(500, 'INTERNAL_ERROR', message),

  sessionNotFound: () =>
    new APIError(404, 'SESSION_NOT_FOUND', 'Session not found'),

  noWorkflow: () =>
    new APIError(400, 'NO_WORKFLOW', 'No workflow exists in this session'),
};

// ============================================================================
// Error Response Type
// ============================================================================

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

// ============================================================================
// Error Handler Middleware
// ============================================================================

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging
  console.error(`[API Error] ${req.method} ${req.path}:`, err.message);

  if (err instanceof APIError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && 'body' in err) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
      },
    };
    res.status(400).json(response);
    return;
  }

  // Unknown error - return generic 500
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
  res.status(500).json(response);
}
