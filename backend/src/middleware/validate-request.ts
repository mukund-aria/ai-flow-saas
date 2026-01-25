/**
 * Request Validation Middleware
 *
 * Simple validation for request body and params.
 */

import { Request, Response, NextFunction } from 'express';
import { Errors } from './error-handler.js';

// ============================================================================
// Validation Rules
// ============================================================================

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'object' | 'boolean' | 'number';
  minLength?: number;
  maxLength?: number;
}

// ============================================================================
// Body Validation
// ============================================================================

/**
 * Validate request body fields
 */
export function validateBody(rules: ValidationRule[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      // Skip type checks if value not provided
      if (value === undefined || value === null) {
        continue;
      }

      // Check type
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${rule.field} must be a string`);
      }
      if (rule.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
        errors.push(`${rule.field} must be an object`);
      }
      if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${rule.field} must be a boolean`);
      }
      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${rule.field} must be a number`);
      }

      // Check length constraints for strings
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.field} cannot exceed ${rule.maxLength} characters`);
        }
      }
    }

    if (errors.length > 0) {
      throw Errors.validationFailed(errors);
    }

    next();
  };
}

// ============================================================================
// Params Validation
// ============================================================================

/**
 * Validate URL parameter exists
 */
export function validateParams(paramName: string, pattern?: RegExp) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const rawValue = req.params[paramName];
    // Handle case where Express might return string[] for repeated params
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    if (!value) {
      throw Errors.badRequest(`${paramName} parameter is required`);
    }

    if (pattern && !pattern.test(value)) {
      throw Errors.badRequest(`Invalid ${paramName} format`);
    }

    next();
  };
}
