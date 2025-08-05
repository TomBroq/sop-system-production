/**
 * Health Check Routes
 * System health monitoring endpoints for infrastructure monitoring
 */

import { Router } from 'express';
import { HealthController } from '@/interfaces/controllers/health-controller';

const router = Router();
const healthController = new HealthController();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: System health monitoring endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 */
router.get('/', healthController.basicHealth.bind(healthController));

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed system health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed system health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *                     externalAPIs:
 *                       type: object
 */
router.get('/detailed', healthController.detailedHealth.bind(healthController));

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     tags: [Health]
 *     description: Kubernetes readiness probe endpoint
 *     responses:
 *       200:
 *         description: Service is ready to accept traffic
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', healthController.readinessProbe.bind(healthController));

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     tags: [Health]
 *     description: Kubernetes liveness probe endpoint
 *     responses:
 *       200:
 *         description: Service is alive
 *       503:
 *         description: Service should be restarted
 */
router.get('/live', healthController.livenessProbe.bind(healthController));

/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: Performance metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System performance metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 performance:
 *                   type: object
 *                 businessKPIs:
 *                   type: object
 *                 systemHealth:
 *                   type: object
 */
router.get('/metrics', healthController.getMetrics.bind(healthController));

export { router as healthRoutes };