/**
 * AI Processing Controller
 * Handles AI processing jobs, SOP generation, and analysis management
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/logger';
import { cache } from '@/infrastructure/cache/redis-connection';
import { 
  NotFoundError, 
  BusinessRuleError,
  ValidationError
} from '@/shared/middleware/error-handler';
import { QueueManager } from '@/infrastructure/queue/queue-manager';
import { environment } from '@/config/environment';

const prisma = new PrismaClient();

export class AIController {

  // POST /api/v1/ai/start-processing - Start AI processing for form response
  async startProcessing(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const { clientId, formResponseId, priority = 'normal' } = req.body;

    try {
      // Validate client exists and is in correct status
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          generatedForms: {
            where: { status: 'completed' },
            include: {
              formResponse: {
                where: { id: formResponseId }
              }
            }
          }
        }
      });

      if (!client) {
        throw new NotFoundError('Client');
      }

      if (client.currentStatus !== 'responses_received') {
        throw new BusinessRuleError(
          `Cannot start AI processing for client in status '${client.currentStatus}'. Expected: 'responses_received'`,
          'INVALID_CLIENT_STATUS'
        );
      }

      // Validate form response exists
      const formResponse = client.generatedForms
        .flatMap(f => f.formResponse)
        .find(fr => fr.id === formResponseId);

      if (!formResponse) {
        throw new NotFoundError('Form response');
      }

      // Check if AI processing is already in progress
      const existingJob = await prisma.aIProcessingJob.findFirst({
        where: {
          clientId,
          formResponseId,
          status: { in: ['pending', 'running'] }
        }
      });

      if (existingJob) {
        throw new ConflictError('AI processing job already in progress for this form response');
      }

      // Update client status
      await prisma.client.update({
        where: { id: clientId },
        data: { currentStatus: 'processing_ai' }
      });

      // Create workflow transition
      await prisma.workflowTransition.create({
        data: {
          clientId,
          fromStatus: 'responses_received',
          toStatus: 'processing_ai',
          triggerEvent: 'ai_processing_started',
          triggeredBy: req.user?.id,
          additionalData: {
            formResponseId,
            priority,
            initiatedBy: 'manual'
          }
        }
      });

      // Queue AI processing job
      const job = await QueueManager.addAIProcessingJob({
        clientId,
        formResponseId,
        priority: priority as 'low' | 'normal' | 'high'
      });

      const duration = Date.now() - startTime;

      // Log business event
      logger.business({
        event: 'ai_processing_started',
        clientId,
        userId: req.user?.id,
        metadata: {
          formResponseId,
          jobId: job.id,
          priority,
          duration
        }
      });

      logger.clientStatusChanged(
        clientId,
        'responses_received',
        'processing_ai',
        req.user?.id,
        'ai_processing_started'
      );

      res.status(201).json({
        success: true,
        message: 'AI processing started successfully',
        data: {
          jobId: job.id,
          clientId,
          formResponseId,
          priority,
          estimatedCompletionTime: environment.businessRules.performanceTargets.aiProcessingTime,
          status: 'queued'
        },
        meta: {
          duration,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId,
        formResponseId,
        action: 'start_ai_processing'
      });
      throw error;
    }
  }

  // GET /api/v1/ai/jobs/:jobId - Get AI processing job status
  async getJobStatus(req: Request, res: Response): Promise<void> {
    const { jobId } = req.params;

    try {
      const job = await prisma.aIProcessingJob.findUnique({
        where: { id: jobId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              currentStatus: true
            }
          },
          formResponse: {
            select: {
              id: true,
              submittedAt: true,
              validationScore: true
            }
          }
        }
      });

      if (!job) {
        throw new NotFoundError('AI processing job');
      }

      // Calculate progress and estimated time remaining
      const progress = this.calculateJobProgress(job);
      const estimatedTimeRemaining = this.calculateEstimatedTimeRemaining(job);

      res.status(200).json({
        success: true,
        data: {
          ...job,
          progress,
          estimatedTimeRemaining,
          performance: {
            startedAt: job.startedAt,
            processingTime: job.processingTimeSeconds,
            status: job.status
          }
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        jobId,
        action: 'get_job_status'
      });
      throw error;
    }
  }

  // GET /api/v1/ai/jobs/client/:clientId - Get AI processing jobs for client
  async getJobsByClient(req: Request, res: Response): Promise<void> {
    const { clientId } = req.params;
    const { status, limit = 10 } = req.query;

    try {
      const where: any = { clientId };
      if (status) where.status = status;

      const jobs = await prisma.aIProcessingJob.findMany({
        where,
        include: {
          formResponse: {
            select: {
              id: true,
              submittedAt: true,
              validationScore: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string)
      });

      // Add progress calculation for each job
      const jobsWithProgress = jobs.map(job => ({
        ...job,
        progress: this.calculateJobProgress(job),
        estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(job)
      }));

      res.status(200).json({
        success: true,
        data: jobsWithProgress,
        meta: {
          count: jobs.length,
          clientId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId,
        action: 'get_jobs_by_client'
      });
      throw error;
    }
  }

  // GET /api/v1/ai/processes/:clientId - Get identified processes for client
  async getIdentifiedProcesses(req: Request, res: Response): Promise<void> {
    const { clientId } = req.params;
    const { category, sortBy = 'automationFeasibilityScore', sortOrder = 'desc' } = req.query;

    try {
      const where: any = { clientId };
      if (category) where.processCategory = category;

      const processes = await prisma.identifiedProcess.findMany({
        where,
        include: {
          aiJob: {
            select: {
              id: true,
              status: true,
              completedAt: true
            }
          },
          generatedSOPs: {
            select: {
              id: true,
              objective: true,
              isApproved: true
            }
          }
        },
        orderBy: {
          [sortBy as string]: sortOrder
        }
      });

      // Calculate prioritization matrix
      const prioritizationMatrix = this.calculatePrioritizationMatrix(processes);

      // Group by category
      const processCategories = this.groupProcessesByCategory(processes);

      res.status(200).json({
        success: true,
        data: processes,
        analysis: {
          totalProcesses: processes.length,
          prioritizationMatrix,
          categoryBreakdown: processCategories,
          recommendedForAutomation: processes.filter(p => p.automationFeasibilityScore >= 0.7).length,
          averageROI: processes.length > 0 
            ? Math.round(processes.reduce((sum, p) => sum + (p.estimatedRoiPercentage || 0), 0) / processes.length)
            : 0
        },
        meta: {
          clientId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId,
        action: 'get_identified_processes'
      });
      throw error;
    }
  }

  // POST /api/v1/ai/processes/:processId/approve - Approve identified process
  async approveProcess(req: Request, res: Response): Promise<void> {
    const { processId } = req.params;
    const { approved, comments } = req.body;

    try {
      const process = await prisma.identifiedProcess.findUnique({
        where: { id: processId },
        include: {
          client: {
            select: { id: true, name: true }
          }
        }
      });

      if (!process) {
        throw new NotFoundError('Identified process');
      }

      // Update process approval status
      const updatedProcess = await prisma.identifiedProcess.update({
        where: { id: processId },
        data: {
          isApproved: approved,
          approvedAt: approved ? new Date() : null,
          approvedBy: req.user?.id,
          approvalComments: comments,
          processMetadata: {
            ...process.processMetadata as any,
            approvalHistory: [
              ...((process.processMetadata as any)?.approvalHistory || []),
              {
                action: approved ? 'approved' : 'rejected',
                by: req.user?.id,
                at: new Date(),
                comments
              }
            ]
          }
        }
      });

      // Log business event
      logger.business({
        event: approved ? 'process_approved' : 'process_rejected',
        clientId: process.clientId,
        userId: req.user?.id,
        metadata: {
          processId,
          processName: process.processName,
          comments
        }
      });

      res.status(200).json({
        success: true,
        message: `Process ${approved ? 'approved' : 'rejected'} successfully`,
        data: {
          processId,
          approved,
          approvedAt: updatedProcess.approvedAt,
          comments
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        processId,
        action: 'approve_process'
      });
      throw error;
    }
  }

  // POST /api/v1/ai/retry/:jobId - Retry failed AI processing job
  async retryJob(req: Request, res: Response): Promise<void> {
    const { jobId } = req.params;
    const { priority = 'high' } = req.body;

    try {
      const job = await prisma.aIProcessingJob.findUnique({
        where: { id: jobId },
        include: {
          client: {
            select: { id: true, currentStatus: true }
          }
        }
      });

      if (!job) {
        throw new NotFoundError('AI processing job');
      }

      if (job.status !== 'failed') {
        throw new BusinessRuleError(
          `Cannot retry job in status '${job.status}'. Only failed jobs can be retried.`,
          'INVALID_JOB_STATUS'
        );
      }

      if (job.retryCount >= job.maxRetries) {
        throw new BusinessRuleError(
          `Job has exceeded maximum retry attempts (${job.maxRetries})`,
          'MAX_RETRIES_EXCEEDED'
        );
      }

      // Queue new AI processing job
      const newJob = await QueueManager.addAIProcessingJob({
        clientId: job.clientId,
        formResponseId: job.formResponseId,
        priority: priority as 'low' | 'normal' | 'high'
      });

      // Update original job to show it was retried
      await prisma.aIProcessingJob.update({
        where: { id: jobId },
        data: {
          retryCount: job.retryCount + 1,
          errorMessage: `${job.errorMessage} | Retried with job ${newJob.id}`
        }
      });

      logger.business({
        event: 'ai_job_retried',
        clientId: job.clientId,
        userId: req.user?.id,
        metadata: {
          originalJobId: jobId,
          newJobId: newJob.id,
          retryCount: job.retryCount + 1,
          priority
        }
      });

      res.status(201).json({
        success: true,
        message: 'AI processing job retried successfully',
        data: {
          originalJobId: jobId,
          newJobId: newJob.id,
          retryCount: job.retryCount + 1,
          priority,
          status: 'retried'
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        jobId,
        action: 'retry_ai_job'
      });
      throw error;
    }
  }

  // GET /api/v1/ai/analytics/:clientId - Get AI processing analytics for client
  async getProcessingAnalytics(req: Request, res: Response): Promise<void> {
    const { clientId } = req.params;
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date() 
    } = req.query;

    try {
      // Get AI processing jobs in date range
      const jobs = await prisma.aIProcessingJob.findMany({
        where: {
          clientId,
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        },
        include: {
          client: {
            select: { name: true, industry: { select: { displayNameEs: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate analytics
      const analytics = {
        totalJobs: jobs.length,
        successRate: jobs.length > 0 
          ? Math.round((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100)
          : 0,
        averageProcessingTime: jobs.length > 0
          ? Math.round(jobs
              .filter(j => j.processingTimeSeconds)
              .reduce((sum, j) => sum + (j.processingTimeSeconds || 0), 0) / jobs.length)
          : 0,
        totalProcessesIdentified: jobs.reduce((sum, j) => sum + (j.processCount || 0), 0),
        averageProcessesPerJob: jobs.length > 0
          ? Math.round(jobs.reduce((sum, j) => sum + (j.processCount || 0), 0) / jobs.length)
          : 0,
        statusBreakdown: {
          completed: jobs.filter(j => j.status === 'completed').length,
          running: jobs.filter(j => j.status === 'running').length,
          failed: jobs.filter(j => j.status === 'failed').length,
          pending: jobs.filter(j => j.status === 'pending').length
        },
        performanceMetrics: {
          fastestProcessing: Math.min(...jobs.map(j => j.processingTimeSeconds || Infinity)),
          slowestProcessing: Math.max(...jobs.map(j => j.processingTimeSeconds || 0)),
          averageConfidence: jobs.length > 0
            ? jobs.reduce((sum, j) => {
                const confidence = (j.confidenceScores as any)?.overall || 0;
                return sum + confidence;
              }, 0) / jobs.length
            : 0
        }
      };

      res.status(200).json({
        success: true,
        data: {
          analytics,
          period: {
            startDate,
            endDate
          },
          jobs: jobs.slice(0, 10) // Return latest 10 jobs for details
        },
        meta: {
          clientId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId,
        action: 'get_processing_analytics'
      });
      throw error;
    }
  }

  // Private helper methods

  private calculateJobProgress(job: any): number {
    if (job.status === 'completed') return 100;
    if (job.status === 'failed') return 0;
    if (job.status === 'pending') return 0;
    
    if (job.status === 'running') {
      // Estimate progress based on time elapsed
      const startTime = new Date(job.startedAt).getTime();
      const now = Date.now();
      const elapsed = now - startTime;
      const expectedDuration = environment.businessRules.performanceTargets.aiProcessingTime;
      
      return Math.min(90, Math.round((elapsed / expectedDuration) * 100));
    }
    
    return 0;
  }

  private calculateEstimatedTimeRemaining(job: any): number {
    if (job.status === 'completed' || job.status === 'failed') return 0;
    if (job.status === 'pending') return environment.businessRules.performanceTargets.aiProcessingTime / 1000;
    
    if (job.status === 'running' && job.startedAt) {
      const startTime = new Date(job.startedAt).getTime();
      const now = Date.now();
      const elapsed = now - startTime;
      const expectedDuration = environment.businessRules.performanceTargets.aiProcessingTime;
      
      return Math.max(0, Math.round((expectedDuration - elapsed) / 1000));
    }
    
    return 0;
  }

  private calculatePrioritizationMatrix(processes: any[]): any {
    return {
      highImpactHighFeasibility: processes.filter(p => 
        p.estimatedRoiPercentage >= 200 && p.automationFeasibilityScore >= 0.8
      ).length,
      highImpactLowFeasibility: processes.filter(p => 
        p.estimatedRoiPercentage >= 200 && p.automationFeasibilityScore < 0.8
      ).length,
      lowImpactHighFeasibility: processes.filter(p => 
        p.estimatedRoiPercentage < 200 && p.automationFeasibilityScore >= 0.8
      ).length,
      lowImpactLowFeasibility: processes.filter(p => 
        p.estimatedRoiPercentage < 200 && p.automationFeasibilityScore < 0.8
      ).length
    };
  }

  private groupProcessesByCategory(processes: any[]): any {
    const categories = processes.reduce((acc, process) => {
      const category = process.processCategory || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(process);
      return acc;
    }, {});

    return Object.entries(categories).map(([category, procs]) => ({
      category,
      count: (procs as any[]).length,
      averageROI: (procs as any[]).length > 0
        ? Math.round((procs as any[]).reduce((sum, p) => sum + (p.estimatedRoiPercentage || 0), 0) / (procs as any[]).length)
        : 0,
      averageFeasibility: (procs as any[]).length > 0
        ? Math.round((procs as any[]).reduce((sum, p) => sum + (p.automationFeasibilityScore || 0), 0) / (procs as any[]).length * 100) / 100
        : 0
    }));
  }
}