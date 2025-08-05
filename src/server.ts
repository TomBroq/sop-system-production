/**
 * Sistema de Levantamiento Automatizado de Procesos - Server Entry Point
 * Main server configuration and startup
 */

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Internal imports
import { config } from '@/config/environment';
import { logger } from '@/shared/logger';
import { errorHandler } from '@/shared/middleware/error-handler';
import { auditMiddleware } from '@/shared/middleware/audit-middleware';
import { authMiddleware } from '@/shared/middleware/auth-middleware';
import { validateMiddleware } from '@/shared/middleware/validation-middleware';
import { metricsMiddleware } from '@/shared/middleware/metrics-middleware';

// Route imports
import { clientRoutes } from '@/interfaces/routes/client-routes';
import { formRoutes } from '@/interfaces/routes/form-routes';
import { aiRoutes } from '@/interfaces/routes/ai-routes';
import { sopRoutes } from '@/interfaces/routes/sop-routes';
import { webhookRoutes } from '@/interfaces/routes/webhook-routes';
import { healthRoutes } from '@/interfaces/routes/health-routes';

// Database and infrastructure
import { DatabaseConnection } from '@/infrastructure/database/connection';
import { RedisConnection } from '@/infrastructure/cache/redis-connection';
import { QueueManager } from '@/infrastructure/queue/queue-manager';

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.PORT;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSwagger();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.CORS_ORIGIN.split(','),
      credentials: config.CORS_CREDENTIALS,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
    }));

    // Rate limiting - diferentes límites por tipo de usuario
    const limiter = rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: (req) => {
        // @ts-ignore - req.user se añade por authMiddleware
        const userRole = req.user?.role;
        switch (userRole) {
          case 'admin': return config.RATE_LIMIT_ADMIN_MAX;
          case 'senior_consultant': return 500;
          case 'consultant': return 200;
          default: return config.RATE_LIMIT_MAX_REQUESTS;
        }
      },
      message: {
        error: 'Too many requests from this IP',
        retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path.startsWith('/health');
      }
    });

    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        // Store raw body for webhook signature verification
        if (req.path.startsWith('/api/webhooks')) {
          (req as any).rawBody = buf;
        }
      }
    }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      threshold: 1024
    }));

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        }
      },
      skip: (req) => {
        // Skip logging for health checks in production
        return config.NODE_ENV === 'production' && req.path.startsWith('/health');
      }
    }));

    // Custom middleware
    this.app.use(metricsMiddleware);
    this.app.use(auditMiddleware);

    // Request ID for tracing
    this.app.use((req, res, next) => {
      req.headers['x-request-id'] = req.headers['x-request-id'] || 
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      res.setHeader('X-Request-ID', req.headers['x-request-id']);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check (no auth required)
    this.app.use('/health', healthRoutes);

    // Webhooks (no auth required, but signature verification)
    this.app.use('/api/webhooks', webhookRoutes);

    // API routes with authentication
    const apiRouter = express.Router();
    
    // Apply authentication to all API routes except webhooks
    apiRouter.use(authMiddleware);

    // Business routes
    apiRouter.use('/clients', clientRoutes);
    apiRouter.use('/forms', formRoutes);
    apiRouter.use('/ai', aiRoutes);
    apiRouter.use('/sops', sopRoutes);

    this.app.use(`/api/${config.API_VERSION}`, apiRouter);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: config.APP_NAME,
        version: config.APP_VERSION,
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          api: `/api/${config.API_VERSION}`,
          docs: '/api-docs'
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupSwagger(): void {
    if (!config.ENABLE_SWAGGER_DOCS) return;

    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: config.SWAGGER_TITLE,
          version: config.SWAGGER_VERSION,
          description: config.SWAGGER_DESCRIPTION,
          contact: {
            email: config.SWAGGER_CONTACT_EMAIL
          }
        },
        servers: [
          {
            url: `http://localhost:${this.port}/api/${config.API_VERSION}`,
            description: 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
        security: [
          {
            BearerAuth: []
          }
        ]
      },
      apis: [
        './src/interfaces/routes/*.ts',
        './src/interfaces/controllers/*.ts'
      ]
    };

    const specs = swaggerJsdoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Sistema SOP API Documentation'
    }));

    logger.info(`Swagger documentation available at http://localhost:${this.port}/api-docs`);
  }

  private setupErrorHandling(): void {
    // Global error handler (must be last)
    this.app.use(errorHandler);

    // Graceful shutdown handlers
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));

    // Unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.gracefulShutdown();
    });

    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown();
    });
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Starting graceful shutdown...');

    try {
      // Close server
      await new Promise<void>((resolve) => {
        const server = this.app.listen();
        server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });

      // Close database connections
      await DatabaseConnection.disconnect();
      logger.info('Database connections closed');

      // Close Redis connections
      await RedisConnection.disconnect();
      logger.info('Redis connections closed');

      // Close queue connections
      await QueueManager.shutdown();
      logger.info('Queue connections closed');

      logger.info('Graceful shutdown completed');
      process.exit(0);

    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await DatabaseConnection.initialize();
      logger.info('Database connection established');

      // Initialize Redis connection
      await RedisConnection.initialize();
      logger.info('Redis connection established');

      // Initialize queue manager
      await QueueManager.initialize();
      logger.info('Queue manager initialized');

      // Start server
      this.app.listen(this.port, () => {
        logger.info(`🚀 Server running on port ${this.port}`);
        logger.info(`📝 Environment: ${config.NODE_ENV}`);
        logger.info(`🔗 API Base URL: http://localhost:${this.port}/api/${config.API_VERSION}`);
        
        if (config.ENABLE_SWAGGER_DOCS) {
          logger.info(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
        }
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start server
const server = new Server();
server.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default server;