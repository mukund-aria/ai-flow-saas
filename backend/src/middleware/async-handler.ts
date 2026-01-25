/**
 * Async Handler Middleware
 *
 * Wraps async route handlers to automatically catch errors
 * and pass them to the error handler.
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrap an async route handler to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
