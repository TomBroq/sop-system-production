/**
 * AI Processing Routes
 * AI processing jobs, SOP generation, and analysis endpoints
 */

import { Router } from 'express';
import { AIController } from '@/interfaces/controllers/ai-controller';
import { validate, aiSchemas, sanitize } from '@/shared/middleware/validation-middleware';
import { authorize, authorizeResourceOwnership } from '@/shared/middleware/auth-middleware';

const router = Router();
const aiController = new AIController();

/**
 * @swagger
 * tags:
 *   name: AI Processing
 *   description: AI processing jobs and analysis management
 * 
 * components:
 *   schemas:
 *     AIProcessingJob:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         clientId:
 *           type: string
 *           format: uuid
 *         formResponseId:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [pending, running, completed, failed]
 *         startedAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *         processingTimeSeconds:
 *           type: integer
 *         processCount:
 *           type: integer
 *         retryCount:
 *           type: integer
 *         maxRetries:
 *           type: integer
 *         errorMessage:
 *           type: string
 *         confidenceScores:
 *           type: object
 *         identifiedProcesses:
 *           type: array
 *           items:
 *             type: object
 *     
 *     IdentifiedProcess:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         clientId:
 *           type: string
 *           format: uuid
 *         aiJobId:
 *           type: string
 *           format: uuid
 *         processName:
 *           type: string
 *         processCategory:
 *           type: string
 *           enum: [primary, support, management]
 *         processDescription:
 *           type: string
 *         isExplicit:
 *           type: boolean
 *         isApproved:
 *           type: boolean
 *         frequencyPerMonth:
 *           type: integer
 *         manualStepsCount:
 *           type: integer
 *         errorRatePercentage:
 *           type: number
 *         automationFeasibilityScore:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *         estimatedRoiPercentage:
 *           type: number
 *         implementationComplexity:
 *           type: string
 *           enum: [low, medium, high]
 *         systemsInvolved:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/v1/ai/start-processing:
 *   post:
 *     summary: Start AI processing for form response
 *     tags: [AI Processing]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - formResponseId
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 description: Client ID
 *               formResponseId:
 *                 type: string
 *                 format: uuid
 *                 description: Form response ID to process
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high]
 *                 default: normal
 *                 description: Processing priority
 *             example:
 *               clientId: "123e4567-e89b-12d3-a456-426614174000"
 *               formResponseId: "456e7890-e89b-12d3-a456-426614174001"
 *               priority: "normal"
 *     responses:
 *       201:
 *         description: AI processing started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "AI processing started successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobId:
 *                       type: string
 *                       format: uuid
 *                     clientId:
 *                       type: string
 *                       format: uuid
 *                     formResponseId:
 *                       type: string
 *                       format: uuid
 *                     priority:
 *                       type: string
 *                     estimatedCompletionTime:
 *                       type: integer
 *                       description: Estimated completion time in milliseconds
 *                     status:
 *                       type: string
 *                       example: "queued"
 *       400:
 *         description: Invalid request - client status or business rule violation
 *       404:
 *         description: Client or form response not found
 *       409:
 *         description: AI processing already in progress
 */
router.post('/start-processing',
  authorize(['admin', 'senior_consultant', 'consultant']),
  sanitize.trim,
  validate(aiSchemas.startProcessing, 'body'),
  aiController.startProcessing.bind(aiController)
);

/**
 * @swagger
 * /api/v1/ai/jobs/{jobId}:
 *   get:
 *     summary: Get AI processing job status
 *     tags: [AI Processing]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: AI processing job ID
 *     responses:
 *       200:
 *         description: Job status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/AIProcessingJob'
 *                     - type: object
 *                       properties:
 *                         progress:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 100
 *                           description: Processing progress percentage
 *                         estimatedTimeRemaining:
 *                           type: integer
 *                           description: Estimated time remaining in seconds
 *                         client:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             currentStatus:
 *                               type: string
 *       404:
 *         description: AI processing job not found
 */
router.get('/jobs/:jobId',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(aiSchemas.jobParams, 'params'),
  authorizeResourceOwnership('jobId'),
  aiController.getJobStatus.bind(aiController)
);

/**
 * @swagger
 * /api/v1/ai/jobs/client/{clientId}:
 *   get:
 *     summary: Get AI processing jobs for client
 *     tags: [AI Processing]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, running, completed, failed]
 *         description: Filter by job status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of jobs to return
 *     responses:
 *       200:
 *         description: Client AI jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/AIProcessingJob'
 *                       - type: object
 *                         properties:
 *                           progress:
 *                             type: number
 *                           estimatedTimeRemaining:
 *                             type: integer
 */
router.get('/jobs/client/:clientId',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(aiSchemas.clientParams, 'params'),
  validate(aiSchemas.jobsQuery, 'query'),
  authorizeResourceOwnership('clientId'),
  aiController.getJobsByClient.bind(aiController)
);

/**
 * @swagger
 * /api/v1/ai/processes/{clientId}:
 *   get:
 *     summary: Get identified processes for client
 *     tags: [AI Processing]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [primary, support, management]
 *         description: Filter by process category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: automationFeasibilityScore
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Identified processes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IdentifiedProcess'
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     totalProcesses:
 *                       type: integer
 *                     prioritizationMatrix:
 *                       type: object
 *                       properties:
 *                         highImpactHighFeasibility:
 *                           type: integer
 *                         highImpactLowFeasibility:
 *                           type: integer
 *                         lowImpactHighFeasibility:
 *                           type: integer
 *                         lowImpactLowFeasibility:
 *                           type: integer
 *                     categoryBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           averageROI:
 *                             type: number
 *                           averageFeasibility:
 *                             type: number
 *                     recommendedForAutomation:
 *                       type: integer
 *                     averageROI:
 *                       type: number
 */
router.get('/processes/:clientId',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(aiSchemas.clientParams, 'params'),
  validate(aiSchemas.processesQuery, 'query'),
  authorizeResourceOwnership('clientId'),
  aiController.getIdentifiedProcesses.bind(aiController)
);

/**
 * @swagger
 * /api/v1/ai/processes/{processId}/approve:
 *   post:
 *     summary: Approve or reject identified process
 *     tags: [AI Processing]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: processId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Process ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 description: Whether to approve or reject the process
 *               comments:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional comments about the approval decision
 *             example:
 *               approved: true
 *               comments: "Process approved for automation - high ROI potential"
 *     responses:
 *       200:
 *         description: Process approval status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Process approved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processId:
 *                       type: string
 *                       format: uuid
 *                     approved:
 *                       type: boolean
 *                     approvedAt:
 *                       type: string
 *                       format: date-time
 *                     comments:
 *                       type: string
 *       404:
 *         description: Process not found
 */
router.post('/processes/:processId/approve',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(aiSchemas.processParams, 'params'),
  validate(aiSchemas.approveProcess, 'body'),
  authorizeResourceOwnership('processId'),
  aiController.approveProcess.bind(aiController)
);

/**
 * @swagger
 * /api/v1/ai/retry/{jobId}:
 *   post:
 *     summary: Retry failed AI processing job
 *     tags: [AI Processing]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Failed AI processing job ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high]
 *                 default: high
 *                 description: Priority for retry attempt
 *     responses:
 *       201:
 *         description: AI processing job retried successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "AI processing job retried successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     originalJobId:
 *                       type: string
 *                       format: uuid
 *                     newJobId:
 *                       type: string
 *                       format: uuid
 *                     retryCount:
 *                       type: integer
 *                     priority:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "retried"
 *       400:
 *         description: Cannot retry job (not failed or max retries exceeded)
 *       404:
 *         description: AI processing job not found
 */
router.post('/retry/:jobId',
  authorize(['admin', 'senior_consultant']), // Restricted to senior roles
  validate(aiSchemas.jobParams, 'params'),
  validate(aiSchemas.retryJob, 'body'),
  aiController.retryJob.bind(aiController)
);

/**
 * @swagger
 * /api/v1/ai/analytics/{clientId}:
 *   get:
 *     summary: Get AI processing analytics for client
 *     tags: [AI Processing]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics period (defaults to 30 days ago)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics period (defaults to today)
 *     responses:
 *       200:
 *         description: AI processing analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     analytics:
 *                       type: object
 *                       properties:
 *                         totalJobs:
 *                           type: integer
 *                         successRate:
 *                           type: number
 *                           description: Success rate percentage
 *                         averageProcessingTime:
 *                           type: integer
 *                           description: Average processing time in seconds
 *                         totalProcessesIdentified:
 *                           type: integer
 *                         averageProcessesPerJob:
 *                           type: integer
 *                         statusBreakdown:
 *                           type: object
 *                           properties:
 *                             completed:
 *                               type: integer
 *                             running:
 *                               type: integer
 *                             failed:
 *                               type: integer
 *                             pending:
 *                               type: integer
 *                         performanceMetrics:
 *                           type: object
 *                           properties:
 *                             fastestProcessing:
 *                               type: integer
 *                             slowestProcessing:
 *                               type: integer
 *                             averageConfidence:
 *                               type: number
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                         endDate:
 *                           type: string
 *                     jobs:
 *                       type: array
 *                       description: Latest 10 jobs for details
 *                       items:
 *                         $ref: '#/components/schemas/AIProcessingJob'
 */
router.get('/analytics/:clientId',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(aiSchemas.clientParams, 'params'),
  validate(aiSchemas.analyticsQuery, 'query'),
  authorizeResourceOwnership('clientId'),
  aiController.getProcessingAnalytics.bind(aiController)
);

export { router as aiRoutes };