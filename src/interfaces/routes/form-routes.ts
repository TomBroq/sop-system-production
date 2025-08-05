/**
 * Form Routes
 * Dynamic form generation and management endpoints
 */

import { Router } from 'express';
import { FormController } from '@/interfaces/controllers/form-controller';
import { validate, formSchemas, sanitize } from '@/shared/middleware/validation-middleware';
import { authorize, authorizeResourceOwnership } from '@/shared/middleware/auth-middleware';

const router = Router();
const formController = new FormController();

/**
 * @swagger
 * tags:
 *   name: Forms
 *   description: Dynamic form generation and management
 * 
 * components:
 *   schemas:
 *     GeneratedForm:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         clientId:
 *           type: string
 *           format: uuid
 *         industryCode:
 *           type: string
 *         companySize:
 *           type: string
 *           enum: [micro, small, medium, large]
 *         totalQuestions:
 *           type: integer
 *           minimum: 15
 *           maximum: 40
 *         tallyFormId:
 *           type: string
 *         tallyFormUrl:
 *           type: string
 *           format: uri
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         completionPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         createdAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *         selectedQuestions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               question:
 *                 type: string
 *               type:
 *                 type: string
 *               required:
 *                 type: boolean
 *               category:
 *                 type: string
 */

/**
 * @swagger
 * /api/v1/forms/generate:
 *   post:
 *     summary: Generate adaptive form for client
 *     tags: [Forms]
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
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 description: Client ID to generate form for
 *             example:
 *               clientId: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Form generated successfully
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
 *                     formId:
 *                       type: string
 *                       format: uuid
 *                     tallyFormUrl:
 *                       type: string
 *                       format: uri
 *                     questionCount:
 *                       type: integer
 *                     estimatedCompletionTime:
 *                       type: integer
 *                       description: Estimated completion time in minutes
 *                     formDetails:
 *                       type: object
 *                       properties:
 *                         categories:
 *                           type: object
 *                         adaptiveFeatures:
 *                           type: object
 *       400:
 *         description: Invalid request - client status or business rule violation
 *       404:
 *         description: Client not found
 *       409:
 *         description: Client already has active form
 */
router.post('/generate',
  authorize(['admin', 'senior_consultant', 'consultant']),
  sanitize.trim,
  validate(formSchemas.generate, 'body'),
  formController.generateForm.bind(formController)
);

/**
 * @swagger
 * /api/v1/forms/{id}:
 *   get:
 *     summary: Get form by ID
 *     tags: [Forms]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form retrieved successfully
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
 *                     - $ref: '#/components/schemas/GeneratedForm'
 *                     - type: object
 *                       properties:
 *                         client:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             currentStatus:
 *                               type: string
 *                         completionStats:
 *                           type: object
 *                           properties:
 *                             submittedAt:
 *                               type: string
 *                               format: date-time
 *                             completionTime:
 *                               type: number
 *                             validationScore:
 *                               type: number
 *       404:
 *         description: Form not found
 */
router.get('/:id',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(formSchemas.params, 'params'),
  authorizeResourceOwnership('id'),
  formController.getFormById.bind(formController)
);

/**
 * @swagger
 * /api/v1/forms/client/{clientId}:
 *   get:
 *     summary: Get forms for specific client
 *     tags: [Forms]
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
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filter by form status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of forms to return
 *     responses:
 *       200:
 *         description: Client forms retrieved successfully
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
 *                     $ref: '#/components/schemas/GeneratedForm'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                     clientId:
 *                       type: string
 */
router.get('/client/:clientId',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(formSchemas.clientParams, 'params'),
  validate(formSchemas.clientQuery, 'query'),
  authorizeResourceOwnership('clientId'),
  formController.getFormsByClient.bind(formController)
);

/**
 * @swagger
 * /api/v1/forms/{id}/resend:
 *   post:
 *     summary: Resend form to client
 *     tags: [Forms]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Form ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [email, sms, whatsapp]
 *                 default: email
 *                 description: Notification method
 *     responses:
 *       200:
 *         description: Form resent successfully
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
 *                   example: "Form resent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     formId:
 *                       type: string
 *                       format: uuid
 *                     method:
 *                       type: string
 *                     sentAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Cannot resend completed form
 *       404:
 *         description: Form not found
 */
router.post('/:id/resend',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(formSchemas.params, 'params'),
  validate(formSchemas.resend, 'body'),
  authorizeResourceOwnership('id'),
  formController.resendForm.bind(formController)
);

/**
 * @swagger
 * /api/v1/forms/{id}:
 *   delete:
 *     summary: Cancel form (admin only)
 *     tags: [Forms]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Form ID
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
 *                 description: Reason for cancelling the form
 *             example:
 *               reason: "Client request to restart process with updated information"
 *     responses:
 *       200:
 *         description: Form cancelled successfully
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
 *                   example: "Form cancelled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     formId:
 *                       type: string
 *                       format: uuid
 *                     cancelledAt:
 *                       type: string
 *                       format: date-time
 *                     reason:
 *                       type: string
 *       400:
 *         description: Cannot cancel completed form
 *       404:
 *         description: Form not found
 */
router.delete('/:id',
  authorize(['admin', 'senior_consultant']), // Restricted operation
  validate(formSchemas.params, 'params'),
  validate(formSchemas.cancel, 'body'),
  formController.cancelForm.bind(formController)
);

export { router as formRoutes };