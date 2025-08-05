/**
 * Global Error Handler Middleware
 * Centralized error handling with proper logging and response formatting
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/logger';
import { config } from '@/config/environment';

// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public details: any;

  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, code: string) {
    super(message, 422, code);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class ExternalServiceError extends AppError {
  public service: string;

  constructor(service: string, message: string) {
    super(`External service error (${service}): ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// Error response interface
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
    stack?: string;
  };
}

// Check if error is operational (expected) or programming error
const isOperationalError = (error: any): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Map common errors to proper HTTP status codes
const mapErrorToStatusCode = (error: any): number => {
  // Prisma errors
  if (error.code === 'P2002') return 409; // Unique constraint violation
  if (error.code === 'P2025') return 404; // Record not found
  if (error.code?.startsWith('P2')) return 400; // Other Prisma client errors

  // Validation errors
  if (error.name === 'ValidationError') return 400;
  if (error.name === 'CastError') return 400;

  // JWT errors
  if (error.name === 'JsonWebTokenError') return 401;
  if (error.name === 'TokenExpiredError') return 401;

  // Multer errors (file upload)
  if (error.code === 'LIMIT_FILE_SIZE') return 413;
  if (error.code === 'LIMIT_UNEXPECTED_FILE') return 400;

  // Default to 500 for unknown errors
  return error.statusCode || 500;
};

// Format error message for specific error types
const formatErrorMessage = (error: any): string => {
  // Prisma errors
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    return `${field} already exists`;
  }
  if (error.code === 'P2025') {
    return 'Record not found';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return 'Invalid token';
  }
  if (error.name === 'TokenExpiredError') {
    return 'Token expired';
  }

  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return 'File too large';
  }

  return error.message || 'Internal server error';
};

// Get error code for response
const getErrorCode = (error: any): string => {
  if (error.code) return error.code;
  if (error.name) return error.name.toUpperCase();
  return 'INTERNAL_SERVER_ERROR';
};

// Log error with appropriate level
const logError = (error: any, req: Request): void => {
  const context = {
    requestId: req.headers['x-request-id'] as string,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
    body: req.method !== 'GET' ? req.body : undefined
  };

  if (isOperationalError(error)) {
    // Log operational errors as warnings
    logger.warn('Operational error occurred', {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      }
    });
  } else {
    // Log programming errors as errors
    logger.logError(error, context);
  }
};

// Send error response
const sendErrorResponse = (
  res: Response,
  error: any,
  statusCode: number,
  requestId?: string
): void => {
  const errorCode = getErrorCode(error);
  const message = formatErrorMessage(error);

  const errorResponse: ErrorResponse = {
    error: {
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId })
    }
  };

  // Add error details for validation errors
  if (error instanceof ValidationError && error.details) {
    errorResponse.error.details = error.details;
  }

  // Add stack trace in development
  if (config.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Main error handler middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Don't handle if response already sent
  if (res.headersSent) {
    return next(error);
  }

  const requestId = req.headers['x-request-id'] as string;
  const statusCode = mapErrorToStatusCode(error);

  // Log the error
  logError(error, req);

  // Send error response
  sendErrorResponse(res, error, statusCode, requestId);

  // For critical errors in production, you might want to:
  // 1. Send alert to monitoring service
  // 2. Trigger incident response
  // 3. Scale resources if needed
  
  if (!isOperationalError(error) && config.NODE_ENV === 'production') {
    // Critical error - could trigger alerts here
    logger.error('Critical error occurred', {
      error: error.message,
      stack: error.stack,
      requestId
    });
  }
};

// Async error wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
  next(error);
};

// Validation error helper
export const createValidationError = (details: any): ValidationError => {
  return new ValidationError('Validation failed', details);
};

// Business rule violation helper
export const createBusinessRuleError = (rule: string, message: string): BusinessRuleError => {
  return new BusinessRuleError(message, `BUSINESS_RULE_${rule.toUpperCase()}`);
};

// External service error helper
export const createExternalServiceError = (service: string, originalError: any): ExternalServiceError => {
  const message = originalError.message || 'Service unavailable';
  return new ExternalServiceError(service, message);
};

export default errorHandler;