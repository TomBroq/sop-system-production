/**
 * Webhook Routes
 * External webhook handlers for form completion and other integrations
 */

import { Router } from 'express';
import { WebhookController } from '@/interfaces/controllers/webhook-controller';
import { webhookAuth } from '@/shared/middleware/auth-middleware';
import { validate, formSchemas } from '@/shared/middleware/validation-middleware';

const router = Router();
const webhookController = new WebhookController();

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: External webhook endpoints
 */

/**
 * @swagger
 * /api/webhooks/tally:
 *   post:
 *     summary: Tally Forms webhook handler
 *     tags: [Webhooks]
 *     description: Handles form completion notifications from Tally Forms
 *     security:
 *       - WebhookSignature: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - eventType
 *               - formId
 *               - submissionId
 *               - data
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: Unique event identifier
 *               eventType:
 *                 type: string
 *                 enum: [form.completed, form.started, form.updated]
 *                 description: Type of event
 *               formId:
 *                 type: string
 *                 description: Tally form ID
 *               submissionId:
 *                 type: string
 *                 description: Unique submission identifier
 *               data:
 *                 type: object
 *                 properties:
 *                   responses:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         questionId:
 *                           type: string
 *                         question:
 *                           type: string
 *                         answer:
 *                           type: string
 *                   metadata:
 *                     type: object
 *                     properties:
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *                       completionTime:
 *                         type: number
 *                         description: Time taken to complete in minutes
 *                       ipAddress:
 *                         type: string
 *                       userAgent:
 *                         type: string
 *     responses:
 *       200:
 *         description: Webhook processed successfully
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
 *                   example: "Webhook processed successfully"
 *                 processedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid webhook payload
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         description: Webhook processing failed
 */
router.post('/tally',
  webhookAuth('x-tally-signature'),
  validate(formSchemas.webhook, 'body'),
  webhookController.handleTallyWebhook.bind(webhookController)
);

/**
 * @swagger
 * /api/webhooks/multiagent:
 *   post:
 *     summary: Multi-agent system webhook handler
 *     tags: [Webhooks]
 *     description: Handles AI processing completion notifications
 *     security:
 *       - WebhookSignature: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - status
 *               - results
 *             properties:
 *               jobId:
 *                 type: string
 *                 format: uuid
 *                 description: AI processing job ID
 *               status:
 *                 type: string
 *                 enum: [completed, failed]
 *                 description: Processing status
 *               results:
 *                 type: object
 *                 description: Processing results (if completed)
 *               error:
 *                 type: object
 *                 description: Error details (if failed)
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook payload
 *       401:
 *         description: Invalid webhook signature
 */
router.post('/multiagent',
  webhookAuth('x-multiagent-signature'),
  webhookController.handleMultiAgentWebhook.bind(webhookController)
);

/**
 * @swagger
 * /api/webhooks/email:
 *   post:
 *     summary: Email service webhook handler
 *     tags: [Webhooks]
 *     description: Handles email delivery status notifications
 *     security:
 *       - WebhookSignature: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *               event:
 *                 type: string
 *                 enum: [delivered, bounced, opened, clicked]
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               recipient:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/email',
  webhookAuth('x-email-signature'),
  webhookController.handleEmailWebhook.bind(webhookController)
);

export { router as webhookRoutes };