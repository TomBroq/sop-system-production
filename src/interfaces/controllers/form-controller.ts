/**
 * Form Controller
 * Handles dynamic form generation and business logic implementation
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/logger';
import { cache } from '@/infrastructure/cache/redis-connection';
import { 
  NotFoundError, 
  ConflictError,
  BusinessRuleError,
  ValidationError
} from '@/shared/middleware/error-handler';
import { config } from '@/config/environment';
import { QueueManager } from '@/infrastructure/queue/queue-manager';

const prisma = new PrismaClient();

export class FormController {

  // POST /api/v1/forms/generate - Generate adaptive form for client
  async generateForm(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const { clientId } = req.body;

    try {
      // Get client with industry information
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          industry: {
            include: {
              questionTemplates: {
                where: {
                  companySize: client?.companySize,
                  isActive: true
                },
                orderBy: { priority: 'desc' }
              }
            }
          },
          generatedForms: {
            where: { status: { in: ['pending', 'in_progress'] } }
          }
        }
      });

      if (!client) {
        throw new NotFoundError('Client');
      }

      // Check if client already has an active form
      if (client.generatedForms.length > 0) {
        throw new ConflictError('Client already has an active form in progress');
      }

      // Validate client status
      if (client.currentStatus !== 'created') {
        throw new BusinessRuleError(
          `Cannot generate form for client in status '${client.currentStatus}'. Expected: 'created'`,
          'INVALID_CLIENT_STATUS'
        );
      }

      // Get question count based on business rules
      const questionConfig = config.businessRules.questionCountByCompanySize[
        client.companySize as keyof typeof config.businessRules.questionCountByCompanySize
      ];

      if (!questionConfig) {
        throw new BusinessRuleError(
          `Invalid company size: ${client.companySize}`,
          'INVALID_COMPANY_SIZE'
        );
      }

      // Generate adaptive question set
      const selectedQuestions = await this.generateAdaptiveQuestions(
        client.industry.questionTemplates,
        questionConfig.min,
        questionConfig.max,
        client
      );

      // Validate minimum requirements
      if (selectedQuestions.length < questionConfig.min) {
        throw new BusinessRuleError(
          `Not enough questions available for ${client.companySize} companies in ${client.industry.code} industry. Need ${questionConfig.min}, found ${selectedQuestions.length}`,
          'INSUFFICIENT_QUESTIONS'
        );
      }

      // Create form in Tally (would integrate with actual Tally API)
      const tallyForm = await this.createTallyForm(client, selectedQuestions);

      // Create form record in database
      const form = await prisma.generatedForm.create({
        data: {
          clientId,
          industryCode: client.industry.code,
          companySize: client.companySize,
          totalQuestions: selectedQuestions.length,
          selectedQuestions: selectedQuestions.map(q => ({
            id: q.id,
            question: q.questionText,
            type: q.questionType,
            required: q.isRequired,
            category: q.category
          })),
          tallyFormId: tallyForm.id,
          tallyFormUrl: tallyForm.url,
          status: 'pending',
          generationMetadata: {
            generatedAt: new Date(),
            questionSelectionAlgorithm: 'adaptive_priority_v1',
            industryMatchScore: 1.0,
            companySizeMatchScore: 1.0,
            estimatedCompletionTime: this.calculateEstimatedTime(selectedQuestions.length, client.industry.isRegulated)
          }
        }
      });

      // Update client status
      await prisma.client.update({
        where: { id: clientId },
        data: { currentStatus: 'form_sent' }
      });

      // Create workflow transition
      await prisma.workflowTransition.create({
        data: {
          clientId,
          fromStatus: 'created',
          toStatus: 'form_sent',
          triggerEvent: 'form_generated',
          triggeredBy: req.user?.id,
          additionalData: {
            formId: form.id,
            questionCount: selectedQuestions.length,
            tallyFormId: tallyForm.id,
            estimatedCompletionTime: form.generationMetadata.estimatedCompletionTime
          }
        }
      });

      // Queue notification to send form to client
      await QueueManager.addNotificationJob({
        type: 'form_ready',
        clientId,
        formId: form.id,
        priority: 'normal'
      });

      const duration = Date.now() - startTime;

      // Log business event
      logger.formGenerated(
        clientId,
        form.id,
        selectedQuestions.length,
        duration
      );

      logger.clientStatusChanged(
        clientId,
        'created',
        'form_sent',
        req.user?.id,
        'form_generated'
      );

      // Cache form data
      await cache.setFormData(form.id, {
        id: form.id,
        clientId,
        totalQuestions: selectedQuestions.length,
        status: 'pending',
        createdAt: new Date()
      });

      res.status(201).json({
        success: true,
        data: {
          formId: form.id,
          tallyFormUrl: tallyForm.url,
          questionCount: selectedQuestions.length,
          estimatedCompletionTime: form.generationMetadata.estimatedCompletionTime,
          formDetails: {
            categories: this.categorizeQuestions(selectedQuestions),
            adaptiveFeatures: {
              industrySpecific: selectedQuestions.filter(q => q.industrySpecific).length,
              sizeOptimized: true,
              businessRulesApplied: questionConfig
            }
          }
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
        action: 'generate_form'
      });
      throw error;
    }
  }

  // GET /api/v1/forms/:id - Get form details
  async getFormById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const form = await prisma.generatedForm.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              currentStatus: true,
              industry: {
                select: {
                  code: true,
                  displayNameEs: true
                }
              }
            }
          },
          formResponse: {
            select: {
              id: true,
              submittedAt: true,
              completionTimeMinutes: true,
              validationScore: true
            }
          }
        }
      });

      if (!form) {
        throw new NotFoundError('Form');
      }

      // Get completion statistics if form is completed
      let completionStats = null;
      if (form.status === 'completed' && form.formResponse) {
        completionStats = {
          submittedAt: form.formResponse.submittedAt,
          completionTime: form.formResponse.completionTimeMinutes,
          validationScore: form.formResponse.validationScore,
          completionRate: Math.round((form.completionPercentage || 0) * 100) / 100
        };
      }

      res.status(200).json({
        success: true,
        data: {
          ...form,
          completionStats,
          questionBreakdown: this.categorizeQuestions(form.selectedQuestions as any[])
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        formId: id,
        action: 'get_form_by_id'
      });
      throw error;
    }
  }

  // GET /api/v1/forms/client/:clientId - Get forms for client
  async getFormsByClient(req: Request, res: Response): Promise<void> {
    const { clientId } = req.params;
    const { status, limit = 10 } = req.query;

    try {
      const where: any = { clientId };
      if (status) where.status = status;

      const forms = await prisma.generatedForm.findMany({
        where,
        include: {
          formResponse: {
            select: {
              id: true,
              submittedAt: true,
              completionTimeMinutes: true,
              validationScore: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string)
      });

      res.status(200).json({
        success: true,
        data: forms,
        meta: {
          count: forms.length,
          clientId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId,
        action: 'get_forms_by_client'
      });
      throw error;
    }
  }

  // POST /api/v1/forms/:id/resend - Resend form to client
  async resendForm(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { method = 'email' } = req.body;

    try {
      const form = await prisma.generatedForm.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              contactEmail: true
            }
          }
        }
      });

      if (!form) {
        throw new NotFoundError('Form');
      }

      if (form.status === 'completed') {
        throw new BusinessRuleError(
          'Cannot resend completed form',
          'FORM_ALREADY_COMPLETED'
        );
      }

      // Queue notification job
      await QueueManager.addNotificationJob({
        type: 'form_reminder',
        clientId: form.clientId,
        formId: form.id,
        method,
        priority: 'normal'
      });

      // Update form metadata
      await prisma.generatedForm.update({
        where: { id },
        data: {
          generationMetadata: {
            ...form.generationMetadata as any,
            lastReminderSent: new Date(),
            reminderCount: ((form.generationMetadata as any)?.reminderCount || 0) + 1
          }
        }
      });

      logger.business({
        event: 'form_resent',
        clientId: form.clientId,
        userId: req.user?.id,
        metadata: {
          formId: id,
          method,
          reminderCount: ((form.generationMetadata as any)?.reminderCount || 0) + 1
        }
      });

      res.status(200).json({
        success: true,
        message: 'Form resent successfully',
        data: {
          formId: id,
          method,
          sentAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        formId: id,
        action: 'resend_form'
      });
      throw error;
    }
  }

  // DELETE /api/v1/forms/:id - Cancel form (admin only)
  async cancelForm(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;

    try {
      const form = await prisma.generatedForm.findUnique({
        where: { id },
        include: { client: true }
      });

      if (!form) {
        throw new NotFoundError('Form');
      }

      if (form.status === 'completed') {
        throw new BusinessRuleError(
          'Cannot cancel completed form',
          'FORM_ALREADY_COMPLETED'  
        );
      }

      // Update form status
      await prisma.generatedForm.update({
        where: { id },
        data: {
          status: 'cancelled',
          generationMetadata: {
            ...form.generationMetadata as any,
            cancelledAt: new Date(),
            cancelledBy: req.user?.id,
            cancellationReason: reason
          }
        }
      });

      // Revert client status if needed
      if (form.client.currentStatus === 'form_sent') {
        await prisma.client.update({
          where: { id: form.clientId },
          data: { currentStatus: 'created' }
        });

        // Create workflow transition
        await prisma.workflowTransition.create({
          data: {
            clientId: form.clientId,
            fromStatus: 'form_sent',
            toStatus: 'created',
            triggerEvent: 'form_cancelled',
            triggeredBy: req.user?.id,
            additionalData: {
              formId: id,
              reason
            }
          }
        });
      }

      // Invalidate cache
      await cache.del(`form:${id}`);
      await cache.invalidateClientData(form.clientId);

      logger.business({
        event: 'form_cancelled',
        clientId: form.clientId,
        userId: req.user?.id,
        metadata: {
          formId: id,
          reason,
          previousStatus: form.status
        }
      });

      res.status(200).json({
        success: true,
        message: 'Form cancelled successfully',
        data: {
          formId: id,
          cancelledAt: new Date().toISOString(),
          reason
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        formId: id,
        action: 'cancel_form'
      });
      throw error;
    }
  }

  // Private helper methods

  private async generateAdaptiveQuestions(
    questionTemplates: any[],
    minQuestions: number,
    maxQuestions: number,
    client: any
  ): Promise<any[]> {
    // Sort questions by priority and relevance
    const sortedQuestions = questionTemplates.sort((a, b) => {
      // Higher priority first
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Industry-specific questions preferred
      if (a.industrySpecific !== b.industrySpecific) {
        return a.industrySpecific ? -1 : 1;
      }
      
      // Required questions first
      if (a.isRequired !== b.isRequired) {
        return a.isRequired ? -1 : 1;
      }
      
      return 0;
    });

    const selectedQuestions = [];
    const requiredQuestions = sortedQuestions.filter(q => q.isRequired);
    
    // First, add all required questions
    selectedQuestions.push(...requiredQuestions);

    // Add optional questions up to maxQuestions
    const optionalQuestions = sortedQuestions.filter(q => !q.isRequired);
    const remainingSlots = maxQuestions - selectedQuestions.length;

    // Apply intelligent selection algorithm
    const additionalQuestions = this.selectOptionalQuestions(
      optionalQuestions,
      remainingSlots,
      client
    );

    selectedQuestions.push(...additionalQuestions);

    // Ensure we meet minimum requirements
    if (selectedQuestions.length < minQuestions) {
      const moreQuestions = optionalQuestions
        .filter(q => !selectedQuestions.some(sq => sq.id === q.id))
        .slice(0, minQuestions - selectedQuestions.length);
      
      selectedQuestions.push(...moreQuestions);
    }

    return selectedQuestions.slice(0, maxQuestions);
  }

  private selectOptionalQuestions(
    optionalQuestions: any[],
    maxCount: number,
    client: any
  ): any[] {
    const selected = [];
    const categories = new Set();

    // Apply business rules for question selection
    for (const question of optionalQuestions) {
      if (selected.length >= maxCount) break;

      // Ensure category diversity
      if (categories.size < 5 || categories.has(question.category)) {
        // Company size specific logic
        if (this.isQuestionRelevantForSize(question, client.companySize)) {
          selected.push(question);
          categories.add(question.category);
        }
      }
    }

    return selected;
  }

  private isQuestionRelevantForSize(question: any, companySize: string): boolean {
    const sizeRelevance = {
      micro: ['basic_operations', 'financial_management', 'sales_processes'],
      small: ['operations', 'hr_processes', 'customer_service', 'financial_management'],
      medium: ['operations', 'hr_processes', 'customer_service', 'supply_chain', 'compliance'],
      large: ['all_categories']
    };

    const relevantCategories = sizeRelevance[companySize as keyof typeof sizeRelevance] || [];
    
    return relevantCategories.includes('all_categories') || 
           relevantCategories.includes(question.category);
  }

  private async createTallyForm(client: any, questions: any[]): Promise<any> {
    // This would integrate with actual Tally Forms API
    // For now, simulate the response
    const formId = `tally_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: formId,
      url: `https://tally.so/r/${formId}`,
      title: `Diagnóstico de Procesos - ${client.name}`,
      description: `Formulario personalizado para análisis de procesos empresariales`,
      questions: questions.length,
      estimatedTime: this.calculateEstimatedTime(questions.length, client.industry.isRegulated)
    };
  }

  private calculateEstimatedTime(questionCount: number, isRegulated: boolean = false): number {
    // Base time: 1.5 minutes per question
    let baseTime = questionCount * 1.5;
    
    // Regulated industries require more detailed answers
    if (isRegulated) {
      baseTime *= 1.3;
    }
    
    // Add buffer time
    return Math.ceil(baseTime + 5);
  }

  private categorizeQuestions(questions: any[]): any {
    const categories = questions.reduce((acc, question) => {
      const category = question.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(question);
      return acc;
    }, {});

    return {
      categories: Object.keys(categories),
      breakdown: Object.entries(categories).map(([name, qs]) => ({
        category: name,
        count: (qs as any[]).length,
        required: (qs as any[]).filter(q => q.required).length
      })),
      totalCategories: Object.keys(categories).length
    };
  }
}