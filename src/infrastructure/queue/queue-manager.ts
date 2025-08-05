/**
 * Queue Manager
 * Handles async job processing with BullMQ for business operations
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { environment } from '@/config/environment';
import { logger } from '@/shared/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Redis connection for queues
const redisConnection = new Redis({
  host: environment.queue.redis.host,
  port: environment.queue.redis.port,
  password: environment.queue.redis.password,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true
});

// Queue definitions
export class QueueManager {
  private static queues: Map<string, Queue> = new Map();
  private static workers: Map<string, Worker> = new Map();
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize queues
      await this.initializeQueues();
      
      // Initialize workers
      await this.initializeWorkers();
      
      // Setup monitoring
      this.setupMonitoring();
      
      this.initialized = true;
      logger.info('Queue Manager initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize Queue Manager', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private static async initializeQueues(): Promise<void> {
    const queueConfigs = [
      {
        name: 'ai-processing',
        options: {
          defaultJobOptions: {
            removeOnComplete: 50,
            removeOnFail: 20,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 30000 // 30 seconds
            }
          }
        }
      },
      {
        name: 'sop-generation',
        options: {
          defaultJobOptions: {
            removeOnComplete: 50,
            removeOnFail: 20,
            attempts: 2,
            backoff: {
              type: 'exponential',
              delay: 60000 // 1 minute
            }
          }
        }
      },
      {
        name: 'notifications',
        options: {
          defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 50,
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 10000 // 10 seconds
            }
          }
        }
      },
      {
        name: 'proposal-generation',
        options: {
          defaultJobOptions: {
            removeOnComplete: 25,
            removeOnFail: 10,
            attempts: 2,
            backoff: {
              type: 'exponential',
              delay: 30000
            }
          }
        }
      },
      {
        name: 'pdf-generation',
        options: {
          defaultJobOptions: {
            removeOnComplete: 30,
            removeOnFail: 15,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 15000
            }
          }
        }
      }
    ];

    for (const queueConfig of queueConfigs) {
      const queue = new Queue(queueConfig.name, {
        connection: redisConnection,
        ...queueConfig.options
      });

      this.queues.set(queueConfig.name, queue);
      logger.info(`Queue '${queueConfig.name}' initialized`);
    }
  }

  private static async initializeWorkers(): Promise<void> {
    // AI Processing Worker
    const aiWorker = new Worker('ai-processing', async (job: Job) => {
      return await this.processAIJob(job);
    }, {
      connection: redisConnection,
      concurrency: environment.queue.concurrency.AI_PROCESSING
    });

    // SOP Generation Worker
    const sopWorker = new Worker('sop-generation', async (job: Job) => {
      return await this.processSOPGenerationJob(job);
    }, {
      connection: redisConnection,
      concurrency: environment.queue.concurrency.SOP_GENERATION
    });

    // Notifications Worker
    const notificationWorker = new Worker('notifications', async (job: Job) => {
      return await this.processNotificationJob(job);
    }, {
      connection: redisConnection,
      concurrency: environment.queue.concurrency.NOTIFICATIONS
    });

    // Proposal Generation Worker
    const proposalWorker = new Worker('proposal-generation', async (job: Job) => {
      return await this.processProposalGenerationJob(job);
    }, {
      connection: redisConnection,
      concurrency: environment.queue.concurrency.PROPOSAL_GENERATION
    });

    // PDF Generation Worker
    const pdfWorker = new Worker('pdf-generation', async (job: Job) => {
      return await this.processPDFGenerationJob(job);
    }, {
      connection: redisConnection,
      concurrency: environment.queue.concurrency.PDF_GENERATION
    });

    // Store workers
    this.workers.set('ai-processing', aiWorker);
    this.workers.set('sop-generation', sopWorker);
    this.workers.set('notifications', notificationWorker);
    this.workers.set('proposal-generation', proposalWorker);
    this.workers.set('pdf-generation', pdfWorker);

    // Setup error handling for all workers
    for (const [name, worker] of this.workers) {
      worker.on('error', (error) => {
        logger.error(`Worker '${name}' error:`, {
          error: error.message,
          stack: error.stack
        });
      });

      worker.on('failed', (job, error) => {
        logger.error(`Job failed in '${name}' worker:`, {
          jobId: job?.id,
          error: error.message,
          attempts: job?.attemptsMade,
          data: job?.data
        });
      });

      worker.on('completed', (job) => {
        logger.info(`Job completed in '${name}' worker:`, {
          jobId: job.id,
          duration: Date.now() - job.timestamp,
          data: job.data
        });
      });
    }
  }

  private static setupMonitoring(): void {
    // Monitor queue health
    setInterval(async () => {
      try {
        const queueStats = await this.getQueueStats();
        
        // Log warning if queues are backing up
        for (const [queueName, stats] of Object.entries(queueStats)) {
          const queueStatsTyped = stats as any;
          if (queueStatsTyped.waiting > 100) {
            logger.warn(`Queue '${queueName}' has ${queueStatsTyped.waiting} waiting jobs`);
          }
          
          if (queueStatsTyped.failed > 50) {
            logger.warn(`Queue '${queueName}' has ${queueStatsTyped.failed} failed jobs`);
          }
        }

        // Log queue metrics for monitoring
        logger.performance({
          metric: 'queue_stats',
          value: Object.values(queueStats).reduce((sum: number, stats: any) => sum + stats.waiting, 0),
          unit: 'jobs',
          additionalContext: queueStats
        });

      } catch (error) {
        logger.error('Failed to get queue stats:', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 30000); // Every 30 seconds
  }

  // Public methods for adding jobs

  static async addAIProcessingJob(data: {
    clientId: string;
    formResponseId: string;
    priority?: 'low' | 'normal' | 'high';
    delay?: number;
  }): Promise<Job> {
    const queue = this.queues.get('ai-processing');
    if (!queue) throw new Error('AI processing queue not initialized');

    const job = await queue.add('process-form-responses', data, {
      priority: this.getPriorityValue(data.priority || 'normal'),
      delay: data.delay || 0
    });

    logger.business({
      event: 'ai_processing_queued',
      clientId: data.clientId,
      metadata: {
        jobId: job.id,
        formResponseId: data.formResponseId,
        priority: data.priority || 'normal'
      }
    });

    return job;
  }

  static async addSOPGenerationJob(data: {
    clientId: string;
    aiJobId: string;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<Job> {
    const queue = this.queues.get('sop-generation');
    if (!queue) throw new Error('SOP generation queue not initialized');

    const job = await queue.add('generate-sops', data, {
      priority: this.getPriorityValue(data.priority || 'normal')
    });

    logger.business({
      event: 'sop_generation_queued',
      clientId: data.clientId,
      metadata: {
        jobId: job.id,
        aiJobId: data.aiJobId,
        priority: data.priority || 'normal'
      }
    });

    return job;
  }

  static async addNotificationJob(data: {
    type: string;
    clientId: string;
    formId?: string;
    method?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  }): Promise<Job> {
    const queue = this.queues.get('notifications');
    if (!queue) throw new Error('Notifications queue not initialized');

    const job = await queue.add(`notify-${data.type}`, data, {
      priority: this.getPriorityValue(data.priority || 'normal')
    });

    return job;
  }

  static async addProposalGenerationJob(data: {
    clientId: string;
    sopIds: string[];
    analysisId: string;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<Job> {
    const queue = this.queues.get('proposal-generation');
    if (!queue) throw new Error('Proposal generation queue not initialized');

    const job = await queue.add('generate-proposal', data, {
      priority: this.getPriorityValue(data.priority || 'normal')
    });

    logger.business({
      event: 'proposal_generation_queued',
      clientId: data.clientId,
      metadata: {
        jobId: job.id,
        sopCount: data.sopIds.length,
        analysisId: data.analysisId
      }
    });

    return job;
  }

  static async addPDFGenerationJob(data: {
    type: 'sop' | 'proposal' | 'report';
    entityId: string;
    clientId: string;
    templateId?: string;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<Job> {
    const queue = this.queues.get('pdf-generation');
    if (!queue) throw new Error('PDF generation queue not initialized');

    const job = await queue.add(`generate-${data.type}-pdf`, data, {
      priority: this.getPriorityValue(data.priority || 'normal')
    });

    return job;
  }

  // Job processors

  private static async processAIJob(job: Job): Promise<any> {
    const { clientId, formResponseId } = job.data;
    const startTime = Date.now();

    try {
      // Update job status
      await prisma.aIProcessingJob.create({
        data: {
          id: job.id as string,
          clientId,
          formResponseId,
          status: 'running',
          startedAt: new Date(),
          maxRetries: 3,
          retryCount: job.attemptsMade || 0
        }
      });

      logger.aiProcessingStart(job.id as string, clientId, formResponseId);

      // Get form response data
      const formResponse = await prisma.formResponse.findUnique({
        where: { id: formResponseId },
        include: {
          form: {
            include: {
              client: {
                include: { industry: true }
              }
            }
          }
        }
      });

      if (!formResponse) {
        throw new Error(`Form response ${formResponseId} not found`);
      }

      // Call multi-agent system API (simulated for now)
      const aiResults = await this.callMultiAgentSystem(formResponse);

      // Process results and identify processes
      const identifiedProcesses = this.extractProcesses(aiResults, formResponse);

      const processingTime = Date.now() - startTime;

      logger.aiProcessingEnd(
        job.id as string,
        clientId,
        processingTime,
        identifiedProcesses.length,
        true
      );

      return {
        identifiedProcesses,
        processingTime: Math.round(processingTime / 1000),
        confidenceScores: aiResults.confidenceScores,
        qualityScore: aiResults.qualityScore
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.aiProcessingEnd(
        job.id as string,
        clientId,
        processingTime,
        0,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  }

  private static async processSOPGenerationJob(job: Job): Promise<any> {
    const { clientId, aiJobId } = job.data;

    try {
      // Get AI processing results
      const aiJob = await prisma.aIProcessingJob.findUnique({
        where: { id: aiJobId },
        include: {
          client: {
            include: { industry: true }
          },
          formResponse: true
        }
      });

      if (!aiJob) {
        throw new Error(`AI job ${aiJobId} not found`);
      }

      // Get identified processes
      const processes = await prisma.identifiedProcess.findMany({
        where: { aiJobId }
      });

      if (processes.length < 5) {
        throw new Error(`Insufficient processes identified (${processes.length}). Minimum 5 required.`);
      }

      // Generate SOPs for each process
      const generatedSOPs = [];
      
      for (const process of processes) {
        const sop = await this.generateSOPForProcess(process, aiJob.client);
        
        const sopRecord = await prisma.generatedSOP.create({
          data: {
            clientId,
            processId: process.id,
            objective: sop.objective,
            scope: sop.scope,
            responsibilities: sop.responsibilities,
            procedures: sop.procedures,
            resources: sop.resources,
            kpis: sop.kpis,
            risks: sop.risks,
            improvements: sop.improvements,
            isApproved: false,
            generationMetadata: sop.metadata
          }
        });

        generatedSOPs.push(sopRecord);
      }

      // Update client status
      await prisma.client.update({
        where: { id: clientId },
        data: { currentStatus: 'sops_generated' }
      });

      // Create workflow transition
      await prisma.workflowTransition.create({
        data: {
          clientId,
          fromStatus: 'processing_ai',
          toStatus: 'sops_generated',
          triggerEvent: 'sop_generation_completed',
          additionalData: {
            aiJobId,
            sopCount: generatedSOPs.length,
            jobId: job.id
          }
        }
      });

      logger.business({
        event: 'sops_generated',
        clientId,
        metadata: {
          sopCount: generatedSOPs.length,
          aiJobId,
          jobId: job.id
        }
      });

      return {
        generatedSOPs: generatedSOPs.length,
        sopIds: generatedSOPs.map(s => s.id)
      };

    } catch (error) {
      logger.error('SOP generation failed:', {
        jobId: job.id,
        clientId,
        aiJobId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private static async processNotificationJob(job: Job): Promise<any> {
    const { type, clientId, formId, method = 'email' } = job.data;

    try {
      // Get client information
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          generatedForms: formId ? {
            where: { id: formId }
          } : undefined
        }
      });

      if (!client) {
        throw new Error(`Client ${clientId} not found`);
      }

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          clientId,
          type,
          method,
          status: 'pending',
          recipientEmail: client.contactEmail,
          subject: this.getNotificationSubject(type, client.name),
          content: await this.getNotificationContent(type, client, formId),
          scheduledFor: new Date(),
          metadata: {
            jobId: job.id,
            formId: formId || null
          }
        }
      });

      // Send notification (simulated - would integrate with actual email service)
      const deliveryResult = await this.sendNotification(notification, client);

      // Update notification status
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: deliveryResult.success ? 'sent' : 'failed',
          sentAt: deliveryResult.success ? new Date() : null,
          deliveryResponse: deliveryResult
        }
      });

      return {
        notificationId: notification.id,
        delivered: deliveryResult.success,
        method,
        recipient: client.contactEmail
      };

    } catch (error) {
      logger.error('Notification processing failed:', {
        jobId: job.id,
        type,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private static async processProposalGenerationJob(job: Job): Promise<any> {
    const { clientId, sopIds, analysisId } = job.data;

    try {
      // This would implement actual proposal generation logic
      // For now, simulate the process
      
      const proposal = await prisma.commercialProposal.create({
        data: {
          clientId,
          status: 'draft',
          totalValue: 50000, // Would be calculated based on analysis
          estimatedROI: 300,
          implementationTimeWeeks: 12,
          proposalData: {
            services: ['Process Automation', 'SOP Implementation', 'Training'],
            timeline: 'Q2 2024',
            sopCount: sopIds.length
          },
          generatedAt: new Date()
        }
      });

      // Update client status
      await prisma.client.update({
        where: { id: clientId },
        data: { currentStatus: 'proposal_ready' }
      });

      logger.business({
        event: 'proposal_generated',
        clientId,
        metadata: {
          proposalId: proposal.id,
          sopCount: sopIds.length,
          totalValue: proposal.totalValue
        }
      });

      return {
        proposalId: proposal.id,
        totalValue: proposal.totalValue,
        estimatedROI: proposal.estimatedROI
      };

    } catch (error) {
      logger.error('Proposal generation failed:', {
        jobId: job.id,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private static async processPDFGenerationJob(job: Job): Promise<any> {
    const { type, entityId, clientId, templateId } = job.data;

    try {
      // This would implement actual PDF generation
      // For now, simulate the process
      
      return {
        pdfPath: `/generated/${type}/${entityId}.pdf`,
        fileSize: 1024 * 256, // 256KB
        pageCount: 15,
        generatedAt: new Date()
      };

    } catch (error) {
      logger.error('PDF generation failed:', {
        jobId: job.id,
        type,
        entityId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Helper methods

  private static getPriorityValue(priority: string): number {
    const priorityMap = {
      'urgent': 10,
      'high': 5,
      'normal': 0,
      'low': -5
    };
    return priorityMap[priority as keyof typeof priorityMap] || 0;
  }

  private static async callMultiAgentSystem(formResponse: any): Promise<any> {
    // This would call the actual multi-agent system API
    // For now, simulate the response
    return {
      identifiedProcesses: [
        {
          name: 'Facturación y Cobranza',
          category: 'primary',
          description: 'Proceso de emisión de facturas y gestión de cobranzas',
          confidence: 0.95,
          automationScore: 0.8,
          estimatedROI: 200
        },
        {
          name: 'Gestión de Inventario',
          category: 'support', 
          description: 'Control y seguimiento de stock de productos',
          confidence: 0.90,
          automationScore: 0.75,
          estimatedROI: 150
        }
      ],
      confidenceScores: {
        overall: 0.92,
        categoryBreakdown: {
          primary: 0.95,
          support: 0.90,
          management: 0.88
        }
      },
      qualityScore: 0.94
    };
  }

  private static extractProcesses(aiResults: any, formResponse: any): any[] {
    return aiResults.identifiedProcesses.map((process: any) => ({
      ...process,
      isExplicit: true,
      frequencyPerMonth: 20,
      manualStepsCount: 8,
      errorRatePercentage: 5,
      implementationComplexity: 'medium',
      systemsInvolved: ['ERP', 'CRM'],
      integrationComplexity: 'medium',
      metadata: {
        sourceFormResponse: formResponse.id,
        extractedAt: new Date(),
        confidence: process.confidence
      }
    }));
  }

  private static async generateSOPForProcess(process: any, client: any): Promise<any> {
    // This would implement actual SOP generation logic
    return {
      objective: `Estandarizar el proceso de ${process.processName}`,
      scope: `Aplica a todas las actividades relacionadas con ${process.processName}`,
      responsibilities: ['Gerente de Operaciones', 'Analista de Procesos'],
      procedures: [
        'Paso 1: Identificación de necesidad',
        'Paso 2: Validación de información',
        'Paso 3: Procesamiento',
        'Paso 4: Control de calidad',
        'Paso 5: Entrega'
      ],
      resources: ['Sistema ERP', 'Personal capacitado'],
      kpis: ['Tiempo de procesamiento < 2 horas', 'Tasa de error < 2%'],
      risks: ['Información incompleta', 'Falla del sistema'],
      improvements: ['Automatización parcial', 'Capacitación continua'],
      metadata: {
        generatedAt: new Date(),
        processId: process.id,
        algorithm: 'sop_generator_v1'
      }
    };
  }

  private static getNotificationSubject(type: string, clientName: string): string {
    const subjects = {
      'form_ready': `Formulario de diagnóstico listo - ${clientName}`,
      'form_reminder': `Recordatorio: Complete su diagnóstico de procesos - ${clientName}`,
      'ai_processing_complete': `Análisis completado - ${clientName}`,
      'sops_ready': `SOPs generados y listos para revisión - ${clientName}`,
      'proposal_ready': `Propuesta comercial lista - ${clientName}`
    };
    
    return subjects[type as keyof typeof subjects] || `Notificación - ${clientName}`;
  }

  private static async getNotificationContent(type: string, client: any, formId?: string): Promise<string> {
    // This would use actual email templates
    const templates = {
      'form_ready': `Estimado/a ${client.name},\n\nSu formulario de diagnóstico está listo. Por favor complete en: [URL]`,
      'form_reminder': `Recordatorio: Aún no ha completado su diagnóstico de procesos.`,
      'proposal_ready': `Su propuesta comercial está lista para revisión.`
    };
    
    return templates[type as keyof typeof templates] || `Notificación para ${client.name}`;
  }

  private static async sendNotification(notification: any, client: any): Promise<any> {
    // This would integrate with actual email service (SendGrid, etc.)
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: 'simulated',
      timestamp: new Date()
    };
  }

  static async getQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    
    for (const [name, queue] of this.queues) {
      try {
        const [waiting, active, completed, failed] = await Promise.all([
          queue.getWaiting(),
          queue.getActive(),
          queue.getCompleted(),
          queue.getFailed()
        ]);

        stats[name] = {
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length
        };
      } catch (error) {
        stats[name] = { error: 'Failed to get stats' };
      }
    }
    
    return stats;
  }

  static async shutdown(): Promise<void> {
    logger.info('Shutting down Queue Manager...');
    
    // Close all workers
    for (const [name, worker] of this.workers) {
      try {
        await worker.close();
        logger.info(`Worker '${name}' closed`);
      } catch (error) {
        logger.error(`Failed to close worker '${name}':`, error);
      }
    }
    
    // Close all queues
    for (const [name, queue] of this.queues) {
      try {
        await queue.close();
        logger.info(`Queue '${name}' closed`);
      } catch (error) {
        logger.error(`Failed to close queue '${name}':`, error);
      }
    }
    
    // Close Redis connection
    try {
      redisConnection.disconnect();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Failed to close Redis connection:', error);
    }
    
    this.initialized = false;
    logger.info('Queue Manager shutdown complete');
  }
}