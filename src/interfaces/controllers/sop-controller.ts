/**
 * SOP Controller
 * Handles Standard Operating Procedures generation, management, and approval
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/shared/logger';
import { cache } from '@/infrastructure/cache/redis-connection';
import { 
  NotFoundError, 
  BusinessRuleError,
  ValidationError,
  ConflictError
} from '@/shared/middleware/error-handler';
import { QueueManager } from '@/infrastructure/queue/queue-manager';

const prisma = new PrismaClient();

export class SOPController {

  // GET /api/v1/sops/client/:clientId - Get SOPs for client
  async getSOPsByClient(req: Request, res: Response): Promise<void> {
    const { clientId } = req.params;
    const { 
      status, 
      category,
      approved,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    try {
      const where: any = { clientId };
      if (status) where.status = status;
      if (approved !== undefined) where.isApproved = approved === 'true';

      // Category filter applied through process relationship
      let processWhere: any = {};
      if (category) processWhere.processCategory = category;

      const sops = await prisma.generatedSOP.findMany({
        where: {
          ...where,
          ...(category && {
            process: processWhere
          })
        },
        include: {
          process: {
            select: {
              id: true,
              processName: true,
              processCategory: true,
              automationFeasibilityScore: true,
              estimatedRoiPercentage: true,
              implementationComplexity: true,
              isApproved: true
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              industry: {
                select: {
                  displayNameEs: true
                }
              }
            }
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          [sortBy as string]: sortOrder
        },
        take: parseInt(limit as string)
      });

      // Calculate SOP statistics
      const stats = {
        total: sops.length,
        approved: sops.filter(s => s.isApproved).length,
        pending: sops.filter(s => !s.isApproved && !s.rejectedAt).length,
        rejected: sops.filter(s => s.rejectedAt).length,
        categories: this.groupSOPsByCategory(sops),
        complexityBreakdown: this.groupSOPsByComplexity(sops)
      };

      res.status(200).json({
        success: true,
        data: sops,
        statistics: stats,
        meta: {
          clientId,
          count: sops.length,
          filters: { status, category, approved },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId,
        action: 'get_sops_by_client'
      });
      throw error;
    }
  }

  // GET /api/v1/sops/:id - Get SOP by ID
  async getSOPById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const sop = await prisma.generatedSOP.findUnique({
        where: { id },
        include: {
          process: {
            include: {
              aiJob: {
                select: {
                  id: true,
                  completedAt: true,
                  confidenceScores: true
                }
              }
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              industry: {
                select: {
                  code: true,
                  displayNameEs: true,
                  isRegulated: true
                }
              }
            }
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          rejector: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!sop) {
        throw new NotFoundError('SOP');
      }

      // Add implementation recommendations
      const recommendations = this.generateImplementationRecommendations(sop);

      res.status(200).json({
        success: true,
        data: {
          ...sop,
          recommendations,
          approvalHistory: this.extractApprovalHistory(sop.generationMetadata as any)
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        sopId: id,
        action: 'get_sop_by_id'
      });
      throw error;
    }
  }

  // POST /api/v1/sops/:id/approve - Approve SOP
  async approveSOP(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { comments, modifications } = req.body;

    try {
      const sop = await prisma.generatedSOP.findUnique({
        where: { id },
        include: {
          client: {
            select: { id: true, name: true, currentStatus: true }
          },
          process: {
            select: { id: true, processName: true }
          }
        }
      });

      if (!sop) {
        throw new NotFoundError('SOP');
      }

      if (sop.isApproved) {
        throw new ConflictError('SOP is already approved');
      }

      if (sop.rejectedAt) {
        throw new BusinessRuleError(
          'Cannot approve a rejected SOP. Create a new version instead.',
          'SOP_ALREADY_REJECTED'
        );
      }

      // Update SOP with approval
      const updatedSOP = await prisma.generatedSOP.update({
        where: { id },
        data: {
          isApproved: true,
          approvedAt: new Date(),
          approvedBy: req.user?.id,
          approvalComments: comments,
          generationMetadata: {
            ...sop.generationMetadata as any,
            approvalHistory: [
              ...((sop.generationMetadata as any)?.approvalHistory || []),
              {
                action: 'approved',
                by: req.user?.id,
                at: new Date(),
                comments,
                modifications: modifications || []
              }
            ],
            lastModified: new Date()
          }
        }
      });

      // Check if all SOPs for client are approved to advance workflow
      const clientSOPs = await prisma.generatedSOP.findMany({
        where: { clientId: sop.clientId },
        select: { id: true, isApproved: true }
      });

      const allApproved = clientSOPs.every(s => s.isApproved);
      
      if (allApproved && clientSOPs.length >= 5) {
        // Advance client to proposal_ready status
        await prisma.client.update({
          where: { id: sop.clientId },
          data: { currentStatus: 'proposal_ready' }
        });

        // Create workflow transition
        await prisma.workflowTransition.create({
          data: {
            clientId: sop.clientId,
            fromStatus: 'sops_generated',
            toStatus: 'proposal_ready',
            triggerEvent: 'all_sops_approved',
            triggeredBy: req.user?.id,
            additionalData: {
              approvedSOPCount: clientSOPs.length,
              lastApprovedSOP: id
            }
          }
        });

        // Queue automation analysis job
        await QueueManager.addProposalGenerationJob({
          clientId: sop.clientId,
          sopIds: clientSOPs.map(s => s.id),
          analysisId: `analysis_${Date.now()}`,
          priority: 'normal'
        });

        logger.clientStatusChanged(
          sop.clientId,
          'sops_generated',
          'proposal_ready',
          req.user?.id,
          'all_sops_approved'
        );
      }

      // Log business event
      logger.business({
        event: 'sop_approved',
        clientId: sop.clientId,
        userId: req.user?.id,
        metadata: {
          sopId: id,
          processName: sop.process.processName,
          allSOPsApproved: allApproved,
          comments
        }
      });

      // Invalidate cache
      await cache.del(`sop:${id}`);
      await cache.invalidateClientData(sop.clientId);

      res.status(200).json({
        success: true,
        message: 'SOP approved successfully',
        data: {
          sopId: id,
          approvedAt: updatedSOP.approvedAt,
          allSOPsApproved: allApproved,
          clientStatusAdvanced: allApproved && clientSOPs.length >= 5,
          comments
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        sopId: id,
        action: 'approve_sop'
      });
      throw error;
    }
  }

  // POST /api/v1/sops/:id/reject - Reject SOP
  async rejectSOP(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason, comments, requestNewVersion = false } = req.body;

    try {
      const sop = await prisma.generatedSOP.findUnique({
        where: { id },
        include: {
          client: {
            select: { id: true, name: true }
          },
          process: {
            select: { id: true, processName: true }
          }
        }
      });

      if (!sop) {
        throw new NotFoundError('SOP');
      }

      if (sop.isApproved) {
        throw new ConflictError('Cannot reject an approved SOP');
      }

      if (sop.rejectedAt) {
        throw new ConflictError('SOP is already rejected');
      }

      // Update SOP with rejection
      await prisma.generatedSOP.update({
        where: { id },
        data: {
          rejectedAt: new Date(),
          rejectedBy: req.user?.id,
          rejectionReason: reason,
          rejectionComments: comments,
          generationMetadata: {
            ...sop.generationMetadata as any,
            approvalHistory: [
              ...((sop.generationMetadata as any)?.approvalHistory || []),
              {
                action: 'rejected',
                by: req.user?.id,
                at: new Date(),
                reason,
                comments,
                requestNewVersion
              }
            ]
          }
        }
      });

      // If new version requested, queue regeneration
      if (requestNewVersion) {
        // This would trigger SOP regeneration with feedback
        logger.info('New SOP version requested after rejection', {
          sopId: id,
          processId: sop.processId,
          clientId: sop.clientId,
          reason
        });
      }

      // Log business event
      logger.business({
        event: 'sop_rejected',
        clientId: sop.clientId,
        userId: req.user?.id,
        metadata: {
          sopId: id,
          processName: sop.process.processName,
          reason,
          requestNewVersion,
          comments
        }
      });

      // Invalidate cache
      await cache.del(`sop:${id}`);
      await cache.invalidateClientData(sop.clientId);

      res.status(200).json({
        success: true,
        message: 'SOP rejected successfully',
        data: {
          sopId: id,
          rejectedAt: new Date(),
          reason,
          requestNewVersion,
          comments
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        sopId: id,
        action: 'reject_sop'
      });
      throw error;
    }
  }

  // POST /api/v1/sops/:id/generate-pdf - Generate PDF for SOP
  async generatePDF(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { templateId, includeMetadata = false } = req.body;

    try {
      const sop = await prisma.generatedSOP.findUnique({
        where: { id },
        include: {
          client: {
            select: { id: true, name: true }
          },
          process: {
            select: { processName: true }
          }
        }
      });

      if (!sop) {
        throw new NotFoundError('SOP');
      }

      if (!sop.isApproved) {
        throw new BusinessRuleError(
          'Cannot generate PDF for unapproved SOP',
          'SOP_NOT_APPROVED'
        );
      }

      // Queue PDF generation job
      const job = await QueueManager.addPDFGenerationJob({
        type: 'sop',
        entityId: id,
        clientId: sop.clientId,
        templateId,
        priority: 'normal'
      });

      logger.business({
        event: 'sop_pdf_requested',
        clientId: sop.clientId,
        userId: req.user?.id,
        metadata: {
          sopId: id,
          processName: sop.process.processName,
          templateId,
          jobId: job.id
        }
      });

      res.status(202).json({
        success: true,
        message: 'PDF generation started',
        data: {
          sopId: id,
          jobId: job.id,
          status: 'processing',
          estimatedCompletionTime: 30000 // 30 seconds
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        sopId: id,
        action: 'generate_sop_pdf'
      });
      throw error;
    }
  }

  // PUT /api/v1/sops/:id - Update SOP content
  async updateSOP(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const sop = await prisma.generatedSOP.findUnique({
        where: { id },
        include: {
          client: {
            select: { id: true, name: true }
          }
        }
      });

      if (!sop) {
        throw new NotFoundError('SOP');
      }

      if (sop.isApproved) {
        throw new BusinessRuleError(
          'Cannot modify approved SOP. Create a new version instead.',
          'SOP_ALREADY_APPROVED'
        );
      }

      // Validate which fields can be updated
      const allowedFields = [
        'objective', 'scope', 'responsibilities', 'procedures', 
        'resources', 'kpis', 'risks', 'improvements'
      ];

      const updates: any = {};
      let hasChanges = false;

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
          hasChanges = true;
        }
      }

      if (!hasChanges) {
        throw new ValidationError('No valid fields provided for update');
      }

      // Add modification metadata
      updates.generationMetadata = {
        ...sop.generationMetadata as any,
        lastModified: new Date(),
        modifiedBy: req.user?.id,
        modificationHistory: [
          ...((sop.generationMetadata as any)?.modificationHistory || []),
          {
            modifiedAt: new Date(),
            modifiedBy: req.user?.id,
            fieldsChanged: Object.keys(updates),
            reason: updateData.modificationReason || 'Manual update'
          }
        ]
      };

      // Update SOP
      const updatedSOP = await prisma.generatedSOP.update({
        where: { id },
        data: updates
      });

      // Log business event
      logger.business({
        event: 'sop_updated',
        clientId: sop.clientId,
        userId: req.user?.id,
        metadata: {
          sopId: id,
          fieldsUpdated: Object.keys(updates),
          reason: updateData.modificationReason
        }
      });

      // Invalidate cache
      await cache.del(`sop:${id}`);
      await cache.invalidateClientData(sop.clientId);

      res.status(200).json({
        success: true,
        message: 'SOP updated successfully',
        data: {
          sopId: id,
          updatedFields: Object.keys(updates),
          lastModified: new Date(),
          modifiedBy: req.user?.id
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        sopId: id,
        action: 'update_sop'
      });
      throw error;
    }
  }

  // GET /api/v1/sops/analytics/:clientId - Get SOP analytics for client
  async getSOPAnalytics(req: Request, res: Response): Promise<void> {
    const { clientId } = req.params;

    try {
      // Get all SOPs for client
      const sops = await prisma.generatedSOP.findMany({
        where: { clientId },
        include: {
          process: {
            select: {
              processCategory: true,
              automationFeasibilityScore: true,
              estimatedRoiPercentage: true,
              implementationComplexity: true
            }
          }
        }
      });

      // Calculate analytics
      const analytics = {
        totalSOPs: sops.length,
        approvedSOPs: sops.filter(s => s.isApproved).length,
        pendingSOPs: sops.filter(s => !s.isApproved && !s.rejectedAt).length,
        rejectedSOPs: sops.filter(s => s.rejectedAt).length,
        approvalRate: sops.length > 0 
          ? Math.round((sops.filter(s => s.isApproved).length / sops.length) * 100)
          : 0,
        
        categoryBreakdown: this.groupSOPsByCategory(sops),
        complexityBreakdown: this.groupSOPsByComplexity(sops),
        
        businessImpact: {
          totalEstimatedROI: sops.reduce((sum, s) => 
            sum + (s.process.estimatedRoiPercentage || 0), 0
          ),
          averageROI: sops.length > 0
            ? Math.round(sops.reduce((sum, s) => 
                sum + (s.process.estimatedRoiPercentage || 0), 0
              ) / sops.length)
            : 0,
          highImpactProcesses: sops.filter(s => 
            (s.process.estimatedRoiPercentage || 0) >= 200
          ).length,
          automationReady: sops.filter(s => 
            (s.process.automationFeasibilityScore || 0) >= 0.8
          ).length
        },

        timeline: {
          averageApprovalTime: this.calculateAverageApprovalTime(sops),
          oldestPending: this.findOldestPendingSOP(sops),
          recentActivity: this.getRecentSOPActivity(sops)
        }
      };

      res.status(200).json({
        success: true,
        data: analytics,
        meta: {
          clientId,
          generatedAt: new Date().toISOString(),
          dataPoints: sops.length
        }
      });

    } catch (error) {
      logger.logError(error as Error, {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user?.id,
        clientId,
        action: 'get_sop_analytics'
      });
      throw error;
    }
  }

  // Private helper methods

  private groupSOPsByCategory(sops: any[]): any[] {
    const categories = sops.reduce((acc, sop) => {
      const category = sop.process?.processCategory || 'unknown';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(sop);
      return acc;
    }, {});

    return Object.entries(categories).map(([category, sopList]) => ({
      category,
      count: (sopList as any[]).length,
      approved: (sopList as any[]).filter(s => s.isApproved).length,
      pending: (sopList as any[]).filter(s => !s.isApproved && !s.rejectedAt).length,
      averageROI: (sopList as any[]).length > 0
        ? Math.round((sopList as any[]).reduce((sum, s) => 
            sum + (s.process?.estimatedRoiPercentage || 0), 0
          ) / (sopList as any[]).length)
        : 0
    }));
  }

  private groupSOPsByComplexity(sops: any[]): any[] {
    const complexities = sops.reduce((acc, sop) => {
      const complexity = sop.process?.implementationComplexity || 'unknown';
      if (!acc[complexity]) {
        acc[complexity] = [];
      }
      acc[complexity].push(sop);
      return acc;
    }, {});

    return Object.entries(complexities).map(([complexity, sopList]) => ({
      complexity,
      count: (sopList as any[]).length,
      approved: (sopList as any[]).filter(s => s.isApproved).length
    }));
  }

  private generateImplementationRecommendations(sop: any): any[] {
    const recommendations = [];
    const process = sop.process;

    if (process.automationFeasibilityScore >= 0.8) {
      recommendations.push({
        type: 'automation',
        priority: 'high',
        title: 'High Automation Potential',
        description: `This process has ${Math.round(process.automationFeasibilityScore * 100)}% automation feasibility. Consider implementing automation tools.`,
        estimatedImpact: 'high'
      });
    }

    if (process.estimatedRoiPercentage >= 300) {
      recommendations.push({
        type: 'priority',
        priority: 'high',
        title: 'High ROI Priority',
        description: `Expected ROI of ${process.estimatedRoiPercentage}% makes this a priority for implementation.`,
        estimatedImpact: 'high'
      });
    }

    if (process.implementationComplexity === 'low') {
      recommendations.push({
        type: 'quick_win',
        priority: 'medium',
        title: 'Quick Win Opportunity',
        description: 'Low implementation complexity allows for rapid deployment.',
        estimatedImpact: 'medium'
      });
    }

    return recommendations;
  }

  private extractApprovalHistory(metadata: any): any[] {
    return metadata?.approvalHistory || [];
  }

  private calculateAverageApprovalTime(sops: any[]): number {
    const approvedSOPs = sops.filter(s => s.isApproved && s.approvedAt);
    
    if (approvedSOPs.length === 0) return 0;

    const totalTime = approvedSOPs.reduce((sum, sop) => {
      const created = new Date(sop.createdAt).getTime();
      const approved = new Date(sop.approvedAt).getTime();
      return sum + (approved - created);
    }, 0);

    return Math.round(totalTime / approvedSOPs.length / (1000 * 60 * 60)); // Hours
  }

  private findOldestPendingSOP(sops: any[]): any {
    const pendingSOPs = sops.filter(s => !s.isApproved && !s.rejectedAt);
    
    if (pendingSOPs.length === 0) return null;

    return pendingSOPs.reduce((oldest, current) => 
      new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
    );
  }

  private getRecentSOPActivity(sops: any[]): any[] {
    return sops
      .filter(s => s.approvedAt || s.rejectedAt)
      .sort((a, b) => {
        const aTime = new Date(a.approvedAt || a.rejectedAt).getTime();
        const bTime = new Date(b.approvedAt || b.rejectedAt).getTime();
        return bTime - aTime;
      })
      .slice(0, 5)
      .map(s => ({
        sopId: s.id,
        action: s.approvedAt ? 'approved' : 'rejected',
        timestamp: s.approvedAt || s.rejectedAt,
        processName: s.process?.processName
      }));
  }
}