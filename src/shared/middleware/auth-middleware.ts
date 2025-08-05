/**
 * Authentication & Authorization Middleware
 * JWT-based authentication with role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config/environment';
import { logger } from '@/shared/logger';
import { UnauthorizedError, ForbiddenError } from '@/shared/middleware/error-handler';

const prisma = new PrismaClient();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'admin' | 'senior_consultant' | 'consultant' | 'client';
        isActive: boolean;
      };
    }
  }
}

// JWT payload interface
interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Token utilities
export class TokenService {
  static generateAccessToken(user: any): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
      issuer: config.APP_NAME,
      audience: 'sistema-sop-users'
    });
  }

  static generateRefreshToken(user: any): string {
    const payload = {
      id: user.id,
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
      issuer: config.APP_NAME,
      audience: 'sistema-sop-refresh'
    });
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.JWT_SECRET, {
        issuer: config.APP_NAME,
        audience: 'sistema-sop-users'
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET, {
        issuer: config.APP_NAME,
        audience: 'sistema-sop-refresh'
      }) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}

// Password utilities
export class PasswordService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.BCRYPT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Authentication middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const payload = TokenService.verifyAccessToken(token);

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account deactivated');
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Add user to request
    req.user = user;

    // Log authentication for audit
    logger.audit('User authenticated', {
      action: 'user_authenticated',
      userId: user.id,
      clientId: undefined,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        email: user.email,
        role: user.role,
        requestId: req.headers['x-request-id']
      },
      sensitiveData: false
    });

    next();

  } catch (error) {
    // Log failed authentication attempt
    logger.securityEvent('authentication_failed', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'] as string,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    next(error);
  }
};

// Role-based authorization middleware
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.securityEvent('authorization_denied', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          path: req.originalUrl,
          method: req.method,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        throw new ForbiddenError(`Role ${req.user.role} not authorized for this operation`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Resource ownership middleware (for data access control)
export const authorizeResourceOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Admins and senior consultants can access all resources
      if (['admin', 'senior_consultant'].includes(req.user.role)) {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        throw new ForbiddenError('Resource ID not provided');
      }

      // For consultants, check if they created the resource
      if (req.user.role === 'consultant') {
        // This would need to be adapted based on the specific resource type
        // For clients, check if the consultant created the client
        if (req.route?.path.includes('/clients')) {
          const client = await prisma.client.findUnique({
            where: { id: resourceId },
            select: { createdBy: true }
          });

          if (!client || client.createdBy !== req.user.id) {
            throw new ForbiddenError('Access denied to this resource');
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Client self-access middleware (for clients accessing their own data)
export const authorizeClientSelfAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Only apply to client role
    if (req.user.role !== 'client') {
      return next();
    }

    const clientId = req.params.clientId || req.params.id;
    if (!clientId) {
      throw new ForbiddenError('Client ID not provided');
    }

    // Clients can only access their own data
    // This assumes client users have their client ID as their user ID
    // You might need to adjust this logic based on your user-client relationship
    if (req.user.id !== clientId) {
      logger.securityEvent('unauthorized_client_access', {
        userId: req.user.id,
        attemptedClientId: clientId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      throw new ForbiddenError('Clients can only access their own data');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// API key middleware for webhook endpoints
export const webhookAuth = (secretHeaderName: string = 'x-webhook-signature') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const signature = req.headers[secretHeaderName] as string;
      if (!signature) {
        throw new UnauthorizedError('Webhook signature required');
      }

      // For Tally webhooks, verify signature
      if (secretHeaderName === 'x-tally-signature') {
        const expectedSignature = config.TALLY_WEBHOOK_SECRET;
        if (signature !== expectedSignature) {
          logger.securityEvent('invalid_webhook_signature', {
            service: 'tally',
            signature: signature.substring(0, 10) + '...',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });
          
          throw new UnauthorizedError('Invalid webhook signature');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting by user role
export const getRateLimitByRole = (req: Request): number => {
  const user = req.user;
  if (!user) return config.RATE_LIMIT_MAX_REQUESTS;

  switch (user.role) {
    case 'admin':
      return config.RATE_LIMIT_ADMIN_MAX;
    case 'senior_consultant':
      return 500;
    case 'consultant':
      return 200;
    case 'client':
      return 50; // Clients have lower limits
    default:
      return config.RATE_LIMIT_MAX_REQUESTS;
  }
};

// Session management
export class SessionService {
  static async createSession(userId: string, ipAddress: string, userAgent: string): Promise<string> {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session in Redis or database
    // For now, we'll just return the session ID
    // In production, you'd want to store this with expiration
    
    logger.audit('Session created', {
      action: 'session_created',
      userId,
      clientId: undefined,
      ipAddress,
      userAgent,
      details: { sessionId },
      sensitiveData: false
    });

    return sessionId;
  }

  static async validateSession(sessionId: string): Promise<boolean> {
    // Validate session exists and is not expired
    // Implementation depends on your session storage strategy
    return true;
  }

  static async destroySession(sessionId: string, userId: string): Promise<void> {
    // Remove session from storage
    logger.audit('Session destroyed', {
      action: 'session_destroyed',
      userId,
      clientId: undefined,
      ipAddress: undefined,
      userAgent: undefined,
      details: { sessionId },
      sensitiveData: false
    });
  }
}

export default authMiddleware;