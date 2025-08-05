/**
 * Client Routes
 * CRUD operations for client management with business rule enforcement
 */

import { Router } from 'express';
import { ClientController } from '@/interfaces/controllers/client-controller';
import { validate, clientSchemas, sanitize, validateBusinessRules } from '@/shared/middleware/validation-middleware';
import { authorize, authorizeResourceOwnership } from '@/shared/middleware/auth-middleware';

const router = Router();
const clientController = new ClientController();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client management operations
 * 
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required:
 *         - name
 *         - industry
 *         - companySize
 *         - contactEmail
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique client identifier
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           description: Client company name
 *         industry:
 *           type: string
 *           description: Industry code from supported industries
 *         companySize:
 *           type: string
 *           enum: [micro, small, medium, large]
 *           description: Company size classification
 *         subindustry:
 *           type: string
 *           maxLength: 100
 *           description: Optional subindustry specification
 *         yearsOperation:
 *           type: integer
 *           minimum: 0
 *           maximum: 200
 *           description: Years the company has been operating
 *         employeeCount:
 *           type: integer
 *           minimum: 1
 *           description: Number of employees
 *         annualRevenue:
 *           type: number
 *           minimum: 0
 *           description: Annual revenue in USD
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Primary contact email
 *         currentStatus:
 *           type: string
 *           enum: [created, form_sent, responses_received, processing_ai, sops_generated, proposal_ready, proposal_sent, closed]
 *           description: Current workflow status
 *         classificationConfidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: AI classification confidence score
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         name: "Empresa Ejemplo S.A."
 *         industry: "accounting"
 *         companySize: "small"
 *         subindustry: "tax_consulting"
 *         yearsOperation: 5
 *         employeeCount: 25
 *         annualRevenue: 500000
 *         contactEmail: "contacto@empresa-ejemplo.com"
 * 
 *     ClientCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - industry
 *         - companySize
 *         - contactEmail
 *       properties:
 *         name:
 *           type: string
 *           example: "Empresa Ejemplo S.A."
 *         industry:
 *           type: string
 *           example: "accounting"
 *         companySize:
 *           type: string
 *           enum: [micro, small, medium, large]
 *           example: "small"
 *         subindustry:
 *           type: string
 *           example: "tax_consulting"
 *         yearsOperation:
 *           type: integer
 *           example: 5
 *         employeeCount:
 *           type: integer
 *           example: 25
 *         annualRevenue:
 *           type: number
 *           example: 500000
 *         contactEmail:
 *           type: string
 *           format: email
 *           example: "contacto@empresa-ejemplo.com"
 * 
 *     ClientResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Client'
 *         - type: object
 *           properties:
 *             industry:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 name:
 *                   type: string
 *                 displayNameEs:
 *                   type: string
 *                 isRegulated:
 *                   type: boolean
 *             classification:
 *               type: object
 *               properties:
 *                 confidence:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 predefinedAnalysis:
 *                   type: array
 *                   items:
 *                     type: object
 */

/**
 * @swagger
 * /api/v1/clients:
 *   get:
 *     summary: List all clients
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry code
 *       - in: query
 *         name: companySize
 *         schema:
 *           type: string
 *           enum: [micro, small, medium, large]
 *         description: Filter by company size
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [created, form_sent, responses_received, processing_ai, sops_generated, proposal_ready, proposal_sent, closed]
 *         description: Filter by current status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search in client names
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
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
 *         description: List of clients retrieved successfully
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
 *                     $ref: '#/components/schemas/ClientResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/',
  authorize(['admin', 'senior_consultant', 'consultant']),
  sanitize.trim,
  validate(clientSchemas.query, 'query'),
  clientController.getClients.bind(clientController)
);

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ClientResponse'
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/:id',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(clientSchemas.params, 'params'),
  authorizeResourceOwnership('id'),
  clientController.getClientById.bind(clientController)
);

/**
 * @swagger
 * /api/v1/clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientCreateRequest'
 *     responses:
 *       201:
 *         description: Client created successfully
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
 *                     clientId:
 *                       type: string
 *                       format: uuid
 *                     classification:
 *                       type: object
 *                       properties:
 *                         industry:
 *                           type: object
 *                         confidence:
 *                           type: number
 *                         predefinedAnalysis:
 *                           type: array
 *                     nextSteps:
 *                       type: object
 *                       properties:
 *                         formGeneration:
 *                           type: boolean
 *                         estimatedQuestions:
 *                           type: integer
 *                         completionTime:
 *                           type: integer
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Client already exists
 */
router.post('/',
  authorize(['admin', 'senior_consultant', 'consultant']),
  sanitize.trim,
  sanitize.html,
  validate(clientSchemas.create, 'body'),
  clientController.createClient.bind(clientController)
);

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   put:
 *     summary: Update client information
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *               industry:
 *                 type: string
 *               companySize:
 *                 type: string
 *                 enum: [micro, small, medium, large]
 *               subindustry:
 *                 type: string
 *                 maxLength: 100
 *               yearsOperation:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 200
 *               employeeCount:
 *                 type: integer
 *                 minimum: 1
 *               annualRevenue:
 *                 type: number
 *                 minimum: 0
 *               contactEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ClientResponse'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(clientSchemas.params, 'params'),
  authorizeResourceOwnership('id'),
  sanitize.trim,
  sanitize.html,
  validate(clientSchemas.update, 'body'),
  clientController.updateClient.bind(clientController)
);

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   delete:
 *     summary: Delete client
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
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
 *                   example: "Client deleted successfully"
 *       404:
 *         description: Client not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only admins can delete clients
 */
router.delete('/:id',
  authorize(['admin']), // Only admins can delete clients
  validate(clientSchemas.params, 'params'),
  clientController.deleteClient.bind(clientController)
);

/**
 * @swagger
 * /api/v1/clients/{id}/dashboard:
 *   get:
 *     summary: Get client dashboard data
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client dashboard data retrieved successfully
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
 *                     client:
 *                       $ref: '#/components/schemas/ClientResponse'
 *                     currentStatus:
 *                       type: object
 *                     form:
 *                       type: object
 *                     processes:
 *                       type: array
 *                     sops:
 *                       type: array
 *                     proposal:
 *                       type: object
 *                     timeline:
 *                       type: array
 */
router.get('/:id/dashboard',
  authorize(['admin', 'senior_consultant', 'consultant']),
  validate(clientSchemas.params, 'params'),
  authorizeResourceOwnership('id'),
  clientController.getClientDashboard.bind(clientController)
);

/**
 * @swagger
 * /api/v1/clients/{id}/export:
 *   post:
 *     summary: Export client data (LGPD compliance)
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [json, csv]
 *                 default: json
 *               includeAuditLogs:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Client data exported successfully
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
 *                 exportDate:
 *                   type: string
 *                   format: date-time
 */
router.post('/:id/export',
  authorize(['admin', 'senior_consultant']), // Restricted operation
  validate(clientSchemas.params, 'params'),
  clientController.exportClientData.bind(clientController)
);

/**
 * @swagger
 * /api/v1/clients/{id}/data:
 *   delete:
 *     summary: Delete all client data (LGPD right to be forgotten)
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirmation
 *               - reason
 *             properties:
 *               confirmation:
 *                 type: string
 *                 enum: ["DELETE_ALL_DATA"]
 *                 description: Confirmation string to prevent accidental deletion
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 description: Reason for data deletion (LGPD compliance)
 *     responses:
 *       200:
 *         description: Client data deleted successfully
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
 *                 deletionSummary:
 *                   type: object
 */
router.delete('/:id/data',
  authorize(['admin']), // Only admins can perform data deletion
  validate(clientSchemas.params, 'params'),
  clientController.deleteClientData.bind(clientController)
);

export { router as clientRoutes };