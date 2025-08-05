/**
 * Webhook Controller
 * Handles external webhook notifications from integrated services
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/logger';
import { cache } from '@/infrastructure/cache/redis-connection';
import { QueueManager } from '@/infrastructure/queue/queue-manager';
import { NotFoundError } from '@/shared/middleware/error-handler';

const prisma = new PrismaClient();

export class WebhookController {

  // POST /api/webhooks/tally - Handle Tally Forms webhook
  async handleTallyWebhook(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const { eventId, eventType, formId, submissionId, data } = req.body;

    try {
      logger.info('Tally webhook received', {
        eventId,
        eventType,
        formId,
        submissionId,
        timestamp: new Date().toISOString()
      });

      // Find the form in our database
      const form = await prisma.generatedForm.findUnique({
        where: { tallyFormId: formId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              currentStatus: true
            }
          }
        }
      });

      if (!form) {
        logger.warn('Webhook received for unknown form', {
          eventId,
          formId,
          eventType
        });
        
        // Still return success to avoid retries
        res.status(200).json({
          success: true,
          message: 'Form not found but webhook acknowledged',
          processedAt: new Date().toISOString()
        });
        return;
      }

      // Process based on event type
      switch (eventType) {
        case 'form.started':
          await this.handleFormStarted(form, data);
          break;
          
        case 'form.updated':
          await this.handleFormUpdated(form, data);
          break;
          
        case 'form.completed':
          await this.handleFormCompleted(form, submissionId, data);
          break;
          
        default:
          logger.warn('Unknown webhook event type', {
            eventType,
            eventId,
            formId
          });
      }

      const duration = Date.now() - startTime;

      // Log performance metric
      logger.performance({
        metric: 'webhook_processing_time',
        value: duration,
        unit: 'ms',
        clientId: form.clientId,
        additionalContext: {
          eventType,
          formId,
          eventId
        }
      });

      // Log business event
      logger.business({
        event: `form_${eventType.split('.')[1]}`,
        clientId: form.clientId,
        metadata: {
          formId: form.id,
          tallyFormId: formId,
          eventId,
          duration
        }
      });

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        eventId,
        processedAt: new Date().toISOString(),
        duration
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        eventId,
        eventType,
        formId,
        action: 'handle_tally_webhook'
      });

      // Return 500 so webhook sender retries
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        eventId,
        error: 'Internal server error'
      });
    }
  }

  // POST /api/webhooks/multiagent - Handle AI processing completion webhook
  async handleMultiAgentWebhook(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const { jobId, status, results, error } = req.body;

    try {
      logger.info('Multi-agent webhook received', {
        jobId,
        status,
        timestamp: new Date().toISOString()
      });

      // Find the AI processing job
      const aiJob = await prisma.aIProcessingJob.findUnique({
        where: { id: jobId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              currentStatus: true
            }
          }
        }
      });

      if (!aiJob) {
        throw new NotFoundError('AI processing job');
      }

      if (status === 'completed') {
        await this.handleAIProcessingCompleted(aiJob, results);
      } else if (status === 'failed') {
        await this.handleAIProcessingFailed(aiJob, error);
      }

      const duration = Date.now() - startTime;

      // Log performance metric
      logger.performance({
        metric: 'ai_processing_webhook',
        value: duration,
        unit: 'ms',
        clientId: aiJob.clientId,
        additionalContext: {
          jobId,
          status,
          success: status === 'completed'
        }
      });

      res.status(200).json({
        success: true,
        message: 'AI processing webhook handled successfully',
        jobId,
        status,
        processedAt: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        jobId,
        status,
        action: 'handle_multiagent_webhook'
      });

      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        jobId,
        error: 'Internal server error'
      });
    }
  }

  // POST /api/webhooks/email - Handle email delivery status webhook
  async handleEmailWebhook(req: Request, res: Response): Promise<void> {
    const { messageId, event, timestamp, recipient } = req.body;

    try {
      logger.info('Email webhook received', {
        messageId,
        event,
        recipient,
        timestamp
      });

      // Update notification status if we have a record
      if (messageId) {
        await prisma.notification.updateMany({
          where: {
            // Assuming we store messageId in deliveryResponse
            deliveryResponse: {
              path: ['messageId'],
              equals: messageId
            }
          },
          data: {
            status: this.mapEmailEventToStatus(event),
            deliveryResponse: {
              messageId,
              event,
              timestamp,
              recipient
            }
          }
        });
      }

      // Log business event
      logger.business({
        event: `email_${event}`,
        metadata: {
          messageId,
          recipient,
          timestamp
        }
      });

      res.status(200).json({
        success: true,
        message: 'Email webhook processed successfully',
        messageId,
        event
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        messageId,
        event,
        action: 'handle_email_webhook'
      });

      res.status(200).json({
        success: true,
        message: 'Email webhook acknowledged (with errors)',
        messageId
      });
    }
  }

  // Private helper methods

  private async handleFormStarted(form: any, data: any): Promise<void> {
    // Update form status to in_progress
    await prisma.generatedForm.update({
      where: { id: form.id },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
        currentQuestion: 1
      }
    });

    // Create workflow transition
    await prisma.workflowTransition.create({
      data: {
        clientId: form.clientId,
        fromStatus: form.client.currentStatus,
        toStatus: form.client.currentStatus, // Status doesn't change yet
        triggerEvent: 'form_started',
        additionalData: {
          formId: form.id,
          startedAt: new Date(),
          userAgent: data.metadata?.userAgent,
          ipAddress: data.metadata?.ipAddress
        }
      }
    });

    // Log client event
    logger.clientStatusChanged(
      form.clientId,
      form.client.currentStatus,
      form.client.currentStatus,
      undefined,
      'form_started'
    );

    // Clear cache
    await cache.invalidateClientData(form.clientId);
  }

  private async handleFormUpdated(form: any, data: any): Promise<void> {
    // Calculate completion percentage
    const totalQuestions = form.totalQuestions;
    const completedQuestions = data.responses?.length || 0;
    const completionPercentage = (completedQuestions / totalQuestions) * 100;

    // Update form progress
    await prisma.generatedForm.update({
      where: { id: form.id },
      data: {
        currentQuestion: completedQuestions + 1,
        completionPercentage,
        partialResponses: data.responses || [],
        lastSavedAt: new Date()
      }
    });

    // Cache partial progress
    await cache.setFormData(form.id, {
      id: form.id,
      completionPercentage,
      currentQuestion: completedQuestions + 1,
      lastSaved: new Date()
    });
  }

  private async handleFormCompleted(form: any, submissionId: string, data: any): Promise<void> {
    const completionTime = data.metadata?.completionTime || 0;
    const submittedAt = new Date(data.metadata?.submittedAt || Date.now());

    // Update form status
    await prisma.generatedForm.update({
      where: { id: form.id },
      data: {
        status: 'completed',
        completedAt: submittedAt,
        completionPercentage: 100,
        currentQuestion: form.totalQuestions
      }
    });

    // Create form response record
    const formResponse = await prisma.formResponse.create({
      data: {
        formId: form.id,
        clientId: form.clientId,
        rawResponses: data.responses || [],
        processedResponses: this.processFormResponses(data.responses || []),
        completionTimeMinutes: completionTime,
        submittedAt,
        ipAddress: data.metadata?.ipAddress,
        userAgent: data.metadata?.userAgent,
        validationScore: this.calculateValidationScore(data.responses || [])
      }
    });

    // Update client status
    await prisma.client.update({
      where: { id: form.clientId },
      data: {
        currentStatus: 'responses_received'
      }
    });

    // Create workflow transition
    await prisma.workflowTransition.create({
      data: {
        clientId: form.clientId,
        fromStatus: 'form_sent',
        toStatus: 'responses_received',
        triggerEvent: 'form_completed',
        additionalData: {
          formId: form.id,
          submissionId,
          completionTime,
          responseCount: data.responses?.length || 0
        }
      }
    });

    // Queue AI processing job
    await QueueManager.addAIProcessingJob({
      clientId: form.clientId,
      formResponseId: formResponse.id,
      priority: 'normal'
    });

    // Log completion event
    logger.formGenerated(
      form.clientId,
      form.id,
      form.totalQuestions,
      completionTime * 60 * 1000 // Convert to ms
    );

    logger.clientStatusChanged(
      form.clientId,
      'form_sent',
      'responses_received',
      undefined,
      'form_completed'
    );

    // Invalidate cache
    await cache.invalidateClientData(form.clientId);

    // Send notification to consultant
    await this.sendFormCompletionNotification(form, formResponse);
  }

  private async handleAIProcessingCompleted(aiJob: any, results: any): Promise<void> {
    const processCount = results.identifiedProcesses?.length || 0;
    const processingTime = Date.now() - new Date(aiJob.startedAt).getTime();

    // Update AI job status
    await prisma.aIProcessingJob.update({
      where: { id: aiJob.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        processingTimeSeconds: Math.round(processingTime / 1000),
        identifiedProcesses: results.identifiedProcesses || [],
        processCount,
        confidenceScores: results.confidenceScores || {}
      }
    });

    // Create identified processes
    if (results.identifiedProcesses?.length > 0) {
      await this.createIdentifiedProcesses(aiJob.clientId, aiJob.id, results.identifiedProcesses);
    }

    // Update client status
    await prisma.client.update({
      where: { id: aiJob.clientId },
      data: {
        currentStatus: processCount >= 5 ? 'sops_generated' : 'processing_ai'
      }
    });

    // Create workflow transition
    await prisma.workflowTransition.create({
      data: {
        clientId: aiJob.clientId,
        fromStatus: 'processing_ai',
        toStatus: processCount >= 5 ? 'sops_generated' : 'processing_ai',
        triggerEvent: 'ai_processing_completed',
        additionalData: {
          jobId: aiJob.id,
          processCount,
          processingTime: Math.round(processingTime / 1000),
          qualityScore: results.qualityScore
        }
      }
    });

    // Log AI processing completion
    logger.aiProcessingEnd(
      aiJob.id,
      aiJob.clientId,
      processingTime,
      processCount,
      true
    );

    // Queue SOP generation if enough processes found
    if (processCount >= 5) {
      await QueueManager.addSOPGenerationJob({
        clientId: aiJob.clientId,
        aiJobId: aiJob.id
      });
    }

    // Invalidate cache
    await cache.invalidateClientData(aiJob.clientId);
  }

  private async handleAIProcessingFailed(aiJob: any, error: any): Promise<void> {
    // Update AI job with failure
    await prisma.aIProcessingJob.update({
      where: { id: aiJob.id },
      data: {
        status: 'failed',
        errorMessage: error.message || 'AI processing failed',
        errorDetails: error.details || {},
        retryCount: aiJob.retryCount + 1
      }
    });

    // Schedule retry if not exceeded max attempts
    if (aiJob.retryCount < aiJob.maxRetries) {
      await QueueManager.addAIProcessingJob({
        clientId: aiJob.clientId,
        formResponseId: aiJob.formResponseId,
        priority: 'high',
        delay: Math.pow(2, aiJob.retryCount) * 60000 // Exponential backoff
      });

      logger.info('AI processing job scheduled for retry', {
        jobId: aiJob.id,
        clientId: aiJob.clientId,
        retryCount: aiJob.retryCount + 1,
        maxRetries: aiJob.maxRetries
      });
    } else {
      // Max retries exceeded - manual intervention needed
      logger.error('AI processing job failed after max retries', {
        jobId: aiJob.id,
        clientId: aiJob.clientId,
        error: error.message
      });

      // Send alert to admin
      await this.sendAIProcessingFailureAlert(aiJob, error);
    }
  }

  private processFormResponses(rawResponses: any[]): any[] {
    // Process and clean up form responses
    return rawResponses.map(response => ({
      questionId: response.questionId,
      question: response.question,
      answer: response.answer,
      type: this.inferAnswerType(response.answer),
      processed: true,
      timestamp: new Date()
    }));
  }

  private calculateValidationScore(responses: any[]): number {
    if (responses.length === 0) return 0;

    let validResponses = 0;
    
    for (const response of responses) {
      if (response.answer && 
          response.answer.toString().trim().length > 0 &&
          response.answer !== 'N/A' &&
          response.answer !== 'No aplica') {
        validResponses++;
      }
    }

    return Number((validResponses / responses.length).toFixed(2));
  }

  private inferAnswerType(answer: any): string {
    if (typeof answer === 'number') return 'number';
    if (typeof answer === 'boolean') return 'boolean';
    if (Array.isArray(answer)) return 'array';
    if (typeof answer === 'string') {
      if (answer.includes('@')) return 'email';
      if (/^\d+$/.test(answer)) return 'numeric_string';
      if (answer.length > 100) return 'long_text';
      return 'text';
    }
    return 'unknown';
  }

  private async createIdentifiedProcesses(clientId: string, aiJobId: string, processes: any[]): Promise<void> {
    for (const processData of processes) {
      await prisma.identifiedProcess.create({
        data: {
          clientId,
          aiJobId,
          processName: processData.name,
          processCategory: processData.category as any,
          processDescription: processData.description,
          isExplicit: processData.isExplicit || true,
          frequencyPerMonth: processData.frequency || 0,
          manualStepsCount: processData.manualSteps || 0,
          errorRatePercentage: processData.errorRate || 0,
          automationFeasibilityScore: processData.automationScore || 0.5,
          estimatedRoiPercentage: processData.estimatedROI || 0,
          implementationComplexity: processData.complexity || 'medium',
          systemsInvolved: processData.systemsInvolved || [],
          integrationComplexity: processData.integrationComplexity || 'medium',
          processMetadata: processData.metadata || {}
        }
      });
    }
  }

  private mapEmailEventToStatus(event: string): any {
    const statusMap: Record<string, string> = {
      'delivered': 'sent',
      'bounced': 'bounced',
      'failed': 'failed',
      'opened': 'sent', // Keep as sent, but log the open event
      'clicked': 'sent'  // Keep as sent, but log the click event
    };

    return statusMap[event] || 'pending';
  }

  private async sendFormCompletionNotification(form: any, response: any): Promise<void> {
    // This would integrate with your notification system
    // For now, just log the event
    logger.info('Form completion notification triggered', {
      clientId: form.clientId,
      formId: form.id,
      responseId: response.id,
      completionTime: response.completionTimeMinutes
    });
  }

  private async sendAIProcessingFailureAlert(aiJob: any, error: any): Promise<void> {
    // This would send an alert to administrators
    logger.error('AI processing failure alert', {
      jobId: aiJob.id,
      clientId: aiJob.clientId,
      error: error.message,
      retryCount: aiJob.retryCount,
      requiresManualIntervention: true
    });
  }
}