/**
 * Audit Middleware for LGPD Compliance
 * Logs all sensitive data access and operations for compliance purposes
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define which routes/operations require audit logging
const SENSITIVE_OPERATIONS = {
  // Client data access
  'GET:/api/v1/clients': 'client_list_access',
  'GET:/api/v1/clients/:id': 'client_detail_access',
  'POST:/api/v1/clients': 'client_create',
  'PUT:/api/v1/clients/:id': 'client_update',
  'DELETE:/api/v1/clients/:id': 'client_delete',

  // Form responses (highly sensitive)
  'GET:/api/v1/forms/:id/responses': 'form_response_access',
  'POST:/api/v1/forms/:id/responses': 'form_response_create',

  // Commercial proposals
  'GET:/api/v1/proposals/:id': 'proposal_access',
  'POST:/api/v1/proposals': 'proposal_create',
  'GET:/api/v1/proposals/:id/pdf': 'proposal_download',

  // SOP data
  'GET:/api/v1/sops/client/:clientId': 'sop_client_access',
  'PUT:/api/v1/sops/:id': 'sop_update',

  // Data export/deletion (LGPD rights)
  'POST:/api/v1/clients/:id/export': 'data_export',
  'DELETE:/api/v1/clients/:id/data': 'data_deletion'
};

// Define which entity types contain sensitive data
const SENSITIVE_ENTITIES = [
  'clients',
  'form_responses', 
  'commercial_proposals',
  'data_processing_records'
];

// Extract entity type and ID from request
const extractEntityInfo = (req: Request): { entityType?: string; entityId?: string } => {
  const path = req.route?.path || req.path;
  
  // Try to extract from common patterns
  if (path.includes('/clients/')) {
    return {
      entityType: 'client',
      entityId: req.params.id || req.params.clientId
    };
  }
  
  if (path.includes('/forms/')) {
    return {
      entityType: 'form',
      entityId: req.params.id || req.params.formId
    };
  }
  
  if (path.includes('/proposals/')) {
    return {
      entityType: 'proposal',
      entityId: req.params.id || req.params.proposalId
    };
  }
  
  if (path.includes('/sops/')) {
    return {
      entityType: 'sop',
      entityId: req.params.id || req.params.sopId
    };
  }

  return {};
};

// Check if request contains sensitive data in body
const containsSensitiveData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;

  const sensitiveFields = [
    'email', 'phone', 'taxId', 'bankAccount', 'personalData',
    'financialData', 'responses', 'rawResponses', 'processedResponses',
    'contactEmail', 'clientFeedback', 'notes'
  ];

  const dataStr = JSON.stringify(data).toLowerCase();
  return sensitiveFields.some(field => dataStr.includes(field));
};

// Generate operation code from method and path
const getOperationCode = (method: string, path: string): string => {
  const normalizedPath = path.replace(/\/\d+/g, '/:id'); // Replace IDs with :id
  const key = `${method}:${normalizedPath}`;
  return SENSITIVE_OPERATIONS[key as keyof typeof SENSITIVE_OPERATIONS] || 'unknown_operation';
};

// Audit middleware
export const auditMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  
  // Extract request information
  const method = req.method;
  const path = req.route?.path || req.path;
  const operationCode = getOperationCode(method, path);
  const { entityType, entityId } = extractEntityInfo(req);
  
  // Check if this operation needs audit logging
  const needsAudit = 
    SENSITIVE_OPERATIONS[`${method}:${path}` as keyof typeof SENSITIVE_OPERATIONS] ||
    SENSITIVE_ENTITIES.some(entity => path.includes(entity)) ||
    containsSensitiveData(req.body);

  if (!needsAudit) {
    return next();
  }

  // Extract user information
  const user = (req as any).user;
  const userId = user?.id;
  const userRole = user?.role;

  // Extract client information if available
  const clientId = req.params.clientId || req.params.id || req.body?.clientId;

  // Request audit information
  const auditInfo = {
    requestId: req.headers['x-request-id'] as string,
    method,
    path: req.originalUrl,
    operationCode,
    entityType,
    entityId,
    userId,
    userRole,
    clientId,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date(),
    sensitiveData: containsSensitiveData(req.body),
    requestBody: method !== 'GET' ? (containsSensitiveData(req.body) ? '[REDACTED]' : req.body) : undefined
  };

  // Log audit event for request start
  logger.audit('Sensitive operation started', {
    action: `${operationCode}_start`,
    userId,
    clientId,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    details: {
      method,
      path: req.originalUrl,
      entityType,
      entityId,
      requestId: auditInfo.requestId
    },
    sensitiveData: auditInfo.sensitiveData
  });

  // Store audit info in request for completion logging
  (req as any).auditInfo = auditInfo;

  // Override res.json to capture response
  const originalJson = res.json;
  let responseData: any;
  
  res.json = function(data: any) {
    responseData = data;
    return originalJson.call(this, data);
  };

  // Continue to next middleware
  next();

  // Log completion after response is sent
  res.on('finish', async () => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    try {
      // Create audit log entry in database
      await prisma.auditLog.create({
        data: {
          action: operationCode,
          entityType: entityType || 'unknown',
          entityId: entityId || null,
          userId: userId || null,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || null,
          details: {
            method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            duration,
            requestId: auditInfo.requestId,
            success: res.statusCode < 400
          },
          sensitiveDataAccessed: auditInfo.sensitiveData,
          requestId: auditInfo.requestId,
          sessionId: (req as any).sessionId
        }
      });

      // Log audit completion
      logger.audit('Sensitive operation completed', {
        action: `${operationCode}_complete`,
        userId,
        clientId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          duration,
          requestId: auditInfo.requestId,
          success: res.statusCode < 400,
          responseSize: responseData ? JSON.stringify(responseData).length : 0
        },
        sensitiveData: auditInfo.sensitiveData
      });

      // Log business metric for audit compliance
      logger.business({
        event: 'audit_logged',
        userId,
        clientId,
        metadata: {
          operation: operationCode,
          duration,
          success: res.statusCode < 400
        }
      });

    } catch (error) {
      logger.error('Failed to create audit log entry', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: auditInfo.requestId,
        operation: operationCode
      });
    }
  });
};

// LGPD Data Subject Rights Handler
export class LGPDDataSubjectRights {
  // Log data access request (Article 15 - Right of access)
  static async logDataAccess(
    subjectId: string,
    requesterId: string,
    dataTypes: string[],
    ipAddress: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action: 'data_access_request',
        entityType: 'client',
        entityId: subjectId,
        userId: requesterId,
        ipAddress,
        details: {
          dataTypes,
          legalBasis: 'subject_access_request',
          gdprArticle: 'Article 15'
        },
        sensitiveDataAccessed: true
      }
    });

    logger.audit('LGPD data access request', {
      action: 'data_access_request',
      userId: requesterId,
      clientId: subjectId,
      ipAddress,
      details: {
        dataTypes,
        legalBasis: 'subject_access_request'
      },
      sensitiveData: true
    });
  }

  // Log data rectification (Article 16 - Right to rectification)
  static async logDataRectification(
    subjectId: string,
    requesterId: string,
    changedFields: string[],
    ipAddress: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action: 'data_rectification',
        entityType: 'client',
        entityId: subjectId,
        userId: requesterId,
        ipAddress,
        details: {
          changedFields,
          legalBasis: 'data_rectification_request',
          gdprArticle: 'Article 16'
        },
        sensitiveDataAccessed: true
      }
    });

    logger.audit('LGPD data rectification', {
      action: 'data_rectification',
      userId: requesterId,
      clientId: subjectId,
      ipAddress,
      details: {
        changedFields,
        legalBasis: 'data_rectification_request'
      },
      sensitiveData: true
    });
  }

  // Log data erasure (Article 17 - Right to be forgotten)
  static async logDataErasure(
    subjectId: string,
    requesterId: string,
    deletedEntities: string[],
    ipAddress: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action: 'data_erasure',
        entityType: 'client',
        entityId: subjectId,
        userId: requesterId,
        ipAddress,
        details: {
          deletedEntities,
          legalBasis: 'right_to_be_forgotten',
          gdprArticle: 'Article 17'
        },
        sensitiveDataAccessed: true
      }
    });

    logger.audit('LGPD data erasure', {
      action: 'data_erasure',
      userId: requesterId,
      clientId: subjectId,
      ipAddress,
      details: {
        deletedEntities,
        legalBasis: 'right_to_be_forgotten'
      },
      sensitiveData: true
    });
  }

  // Log data portability (Article 20 - Right to data portability)
  static async logDataExport(
    subjectId: string,
    requesterId: string,
    exportedData: string[],
    format: string,
    ipAddress: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action: 'data_export',
        entityType: 'client',
        entityId: subjectId,
        userId: requesterId,
        ipAddress,
        details: {
          exportedData,
          format,
          legalBasis: 'data_portability_request',
          gdprArticle: 'Article 20'
        },
        sensitiveDataAccessed: true
      }
    });

    logger.audit('LGPD data export', {
      action: 'data_export',
      userId: requesterId,
      clientId: subjectId,
      ipAddress,
      details: {
        exportedData,
        format,
        legalBasis: 'data_portability_request'
      },
      sensitiveData: true
    });
  }

  // Log consent withdrawal
  static async logConsentWithdrawal(
    subjectId: string,
    requesterId: string,
    consentTypes: string[],
    ipAddress: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action: 'consent_withdrawal',
        entityType: 'client',
        entityId: subjectId,
        userId: requesterId,
        ipAddress,
        details: {
          consentTypes,
          legalBasis: 'consent_withdrawal',
          gdprArticle: 'Article 7'
        },
        sensitiveDataAccessed: false
      }
    });

    logger.audit('LGPD consent withdrawal', {
      action: 'consent_withdrawal',
      userId: requesterId,
      clientId: subjectId,
      ipAddress,
      details: {
        consentTypes,
        legalBasis: 'consent_withdrawal'
      },
      sensitiveData: false
    });
  }
}

export default auditMiddleware;