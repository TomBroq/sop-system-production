/**
 * Metrics Collection Middleware
 * Collects performance and business metrics for monitoring and optimization
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/logger';
import { config } from '@/config/environment';

const prisma = new PrismaClient();

// Metrics interface
interface RequestMetrics {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userId?: string;
  clientId?: string;
  responseSize: number;
  timestamp: Date;
}

// Performance targets from PRD
const PERFORMANCE_TARGETS = {
  api_response_time: 3000, // <3s for queries
  form_generation_time: 30000, // <30s
  ai_processing_time: 120000, // <2min
  sop_generation_time: 10000, // <10s
  pdf_generation_time: 5000, // <5s
  webhook_processing_time: 5000 // <5s
};

// Route categorization for metrics
const ROUTE_CATEGORIES = {
  // Client operations
  'GET:/api/v1/clients': 'client_list',
  'GET:/api/v1/clients/:id': 'client_detail',
  'POST:/api/v1/clients': 'client_create',
  'PUT:/api/v1/clients/:id': 'client_update',

  // Form operations
  'POST:/api/v1/forms/generate': 'form_generation',
  'GET:/api/v1/forms/:id/status': 'form_status',
  'POST:/api/v1/forms/webhook': 'webhook_processing',

  // AI processing
  'POST:/api/v1/ai-processing/process': 'ai_processing',
  'GET:/api/v1/ai-processing/jobs/:id': 'ai_job_status',

  // SOP operations
  'GET:/api/v1/sops/client/:clientId': 'sop_list',
  'PUT:/api/v1/sops/:id': 'sop_update',

  // Proposal operations
  'POST:/api/v1/proposals/generate': 'proposal_generation',
  'GET:/api/v1/proposals/:id/pdf': 'pdf_download'
};

// Get metric type based on route
const getMetricType = (method: string, path: string): string => {
  const normalizedPath = path.replace(/\/[a-f\d-]{36}/gi, '/:id'); // Replace UUIDs with :id
  const key = `${method}:${normalizedPath}`;
  return ROUTE_CATEGORIES[key as keyof typeof ROUTE_CATEGORIES] || 'api_response_time';
};

// Check if response time exceeds target
const exceedsTarget = (metricType: string, duration: number): boolean => {
  const target = PERFORMANCE_TARGETS[metricType as keyof typeof PERFORMANCE_TARGETS];
  return target ? duration > target : false;
};

// Metrics collection middleware
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  // Store start time in request
  (req as any).startTime = startTime;

  // Continue to next middleware
  next();

  // Collect metrics after response is sent
  res.on('finish', async () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const metricType = getMetricType(req.method, req.route?.path || req.path);

    const metrics: RequestMetrics = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      clientId: extractClientId(req),
      responseSize: parseInt(res.get('Content-Length') || '0'),
      timestamp: new Date(startTime)
    };

    try {
      // Store metrics in database
      await prisma.systemMetric.create({
        data: {
          metricType: metricType as any,
          valueMs: duration,
          clientId: metrics.clientId,
          additionalContext: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            responseSize: metrics.responseSize,
            userId: metrics.userId,
            requestId
          },
          environment: config.NODE_ENV
        }
      });

      // Log performance metric
      logger.performance({
        metric: metricType,
        value: duration,
        unit: 'ms',
        clientId: metrics.clientId,
        additionalContext: {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          userId: metrics.userId
        }
      });

      // Alert if performance target exceeded
      if (exceedsTarget(metricType, duration)) {
        logger.warn('Performance target exceeded', {
          metric: metricType,
          duration,
          target: PERFORMANCE_TARGETS[metricType as keyof typeof PERFORMANCE_TARGETS],
          requestId,
          path: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode
        });

        // Log business impact if critical endpoint is slow
        if (['form_generation', 'ai_processing', 'proposal_generation'].includes(metricType)) {
          logger.business({
            event: 'performance_degradation',
            clientId: metrics.clientId,
            userId: metrics.userId,
            metadata: {
              metric: metricType,
              duration,
              target: PERFORMANCE_TARGETS[metricType as keyof typeof PERFORMANCE_TARGETS]
            }
          });
        }
      }

      // Log business events for key operations
      await logBusinessEvents(req, res, metrics);

    } catch (error) {
      logger.error('Failed to collect metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
        metricType
      });
    }
  });
};

// Extract client ID from request
const extractClientId = (req: Request): string | undefined => {
  return req.params.clientId || 
         req.params.id || 
         req.body?.clientId || 
         req.query?.clientId as string;
};

// Log business events based on request
const logBusinessEvents = async (
  req: Request, 
  res: Response, 
  metrics: RequestMetrics
): Promise<void> => {
  const { method, path, statusCode } = metrics;
  const success = statusCode < 400;

  // Client creation
  if (method === 'POST' && path.includes('/clients') && success) {
    logger.business({
      event: 'client_created',
      clientId: metrics.clientId,
      userId: metrics.userId,
      metadata: {
        duration: metrics.duration,
        industry: req.body?.industry
      }
    });
  }

  // Form generation
  if (method === 'POST' && path.includes('/forms/generate') && success) {
    logger.business({
      event: 'form_generated',
      clientId: metrics.clientId,
      userId: metrics.userId,
      metadata: {
        duration: metrics.duration,
        questionCount: req.body?.questionCount
      }
    });
  }

  // Form completion (webhook)
  if (method === 'POST' && path.includes('/forms/webhook') && success) {
    logger.business({
      event: 'form_completed',
      clientId: extractClientIdFromWebhook(req.body),
      metadata: {
        duration: metrics.duration,
        completionTime: req.body?.data?.metadata?.completionTime
      }
    });
  }

  // AI processing completion
  if (method === 'POST' && path.includes('/ai-processing/process') && success) {
    logger.business({
      event: 'ai_processing_started',
      clientId: metrics.clientId,
      userId: metrics.userId,
      metadata: {
        duration: metrics.duration
      }
    });
  }

  // SOP generation
  if (method === 'GET' && path.includes('/sops/client/') && success) {
    logger.business({
      event: 'sops_accessed',
      clientId: metrics.clientId,
      userId: metrics.userId,
      metadata: {
        duration: metrics.duration
      }
    });
  }

  // Proposal generation
  if (method === 'POST' && path.includes('/proposals/generate') && success) {
    logger.business({
      event: 'proposal_generated',
      clientId: metrics.clientId,
      userId: metrics.userId,
      metadata: {
        duration: metrics.duration
      }
    });
  }

  // PDF download
  if (method === 'GET' && path.includes('/pdf') && success) {
    logger.business({
      event: 'proposal_downloaded',
      clientId: metrics.clientId,
      userId: metrics.userId,
      metadata: {
        duration: metrics.duration,
        fileSize: metrics.responseSize
      }
    });
  }
};

// Extract client ID from webhook payload
const extractClientIdFromWebhook = (webhookData: any): string | undefined => {
  // This would depend on your webhook payload structure
  return webhookData?.clientId || webhookData?.data?.clientId;
};

// Metrics aggregation service
export class MetricsAggregationService {
  // Get performance metrics summary
  static async getPerformanceMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const metrics = await prisma.systemMetric.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        metricType: true,
        valueMs: true,
        createdAt: true
      }
    });

    // Group by metric type and calculate statistics
    const grouped = metrics.reduce((acc, metric) => {
      const type = metric.metricType;
      if (!acc[type]) {
        acc[type] = {
          values: [],
          count: 0,
          sum: 0
        };
      }
      
      acc[type].values.push(metric.valueMs);
      acc[type].count++;
      acc[type].sum += metric.valueMs;
      
      return acc;
    }, {} as any);

    // Calculate statistics for each metric type
    const result = Object.keys(grouped).reduce((acc, type) => {
      const data = grouped[type];
      const sortedValues = data.values.sort((a: number, b: number) => a - b);
      
      acc[type] = {
        count: data.count,
        average: Math.round(data.sum / data.count),
        median: sortedValues[Math.floor(sortedValues.length / 2)],
        p95: sortedValues[Math.floor(sortedValues.length * 0.95)],
        p99: sortedValues[Math.floor(sortedValues.length * 0.99)],
        min: sortedValues[0],
        max: sortedValues[sortedValues.length - 1],
        target: PERFORMANCE_TARGETS[type as keyof typeof PERFORMANCE_TARGETS] || null
      };
      
      return acc;
    }, {} as any);

    return result;
  }

  // Get business KPIs
  static async getBusinessKPIs(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // This would aggregate business metrics from your business logger
    // For now, we'll calculate some basic KPIs from the database

    const [
      totalClients,
      completedForms,
      totalForms,
      approvedSOPs,
      totalSOPs,
      sentProposals,
      acceptedProposals
    ] = await Promise.all([
      // Total clients created in period
      prisma.client.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),

      // Form completion rate
      prisma.generatedForm.count({
        where: {
          status: 'completed',
          completedAt: { gte: startDate, lte: endDate }
        }
      }),

      prisma.generatedForm.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),

      // SOP approval rate
      prisma.generatedSOP.count({
        where: {
          isApproved: true,
          approvedAt: { gte: startDate, lte: endDate }
        }
      }),

      prisma.generatedSOP.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),

      // Proposal conversion rate
      prisma.commercialProposal.count({
        where: {
          sentAt: { gte: startDate, lte: endDate }
        }
      }),

      prisma.commercialProposal.count({
        where: {
          status: 'accepted',
          updatedAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    return {
      clientsCreated: totalClients,
      formCompletionRate: totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0,
      sopApprovalRate: totalSOPs > 0 ? Math.round((approvedSOPs / totalSOPs) * 100) : 0,
      proposalConversionRate: sentProposals > 0 ? Math.round((acceptedProposals / sentProposals) * 100) : 0,
      targets: {
        formCompletionRate: 85, // >85%
        sopApprovalRate: 90,    // >90%
        proposalConversionRate: 25 // >25%
      }
    };
  }

  // Get system health metrics
  static async getSystemHealth(): Promise<any> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentMetrics = await prisma.systemMetric.findMany({
      where: {
        createdAt: { gte: oneHourAgo }
      },
      select: {
        metricType: true,
        valueMs: true,
        additionalContext: true
      }
    });

    // Calculate error rate from recent metrics
    const totalRequests = recentMetrics.filter(m => m.metricType === 'api_response_time').length;
    const errorRequests = recentMetrics.filter(m => {
      const context = m.additionalContext as any;
      return context?.statusCode >= 400;
    }).length;

    const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

    // Calculate average response time
    const apiMetrics = recentMetrics.filter(m => m.metricType === 'api_response_time');
    const avgResponseTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.valueMs, 0) / apiMetrics.length 
      : 0;

    return {
      uptime: 99.9, // This would come from your monitoring service
      errorRate: Math.round(errorRate * 100) / 100,
      averageResponseTime: Math.round(avgResponseTime),
      requestsPerHour: totalRequests,
      timestamp: now,
      targets: {
        uptime: 99,    // >99%
        errorRate: 1,  // <1%
        averageResponseTime: 3000 // <3s
      }
    };
  }
}

export default metricsMiddleware;