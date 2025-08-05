/**
 * SOP Routes
 * Standard Operating Procedures management endpoints
 */

import { Router } from 'express';
import { SOPController } from '@/interfaces/controllers/sop-controller';
import { validate, sopSchemas, sanitize } from '@/shared/middleware/validation-middleware';
import { authorize, authorizeResourceOwnership } from '@/shared/middleware/auth-middleware';

const router = Router();
const sopController = new SOPController();

/**
 * @swagger
 * tags:
 *   name: SOPs
 *   description: Standard Operating Procedures management
 * 
 * components:
 *   schemas:
 *     GeneratedSOP:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         clientId:
 *           type: string
 *           format: uuid
 *         processId:
 *           type: string
 *           format: uuid
 *         objective:
 *           type: string
 *           description: SOP objective and purpose
 *         scope:
 *           type: string
 *           description: Scope of the SOP
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *           description: List of responsibilities
 *         procedures:
 *           type: array
 *           items:
 *             type: string
 *           description: Step-by-step procedures
 *         resources:
 *           type: array
 *           items:
 *             type: string
 *           description: Required resources
 *         kpis:
 *           type: array
 *           items:
 *             type: string
 *           description: Key Performance Indicators
 *         risks:
 *           type: array
 *           items:
 *             type: string
 *           description: Identified risks
 *         improvements:
 *           type: array
 *           items:
 *             type: string
 *           description: Suggested improvements
 *         isApproved:
 *           type: boolean
 *         approvedAt:
 *           type: string
 *           format: date-time
 *         approvedBy:
 *           type: string
 *           format: uuid
 *         rejectedAt:
 *           type: string
 *           format: date-time
 *         rejectedBy:
 *           type: string
 *           format: uuid
 *         rejectionReason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/sops/client/{clientId}:
 *   get:
 *     summary: Get SOPs for specific client
 *     tags: [SOPs]
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
 *           enum: [draft, approved, rejected]
 *         description: Filter by SOP status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [primary, support, management]
 *         description: Filter by process category
 *       - in: query
 *         name: approved
 *         schema:
 *           type: boolean
 *         description: Filter by approval status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of SOPs to return
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
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
 *         description: Client SOPs retrieved successfully
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
 *                       - $ref: '#/components/schemas/GeneratedSOP'
 *                       - type: object
 *                         properties:
 *                           process:
 *                             type: object
 *                             properties:
 *                               processName:
 *                                 type: string
 *                               processCategory:
 *                                 type: string
 *                               automationFeasibilityScore:
 *                                 type: number
 *                               estimatedRoiPercentage:
 *                                 type: number
 *                           client:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     approved:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     rejected:
 *                       type: integer
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           approved:
 *                             type: integer
 *                           averageROI:
 *                             type: number
 */
router.get('/client/:clientId',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(sopSchemas.clientParams, 'params'),
  validate(sopSchemas.listQuery, 'query'),
  authorizeResourceOwnership('clientId'),
  sopController.getSOPsByClient.bind(sopController)
);

/**
 * @swagger
 * /api/v1/sops/{id}:
 *   get:
 *     summary: Get SOP by ID
 *     tags: [SOPs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SOP ID
 *     responses:
 *       200:
 *         description: SOP retrieved successfully
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
 *                     - $ref: '#/components/schemas/GeneratedSOP'
 *                     - type: object
 *                       properties:
 *                         process:
 *                           type: object
 *                           properties:
 *                             processName:
 *                               type: string
 *                             processCategory:
 *                               type: string
 *                             aiJob:
 *                               type: object
 *                               properties:
 *                                 completedAt:
 *                                   type: string
 *                                   format: date-time
 *                                 confidenceScores:
 *                                   type: object
 *                         client:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             industry:
 *                               type: object
 *                               properties:
 *                                 displayNameEs:
 *                                   type: string
 *                         recommendations:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                               priority:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                               estimatedImpact:
 *                                 type: string
 *       404:
 *         description: SOP not found
 */
router.get('/:id',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(sopSchemas.params, 'params'),
  authorizeResourceOwnership('id'),
  sopController.getSOPById.bind(sopController)
);

/**
 * @swagger
 * /api/v1/sops/{id}/approve:
 *   post:
 *     summary: Approve SOP
 *     tags: [SOPs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SOP ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Optional approval comments
 *               modifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of modifications made during approval
 *             example:
 *               comments: "SOP approved with minor modifications to step 3"
 *               modifications: ["Updated timeline in step 3", "Added safety note"]
 *     responses:
 *       200:
 *         description: SOP approved successfully
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
 *                   example: "SOP approved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sopId:
 *                       type: string
 *                       format: uuid
 *                     approvedAt:
 *                       type: string
 *                       format: date-time
 *                     allSOPsApproved:
 *                       type: boolean
 *                       description: Whether all client SOPs are now approved
 *                     clientStatusAdvanced:
 *                       type: boolean
 *                       description: Whether client status was advanced to proposal_ready
 *                     comments:
 *                       type: string
 *       400:
 *         description: SOP already approved or rejected
 *       404:
 *         description: SOP not found
 */
router.post('/:id/approve',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(sopSchemas.params, 'params'),
  validate(sopSchemas.approve, 'body'),
  authorizeResourceOwnership('id'),
  sopController.approveSOP.bind(sopController)
);

/**
 * @swagger
 * /api/v1/sops/{id}/reject:
 *   post:
 *     summary: Reject SOP
 *     tags: [SOPs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SOP ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: Reason for rejection
 *               comments:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Additional comments
 *               requestNewVersion:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to request a new version
 *             example:
 *               reason: "Process steps are not detailed enough"
 *               comments: "Please add more specific instructions for each step"
 *               requestNewVersion: true
 *     responses:
 *       200:
 *         description: SOP rejected successfully
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
 *                   example: "SOP rejected successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sopId:
 *                       type: string
 *                       format: uuid
 *                     rejectedAt:
 *                       type: string
 *                       format: date-time
 *                     reason:
 *                       type: string
 *                     requestNewVersion:
 *                       type: boolean
 *                     comments:
 *                       type: string
 *       400:
 *         description: SOP already approved or rejected
 *       404:
 *         description: SOP not found
 */
router.post('/:id/reject',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(sopSchemas.params, 'params'),
  validate(sopSchemas.reject, 'body'),
  authorizeResourceOwnership('id'),
  sopController.rejectSOP.bind(sopController)
);

/**
 * @swagger
 * /api/v1/sops/{id}/generate-pdf:
 *   post:
 *     summary: Generate PDF for approved SOP
 *     tags: [SOPs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SOP ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: PDF template ID to use
 *               includeMetadata:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to include generation metadata
 *     responses:
 *       202:
 *         description: PDF generation started
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
 *                   example: "PDF generation started"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sopId:
 *                       type: string
 *                       format: uuid
 *                     jobId:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: "processing"
 *                     estimatedCompletionTime:
 *                       type: integer
 *                       example: 30000
 *       400:
 *         description: SOP not approved
 *       404:
 *         description: SOP not found
 */
router.post('/:id/generate-pdf',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(sopSchemas.params, 'params'),
  validate(sopSchemas.generatePDF, 'body'),
  authorizeResourceOwnership('id'),
  sopController.generatePDF.bind(sopController)
);

/**
 * @swagger
 * /api/v1/sops/{id}:
 *   put:
 *     summary: Update SOP content
 *     tags: [SOPs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SOP ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               objective:
 *                 type: string
 *                 maxLength: 1000
 *               scope:
 *                 type: string
 *                 maxLength: 1000
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 200
 *               procedures:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 500
 *               resources:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 200
 *               kpis:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 200
 *               risks:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 300
 *               improvements:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 300
 *               modificationReason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Reason for modification
 *             example:
 *               objective: "Updated objective with clearer goals"
 *               procedures: ["Step 1: Updated instruction", "Step 2: New step added"]
 *               modificationReason: "Client requested more detailed procedures"
 *     responses:
 *       200:
 *         description: SOP updated successfully
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
 *                   example: "SOP updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sopId:
 *                       type: string
 *                       format: uuid
 *                     updatedFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                     lastModified:
 *                       type: string
 *                       format: date-time
 *                     modifiedBy:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: SOP already approved or invalid fields
 *       404:
 *         description: SOP not found
 */
router.put('/:id',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(sopSchemas.params, 'params'),
  sanitize.trim,
  sanitize.html,
  validate(sopSchemas.update, 'body'),
  authorizeResourceOwnership('id'),
  sopController.updateSOP.bind(sopController)
);

/**
 * @swagger
 * /api/v1/sops/analytics/{clientId}:
 *   get:
 *     summary: Get SOP analytics for client
 *     tags: [SOPs]
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
 *     responses:
 *       200:
 *         description: SOP analytics retrieved successfully
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
 *                     totalSOPs:
 *                       type: integer
 *                     approvedSOPs:
 *                       type: integer
 *                     pendingSOPs:
 *                       type: integer
 *                     rejectedSOPs:
 *                       type: integer
 *                     approvalRate:
 *                       type: number
 *                       description: Approval rate percentage
 *                     categoryBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           approved:
 *                             type: integer
 *                           averageROI:
 *                             type: number
 *                     businessImpact:
 *                       type: object
 *                       properties:
 *                         totalEstimatedROI:
 *                           type: number
 *                         averageROI:
 *                           type: number
 *                         highImpactProcesses:
 *                           type: integer
 *                         automationReady:
 *                           type: integer
 *                     timeline:
 *                       type: object
 *                       properties:
 *                         averageApprovalTime:
 *                           type: number
 *                           description: Average approval time in hours
 *                         oldestPending:
 *                           type: object
 *                           description: Oldest pending SOP details
 *                         recentActivity:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               sopId:
 *                                 type: string
 *                               action:
 *                                 type: string
 *                               timestamp:
 *                                 type: string
 *                               processName:
 *                                 type: string
 */
router.get('/analytics/:clientId',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(sopSchemas.clientParams, 'params'),
  authorizeResourceOwnership('clientId'),
  sopController.getSOPAnalytics.bind(sopController)
);

export { router as sopRoutes };