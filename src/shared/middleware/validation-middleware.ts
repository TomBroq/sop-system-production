/**
 * Validation Middleware
 * Request validation using Zod schemas with business rule enforcement
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/shared/middleware/error-handler';
import { logger } from '@/shared/logger';
import { config } from '@/config/environment';

// Validation target types
type ValidationTarget = 'body' | 'params' | 'query' | 'headers';

// Custom validation error formatter
interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  received?: any;
}

// Format Zod errors for API response
const formatZodErrors = (error: ZodError): ValidationErrorDetail[] => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    received: err.received
  }));
};

// Generic validation middleware factory
export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate);
      
      // Replace the original data with validated data
      (req as any)[target] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = formatZodErrors(error);
        
        logger.warn('Validation failed', {
          target,
          errors: validationErrors,
          requestId: req.headers['x-request-id'] as string,
          path: req.originalUrl,
          method: req.method
        });
        
        throw new ValidationError('Request validation failed', validationErrors);
      }
      next(error);
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Email validation
  email: z.string().email('Invalid email format').toLowerCase(),
  
  // Company size validation (from PRD)
  companySize: z.enum(['micro', 'small', 'medium', 'large'], {
    errorMap: () => ({ message: 'Company size must be micro, small, medium, or large' })
  }),
  
  // Client status validation (workflow states from PRD)
  clientStatus: z.enum([
    'created', 'form_sent', 'responses_received', 'processing_ai', 
    'sops_generated', 'proposal_ready', 'proposal_sent', 'closed'
  ]),
  
  // Pagination validation
  pagination: z.object({
    page: z.string().transform(Number).refine(n => n > 0, 'Page must be positive').default('1'),
    limit: z.string().transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').default('10'),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),
  
  // Date range validation
  dateRange: z.object({
    startDate: z.string().datetime('Invalid start date format').optional(),
    endDate: z.string().datetime('Invalid end date format').optional()
  }).refine(data => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, 'Start date must be before end date')
};

// Client validation schemas
export const clientSchemas = {
  create: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long'),
    industry: z.string().min(1, 'Industry is required'),
    companySize: commonSchemas.companySize,
    subindustry: z.string().max(100).optional(),
    yearsOperation: z.number().int().min(0).max(200).optional(),
    employeeCount: z.number().int().min(1).max(1000000).optional(),
    annualRevenue: z.number().positive().optional(),
    contactEmail: commonSchemas.email
  }),
  
  update: z.object({
    name: z.string().min(2).max(255).optional(),
    industry: z.string().min(1).optional(),
    companySize: commonSchemas.companySize.optional(),
    subindustry: z.string().max(100).optional(),
    yearsOperation: z.number().int().min(0).max(200).optional(),
    employeeCount: z.number().int().min(1).max(1000000).optional(),
    annualRevenue: z.number().positive().optional(),
    contactEmail: commonSchemas.email.optional()
  }),
  
  params: z.object({
    id: commonSchemas.uuid
  }),
  
  query: z.object({
    ...commonSchemas.pagination.shape,
    industry: z.string().optional(),
    companySize: commonSchemas.companySize.optional(),
    status: commonSchemas.clientStatus.optional(),
    search: z.string().max(100).optional()
  })
};

// Form validation schemas  
export const formSchemas = {
  generate: z.object({
    clientId: commonSchemas.uuid,
    forceRegenerate: z.boolean().default(false)
  }),
  
  webhook: z.object({
    eventId: z.string().min(1),
    eventType: z.enum(['form.completed', 'form.started', 'form.updated']),
    formId: z.string().min(1),
    submissionId: z.string().min(1),
    data: z.object({
      responses: z.array(z.object({
        questionId: z.string(),
        question: z.string(),
        answer: z.any()
      })),
      metadata: z.object({
        submittedAt: z.string().datetime(),
        completionTime: z.number().positive(),
        ipAddress: z.string().ip().optional(),
        userAgent: z.string().optional()
      })
    })
  }),
  
  params: z.object({
    id: commonSchemas.uuid
  })
};

// AI processing validation schemas
export const aiProcessingSchemas = {
  process: z.object({
    clientId: commonSchemas.uuid,
    formResponseId: commonSchemas.uuid,
    priority: z.enum(['low', 'normal', 'high']).default('normal'),
    config: z.object({
      industryContext: z.record(z.any()).optional(),
      customPrompts: z.array(z.string()).optional()
    }).optional()
  }),
  
  params: z.object({
    id: commonSchemas.uuid
  })
};

// SOP validation schemas
export const sopSchemas = {
  update: z.object({
    objective: z.string().min(10, 'Objective must be at least 10 characters').optional(),
    responsibleRoles: z.array(z.string().min(1)).min(1, 'At least one responsible role required').optional(),
    inputs: z.array(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      required: z.boolean().default(true)
    })).min(1, 'At least one input required').optional(),
    steps: z.array(z.object({
      order: z.number().int().positive(),
      description: z.string().min(1),
      responsible: z.string().min(1),
      estimatedTime: z.number().positive().optional(),
      dependencies: z.array(z.number().int()).optional()
    })).min(3, 'At least 3 steps required').optional(), // RN1 from validation rules
    outputs: z.array(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      format: z.string().optional()
    })).min(1, 'At least one output required').optional(),
    approved: z.boolean().optional(),
    notes: z.string().max(1000).optional()
  }).refine(data => {
    // Business rule: SOPs with >20 steps should be flagged (RN3 from validation rules)
    if (data.steps && data.steps.length > 20) {
      logger.warn('SOP with more than 20 steps submitted', {
        stepCount: data.steps.length,
        suggestion: 'Consider breaking down into sub-processes'
      });
    }
    return true;
  }, 'SOP validation passed'),
  
  params: z.object({
    id: commonSchemas.uuid,
    clientId: commonSchemas.uuid.optional()
  })
};

// Proposal validation schemas
export const proposalSchemas = {
  generate: z.object({
    clientId: commonSchemas.uuid,
    includeROIAnalysis: z.boolean().default(true),
    customizations: z.object({
      executiveSummary: z.string().max(2000).optional(),
      priorityAdjustments: z.array(z.object({
        processId: commonSchemas.uuid,
        newPriority: z.enum(['low', 'medium', 'high'])
      })).optional(),
      budgetConstraints: z.array(z.object({
        category: z.string(),
        maxAmount: z.number().positive()
      })).optional()
    }).optional()
  }),
  
  params: z.object({
    id: commonSchemas.uuid
  })
};

// User validation schemas
export const userSchemas = {
  register: z.object({
    email: commonSchemas.email,
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter') 
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    role: z.enum(['consultant', 'client']).default('consultant')
  }),
  
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required')
  }),
  
  updateProfile: z.object({
    name: z.string().min(2).max(100).optional(),
    timezone: z.string().optional(),
    language: z.enum(['es', 'en']).optional()
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')  
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
  })
};

// Business rule validation middleware
export const validateBusinessRules = {
  // Validate question count based on company size (RN1 from RF002)
  questionCount: (req: Request, res: Response, next: NextFunction): void => {
    const { companySize, questionCount } = req.body;
    
    if (companySize && questionCount) {
      const rules = config.businessRules.questionCountByCompanySize[companySize as keyof typeof config.businessRules.questionCountByCompanySize];
      
      if (questionCount < rules.min || questionCount > rules.max) {
        throw new ValidationError(
          `Question count for ${companySize} companies must be between ${rules.min} and ${rules.max}`,
          {
            field: 'questionCount',
            expected: `${rules.min}-${rules.max}`,
            received: questionCount
          }
        );
      }
    }
    
    next();
  },
  
  // Validate minimum processes per analysis (RN3 from validation rules)
  processCount: (req: Request, res: Response, next: NextFunction): void => {
    const { processCount } = req.body;
    
    if (processCount !== undefined && processCount < config.MIN_PROCESSES_PER_ANALYSIS) {
      logger.warn('Analysis with insufficient processes', {
        processCount,
        minimum: config.MIN_PROCESSES_PER_ANALYSIS,
        clientId: req.body.clientId
      });
      
      // Don't throw error, but log for manual review
      logger.business({
        event: 'low_process_count_alert',
        clientId: req.body.clientId,
        value: processCount,
        metadata: {
          minimum: config.MIN_PROCESSES_PER_ANALYSIS,
          requiresManualReview: true
        }
      });
    }
    
    next();
  },
  
  // Validate form expiration (business rule from PRD)
  formExpiration: (req: Request, res: Response, next: NextFunction): void => {
    const { expiresAt } = req.body;
    
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      const maxExpirationDate = new Date(now.getTime() + (config.MAX_FORM_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
      
      if (expirationDate > maxExpirationDate) {
        throw new ValidationError(
          `Form expiration cannot be more than ${config.MAX_FORM_EXPIRY_DAYS} days from now`,
          {
            field: 'expiresAt',
            maxDate: maxExpirationDate.toISOString(),
            received: expirationDate.toISOString()
          }
        );
      }
    }
    
    next();
  }
};

// File upload validation
export const validateFileUpload = (
  allowedTypes: string[] = config.upload.allowedTypes,
  maxSizeMB: number = config.upload.maxSizeMB
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const files = req.files as any;
    
    if (!files || files.length === 0) {
      return next();
    }
    
    // Validate each file
    for (const file of Array.isArray(files) ? files : [files]) {
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        throw new ValidationError(
          `File type ${file.mimetype} not allowed`,
          {
            field: 'file',
            allowedTypes,
            received: file.mimetype
          }
        );
      }
      
      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new ValidationError(
          `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds limit of ${maxSizeMB}MB`,
          {
            field: 'file',
            maxSize: `${maxSizeMB}MB`,
            received: `${Math.round(file.size / 1024 / 1024)}MB`
          }
        );
      }
    }
    
    next();
  };
};

// Sanitization middleware
export const sanitize = {
  // Remove potentially dangerous HTML/script tags
  html: (req: Request, res: Response, next: NextFunction): void => {
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/<[^>]*>/g, '');
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      return obj;
    };
    
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    next();
  },
  
  // Trim whitespace from string fields
  trim: (req: Request, res: Response, next: NextFunction): void => {
    const trimObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.trim();
      }
      if (Array.isArray(obj)) {
        return obj.map(trimObject);
      }
      if (obj && typeof obj === 'object') {
        const trimmed: any = {};
        for (const [key, value] of Object.entries(obj)) {
          trimmed[key] = trimObject(value);
        }
        return trimmed;
      }
      return obj;
    };
    
    if (req.body) {
      req.body = trimObject(req.body);
    }
    
    next();
  }
};

export default validate;