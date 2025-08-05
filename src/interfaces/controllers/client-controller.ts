/**
 * Client Controller
 * Handles client CRUD operations with business rule enforcement
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
import { LGPDDataSubjectRights } from '@/shared/middleware/audit-middleware';
import { config } from '@/config/environment';

const prisma = new PrismaClient();

export class ClientController {
  
  // GET /api/v1/clients - List all clients with filtering and pagination
  async getClients(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const {
        page,
        limit,
        industry,
        companySize,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query as any;

      // Build where clause for filtering
      const where: any = {};
      
      // Filter by consultant ownership (except for admins and senior consultants)
      if (req.user && !['admin', 'senior_consultant'].includes(req.user.role)) {
        where.createdBy = req.user.id;
      }

      if (industry) where.industry = { code: industry };
      if (companySize) where.companySize = companySize;
      if (status) where.currentStatus = status;
      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive'
        };
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Execute query with pagination
      const [clients, totalCount] = await Promise.all([
        prisma.client.findMany({
          where,
          include: {
            industry: {
              select: {
                code: true,
                name: true,
                displayNameEs: true,
                isRegulated: true
              }
            },
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                generatedForms: true,
                generatedSOPs: true,
                commercialProposals: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take
        }),
        prisma.client.count({ where })
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / take);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Log performance metric
      const duration = Date.now() - startTime;
      logger.performance({
        metric: 'client_list_query',
        value: duration,
        unit: 'ms',
        additionalContext: {
          resultCount: clients.length,
          totalCount,
          filters: { industry, companySize, status, search }
        }
      });

      // Business event logging
      logger.business({
        event: 'clients_listed',
        userId: req.user?.id,
        metadata: {
          count: clients.length,
          filters: { industry, companySize, status },
          duration
        }
      });

      res.status(200).json({
        success: true,
        data: clients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: totalPages,
          hasNext: hasNextPage,
          hasPrev: hasPrevPage
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
        action: 'get_clients'
      });
      throw error;
    }
  }

  // GET /api/v1/clients/:id - Get client by ID
  async getClientById(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const { id } = req.params;

    try {
      // Try to get from cache first
      const cacheKey = `client:${id}:detailed`;
      let client = await cache.get(cacheKey);

      if (!client) {
        // Get from database with full details
        client = await prisma.client.findUnique({
          where: { id },
          include: {
            industry: {
              select: {
                code: true,
                name: true,
                displayNameEs: true,
                isRegulated: true,
                typicalProcesses: true,
                commonPainPoints: true
              }
            },
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            generatedForms: {
              select: {
                id: true,
                status: true,
                completionPercentage: true,
                createdAt: true,
                completedAt: true
              },
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            generatedSOPs: {
              select: {
                id: true,
                objective: true,
                isApproved: true,
                createdAt: true
              },
              orderBy: { createdAt: 'desc' }
            },
            commercialProposals: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                sentAt: true
              },
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            workflowTransitions: {
              select: {
                fromStatus: true,
                toStatus: true,
                triggerEvent: true,
                createdAt: true
              },
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        });

        if (!client) {
          throw new NotFoundError('Client');
        }

        // Cache for 30 minutes
        await cache.setClientData(id, client, 1800);
      }

      // Generate predefined analysis based on industry and company size
      const predefinedAnalysis = await this.generatePredefinedAnalysis(
        client.industry.code, 
        client.companySize
      );

      // Calculate next steps
      const nextSteps = this.calculateNextSteps(client);

      const duration = Date.now() - startTime;
      
      // Log performance metric
      logger.performance({
        metric: 'client_detail_query',
        value: duration,
        unit: 'ms',
        clientId: id
      });

      res.status(200).json({
        success: true,
        data: {
          ...client,
          predefinedAnalysis,
          nextSteps
        },
        meta: {
          duration,
          timestamp: new Date().toISOString(),
          cached: !!await cache.exists(cacheKey)
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId: id,
        action: 'get_client_by_id'
      });
      throw error;
    }
  }

  // POST /api/v1/clients - Create new client
  async createClient(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const {
        name,
        industry,
        companySize,
        subindustry,
        yearsOperation,
        employeeCount,
        annualRevenue,
        contactEmail
      } = req.body;

      // Validate industry exists
      const industryRecord = await prisma.industry.findUnique({
        where: { code: industry },
        include: {
          questionTemplates: {
            where: { 
              companySize: companySize,
              isActive: true
            }
          }
        }
      });

      if (!industryRecord) {
        throw new BusinessRuleError(
          `Industry '${industry}' not supported. Please contact support to add this industry.`,
          'UNSUPPORTED_INDUSTRY'
        );
      }

      // Check for duplicate client (same name + contact email)
      const existingClient = await prisma.client.findFirst({
        where: {
          name,
          contactEmail
        }
      });

      if (existingClient) {
        throw new ConflictError('Client with this name and email already exists');
      }

      // Perform AI classification (simplified - in real implementation would call AI service)
      const classification = await this.performAIClassification({
        name,
        industry,
        companySize,
        yearsOperation,
        employeeCount,
        annualRevenue
      });

      // Create client with classification
      const client = await prisma.client.create({
        data: {
          name,
          industryId: industryRecord.id,
          subindustry,
          companySize: companySize as any,
          yearsOperation,
          employeeCount,
          annualRevenue,
          contactEmail,
          classificationConfidence: classification.confidence,
          classificationTimestamp: new Date(),
          classificationMetadata: classification.metadata,
          createdBy: req.user?.id
        },
        include: {
          industry: true
        }
      });

      // Create data processing record for LGPD compliance
      await prisma.dataProcessingRecord.create({
        data: {
          clientId: client.id,
          consentGiven: true,
          consentDate: new Date(),
          consentType: 'client_registration',
          consentText: 'User consented to data processing for business process analysis',
          processingPurpose: 'Business process analysis and automation consulting',
          legalBasis: 'consent',
          retentionPeriodMonths: 24
        }
      });

      // Log workflow transition
      await prisma.workflowTransition.create({
        data: {
          clientId: client.id,
          fromStatus: null,
          toStatus: 'created',
          triggerEvent: 'client_registration',
          triggeredBy: req.user?.id,
          additionalData: {
            source: 'manual_creation',
            classificationConfidence: classification.confidence
          }
        }
      });

      // Generate predefined analysis
      const predefinedAnalysis = await this.generatePredefinedAnalysis(
        industryRecord.code,
        companySize
      );

      // Calculate next steps
      const nextSteps = this.calculateNextSteps(client);

      const duration = Date.now() - startTime;

      // Log business event
      logger.business({
        event: 'client_created',
        clientId: client.id,
        userId: req.user?.id,
        metadata: {
          industry: industry,
          companySize,
          duration,
          classificationConfidence: classification.confidence
        }
      });

      // Log client status change
      logger.clientStatusChanged(
        client.id,
        'none',
        'created',
        req.user?.id,
        'client_registration'
      );

      res.status(201).json({
        success: true,
        data: {
          clientId: client.id,
          classification: {
            industry: {
              code: industryRecord.code,
              name: industryRecord.name,
              displayNameEs: industryRecord.displayNameEs,
              isRegulated: industryRecord.isRegulated
            },
            confidence: classification.confidence,
            predefinedAnalysis
          },
          nextSteps
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
        action: 'create_client',
        clientData: { name: req.body.name, industry: req.body.industry }
      });
      throw error;
    }
  }

  // PUT /api/v1/clients/:id - Update client
  async updateClient(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const { id } = req.params;

    try {
      // Check if client exists
      const existingClient = await prisma.client.findUnique({
        where: { id },
        include: { industry: true }
      });

      if (!existingClient) {
        throw new NotFoundError('Client');
      }

      const updateData: any = {};
      let industryChanged = false;

      // Prepare update data and validate industry if changed
      if (req.body.industry && req.body.industry !== existingClient.industry.code) {
        const industryRecord = await prisma.industry.findUnique({
          where: { code: req.body.industry }
        });

        if (!industryRecord) {
          throw new BusinessRuleError(
            `Industry '${req.body.industry}' not supported`,
            'UNSUPPORTED_INDUSTRY'
          );
        }

        updateData.industryId = industryRecord.id;
        industryChanged = true;
      }

      // Add other fields
      const updatableFields = [
        'name', 'subindustry', 'companySize', 'yearsOperation', 
        'employeeCount', 'annualRevenue', 'contactEmail'
      ];

      for (const field of updatableFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      // Re-classify if significant changes
      if (industryChanged || req.body.companySize || req.body.employeeCount) {
        const classification = await this.performAIClassification({
          name: req.body.name || existingClient.name,
          industry: req.body.industry || existingClient.industry.code,
          companySize: req.body.companySize || existingClient.companySize,
          yearsOperation: req.body.yearsOperation || existingClient.yearsOperation,
          employeeCount: req.body.employeeCount || existingClient.employeeCount,
          annualRevenue: req.body.annualRevenue || existingClient.annualRevenue
        });

        updateData.classificationConfidence = classification.confidence;
        updateData.classificationTimestamp = new Date();
        updateData.classificationMetadata = classification.metadata;
      }

      // Update client
      const updatedClient = await prisma.client.update({
        where: { id },
        data: updateData,
        include: {
          industry: true,
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Invalidate cache
      await cache.invalidateClientData(id);

      // Log workflow transition if significant change
      if (industryChanged) {
        await prisma.workflowTransition.create({
          data: {
            clientId: id,
            fromStatus: existingClient.currentStatus,
            toStatus: existingClient.currentStatus, // Status doesn't change, but industry does
            triggerEvent: 'industry_reclassification',
            triggeredBy: req.user?.id,
            additionalData: {
              previousIndustry: existingClient.industry.code,
              newIndustry: req.body.industry,
              reclassificationConfidence: updateData.classificationConfidence
            }
          }
        });
      }

      const duration = Date.now() - startTime;

      // Log business event
      logger.business({
        event: 'client_updated',
        clientId: id,
        userId: req.user?.id,
        metadata: {
          updatedFields: Object.keys(updateData),
          industryChanged,
          duration
        }
      });

      res.status(200).json({
        success: true,
        data: updatedClient,
        meta: {
          duration,
          timestamp: new Date().toISOString(),
          updatedFields: Object.keys(updateData)
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId: id,
        action: 'update_client'
      });
      throw error;
    }
  }

  // DELETE /api/v1/clients/:id - Delete client (admin only)
  async deleteClient(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      // Check if client exists
      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          generatedForms: { select: { id: true } },
          generatedSOPs: { select: { id: true } },
          commercialProposals: { select: { id: true } }
        }
      });

      if (!client) {
        throw new NotFoundError('Client');
      }

      // Check if client has associated data
      const hasAssociatedData = 
        client.generatedForms.length > 0 ||
        client.generatedSOPs.length > 0 ||
        client.commercialProposals.length > 0;

      if (hasAssociatedData) {
        throw new BusinessRuleError(
          'Cannot delete client with associated forms, SOPs, or proposals. Use data deletion endpoint instead.',
          'CLIENT_HAS_ASSOCIATED_DATA'
        );
      }

      // Delete client (cascade will handle related records)
      await prisma.client.delete({
        where: { id }
      });

      // Invalidate cache
      await cache.invalidateClientData(id);

      // Log audit event
      logger.audit('Client deleted', {
        action: 'client_deleted',
        userId: req.user?.id,
        clientId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          clientName: client.name,
          hadAssociatedData: hasAssociatedData
        },
        sensitiveData: true
      });

      res.status(200).json({
        success: true,
        message: 'Client deleted successfully',
        data: {
          deletedClientId: id,
          deletedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId: id,
        action: 'delete_client'
      });
      throw error;
    }
  }

  // GET /api/v1/clients/:id/dashboard - Get client dashboard data
  async getClientDashboard(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      // Get comprehensive client data for dashboard
      const [client, recentActivity, metrics] = await Promise.all([
        prisma.client.findUnique({
          where: { id },
          include: {
            industry: true,
            generatedForms: {
              orderBy: { createdAt: 'desc' },
              take: 5
            },
            generatedSOPs: {
              include: {
                process: {
                  select: {
                    processName: true,
                    processCategory: true,
                    automationFeasibilityScore: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' }
            },
            commercialProposals: {
              orderBy: { createdAt: 'desc' },
              take: 3
            },
            workflowTransitions: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }),
        this.getClientRecentActivity(id),
        this.getClientMetrics(id)
      ]);

      if (!client) {
        throw new NotFoundError('Client');
      }

      // Calculate progress percentages
      const progress = this.calculateClientProgress(client);

      res.status(200).json({
        success: true,
        data: {
          client,
          progress,
          recentActivity,
          metrics,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId: id,
        action: 'get_client_dashboard'
      });
      throw error;
    }
  }

  // POST /api/v1/clients/:id/export - Export client data (LGPD)
  async exportClientData(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { format = 'json', includeAuditLogs = false } = req.body;

    try {
      // Export all client data
      const exportData = await prisma.client.findUnique({
        where: { id },
        include: {
          industry: true,
          generatedForms: {
            include: {
              formResponse: true
            }
          },
          identifiedProcesses: true,
          generatedSOPs: true,
          automationAnalysis: true,
          commercialProposals: true,
          notifications: true,
          workflowTransitions: true,
          dataProcessingRecords: true,
          ...(includeAuditLogs && {
            auditLogs: {
              where: {
                entityId: id
              }
            }
          })
        }
      });

      if (!exportData) {
        throw new NotFoundError('Client');
      }

      // Log LGPD data access
      await LGPDDataSubjectRights.logDataAccess(
        id,
        req.user?.id || 'unknown',
        ['client_data', 'forms', 'processes', 'sops', 'proposals'],
        req.ip
      );

      const exportMetadata = {
        exportDate: new Date().toISOString(),
        requestedBy: req.user?.id,
        format,
        includeAuditLogs,
        dataTypes: Object.keys(exportData).filter(key => 
          !['id', 'createdAt', 'updatedAt'].includes(key)
        )
      };

      res.status(200).json({
        success: true,
        data: exportData,
        metadata: exportMetadata
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId: id,
        action: 'export_client_data'
      });
      throw error;
    }
  }

  // DELETE /api/v1/clients/:id/data - Delete all client data (LGPD)
  async deleteClientData(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { confirmation, reason } = req.body;

    try {
      if (confirmation !== 'DELETE_ALL_DATA') {
        throw new ValidationError('Invalid confirmation string');
      }

      if (!reason || reason.length < 10) {
        throw new ValidationError('Deletion reason must be at least 10 characters');
      }

      // Perform complete data deletion
      const deletionResults = await prisma.$transaction(async (tx) => {
        // Delete in proper order to avoid foreign key constraints
        const auditLogs = await tx.auditLog.deleteMany({ where: { entityId: id } });
        const dataProcessing = await tx.dataProcessingRecord.deleteMany({ where: { clientId: id } });
        const notifications = await tx.notification.deleteMany({ where: { clientId: id } });
        const proposals = await tx.commercialProposal.deleteMany({ where: { clientId: id } });
        const analysis = await tx.automationAnalysis.deleteMany({ where: { clientId: id } });
        const sops = await tx.generatedSOP.deleteMany({ where: { clientId: id } });
        const processes = await tx.identifiedProcess.deleteMany({ where: { clientId: id } });
        const aiJobs = await tx.aIProcessingJob.deleteMany({ where: { clientId: id } });
        const responses = await tx.formResponse.deleteMany({ where: { clientId: id } });
        const forms = await tx.generatedForm.deleteMany({ where: { clientId: id } });
        const workflows = await tx.workflowTransition.deleteMany({ where: { clientId: id } });
        const metrics = await tx.systemMetric.deleteMany({ where: { clientId: id } });
        const client = await tx.client.delete({ where: { id } });

        return {
          auditLogs: auditLogs.count,
          dataProcessing: dataProcessing.count,
          notifications: notifications.count,
          proposals: proposals.count,
          analysis: analysis.count,
          sops: sops.count,
          processes: processes.count,
          aiJobs: aiJobs.count,
          responses: responses.count,
          forms: forms.count,
          workflows: workflows.count,
          metrics: metrics.count,
          client: client ? 1 : 0
        };
      });

      // Invalidate all related cache
      await cache.invalidateClientData(id);

      // Log LGPD data erasure
      await LGPDDataSubjectRights.logDataErasure(
        id,
        req.user?.id || 'unknown',
        Object.keys(deletionResults),
        req.ip
      );

      res.status(200).json({
        success: true,
        message: 'All client data deleted successfully (LGPD compliance)',
        deletionSummary: deletionResults,
        deletedAt: new Date().toISOString(),
        reason
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId: id,
        action: 'delete_client_data'
      });
      throw error;
    }
  }

  // Private helper methods

  private async performAIClassification(clientData: any): Promise<any> {
    // Simplified AI classification - in real implementation would call AI service
    // This simulates the classification based on industry and company characteristics
    
    const baseConfidence = 0.85;
    let adjustedConfidence = baseConfidence;

    // Adjust confidence based on data completeness
    const completenessScore = Object.values(clientData).filter(v => v !== null && v !== undefined).length / Object.keys(clientData).length;
    adjustedConfidence *= completenessScore;

    // Simulate industry-specific confidence adjustments
    const industryConfidenceMap: Record<string, number> = {
      'accounting': 0.95,
      'real_estate': 0.90,
      'sales': 0.88,
      'healthcare': 0.92,
      'agriculture': 0.85,
      'consulting': 0.90
    };

    const industryMultiplier = industryConfidenceMap[clientData.industry] || 0.80;
    adjustedConfidence *= industryMultiplier;

    return {
      confidence: Math.min(0.98, Math.max(0.60, adjustedConfidence)),
      metadata: {
        completenessScore,
        industryMultiplier,
        classificationDate: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  private async generatePredefinedAnalysis(industryCode: string, companySize: string): Promise<any[]> {
    // Get industry-specific processes and recommendations
    const industry = await prisma.industry.findUnique({
      where: { code: industryCode },
      select: {
        typicalProcesses: true,
        commonPainPoints: true,
        automationBenchmarks: true
      }
    });

    if (!industry) return [];

    const typicalProcesses = industry.typicalProcesses as any[];
    const painPoints = industry.commonPainPoints as any[];

    // Generate analysis based on company size
    const sizeMultipliers = {
      micro: { complexity: 0.6, processCount: 0.5 },
      small: { complexity: 0.8, processCount: 0.7 },
      medium: { complexity: 1.0, processCount: 1.0 },
      large: { complexity: 1.2, processCount: 1.3 }
    };

    const multiplier = sizeMultipliers[companySize as keyof typeof sizeMultipliers] || sizeMultipliers.medium;

    return typicalProcesses.slice(0, Math.ceil(typicalProcesses.length * multiplier.processCount)).map(process => ({
      ...process,
      estimatedComplexity: Math.min(10, Math.ceil(5 * multiplier.complexity)),
      relevantPainPoints: painPoints.slice(0, 3),
      automationPotential: this.calculateAutomationPotential(process.category, companySize)
    }));
  }

  private calculateAutomationPotential(category: string, size: string): string {
    const potentialMap = {
      primary: { micro: 'medium', small: 'high', medium: 'high', large: 'very_high' },
      support: { micro: 'low', small: 'medium', medium: 'high', large: 'high' },
      management: { micro: 'low', small: 'low', medium: 'medium', large: 'high' }
    };

    return potentialMap[category as keyof typeof potentialMap]?.[size as keyof any] || 'medium';
  }

  private calculateNextSteps(client: any): any {
    const steps = [];

    switch (client.currentStatus) {
      case 'created':
        steps.push({
          action: 'generate_form',
          title: 'Generate Diagnostic Form',
          description: `Create personalized form with ${this.getQuestionCount(client.companySize)} questions`,
          estimatedTime: '2-3 minutes',
          priority: 'high'
        });
        break;
      
      case 'form_sent':
        steps.push({
          action: 'follow_up',
          title: 'Follow up on Form Completion',
          description: 'Send reminder or contact client about form completion',
          estimatedTime: '5 minutes',
          priority: 'medium'
        });
        break;
      
      case 'responses_received':
        steps.push({
          action: 'start_ai_processing',
          title: 'Start AI Analysis',
          description: 'Process form responses to identify business processes',
          estimatedTime: '2-5 minutes',
          priority: 'high'
        });
        break;
      
      case 'sops_generated':
        steps.push({
          action: 'review_sops',
          title: 'Review Generated SOPs',
          description: 'Validate and approve the generated Standard Operating Procedures',
          estimatedTime: '15-30 minutes',
          priority: 'high'
        });
        break;
      
      case 'proposal_ready':
        steps.push({
          action: 'send_proposal',
          title: 'Send Commercial Proposal',
          description: 'Review and send automation proposal to client',
          estimatedTime: '10 minutes',
          priority: 'high'
        });
        break;
    }

    return {
      current: steps,
      formGeneration: client.currentStatus === 'created',
      estimatedQuestions: this.getQuestionCount(client.companySize),
      completionTime: this.getEstimatedCompletionTime(client.companySize, client.industry?.isRegulated)
    };
  }

  private getQuestionCount(companySize: string): number {
    const ranges = config.businessRules.questionCountByCompanySize[companySize as keyof typeof config.businessRules.questionCountByCompanySize];
    return Math.floor((ranges.min + ranges.max) / 2);
  }

  private getEstimatedCompletionTime(companySize: string, isRegulated: boolean = false): number {
    const baseTimes = { micro: 25, small: 35, medium: 45, large: 60 };
    const baseTime = baseTimes[companySize as keyof typeof baseTimes] || 45;
    return baseTime + (isRegulated ? 15 : 0);
  }

  private async getClientRecentActivity(clientId: string): Promise<any[]> {
    const activities = await prisma.workflowTransition.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return activities.map(activity => ({
      type: 'workflow_transition',
      action: activity.triggerEvent,
      fromStatus: activity.fromStatus,
      toStatus: activity.toStatus,
      user: activity.user?.name || 'System',
      timestamp: activity.createdAt,
      metadata: activity.additionalData
    }));
  }

  private async getClientMetrics(clientId: string): Promise<any> {
    const [formsCount, sopsCount, proposalsCount] = await Promise.all([
      prisma.generatedForm.count({ where: { clientId } }),
      prisma.generatedSOP.count({ where: { clientId } }),
      prisma.commercialProposal.count({ where: { clientId } })
    ]);

    return {
      totalForms: formsCount,
      totalSOPs: sopsCount,
      totalProposals: proposalsCount,
      lastActivity: new Date() // This would be calculated from recent activities
    };
  }

  private calculateClientProgress(client: any): any {
    const statusProgress = {
      created: 10,
      form_sent: 25,
      responses_received: 40,
      processing_ai: 55,
      sops_generated: 75,  
      proposal_ready: 90,
      proposal_sent: 100,
      closed: 100
    };

    const currentProgress = statusProgress[client.currentStatus as keyof typeof statusProgress] || 0;

    return {
      overall: currentProgress,
      stages: {
        clientRegistration: 100,
        formGeneration: currentProgress >= 25 ? 100 : (currentProgress >= 10 ? 50 : 0),
        formCompletion: currentProgress >= 40 ? 100 : 0,
        aiProcessing: currentProgress >= 55 ? 100 : (currentProgress >= 40 ? 50 : 0),
        sopGeneration: currentProgress >= 75 ? 100 : (currentProgress >= 55 ? 50 : 0),
        proposalGeneration: currentProgress >= 90 ? 100 : (currentProgress >= 75 ? 50 : 0),
        proposalDelivery: currentProgress >= 100 ? 100 : 0
      }
    };
  }
}