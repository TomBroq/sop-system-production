/**
 * Health Controller
 * Handles system health monitoring and metrics endpoints
 */

import { Request, Response } from 'express';
import { DatabaseConnection } from '@/infrastructure/database/connection';
import { RedisConnection } from '@/infrastructure/cache/redis-connection';
import { MetricsAggregationService } from '@/shared/middleware/metrics-middleware';
import { logger } from '@/shared/logger';
import { config } from '@/config/environment';
import axios from 'axios';

export class HealthController {
  // Basic health check - lightweight for load balancers
  async basicHealth(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const status = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: config.APP_VERSION,
        environment: config.NODE_ENV,
        responseTime: Date.now() - startTime
      };

      res.status(200).json(status);
    } catch (error) {
      logger.error('Basic health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      });
    }
  }

  // Detailed health check - comprehensive system status
  async detailedHealth(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check all dependencies in parallel
      const [databaseStatus, redisStatus, externalAPIStatus] = await Promise.allSettled([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.checkExternalAPIs()
      ]);

      // Collect service statuses
      const services = {
        database: this.extractResult(databaseStatus),
        redis: this.extractResult(redisStatus),
        externalAPIs: this.extractResult(externalAPIStatus)
      };

      // Determine overall health
      const allHealthy = Object.values(services).every(service => service.status === 'healthy');
      const overallStatus = allHealthy ? 'healthy' : 'degraded';

      const healthReport = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: config.APP_VERSION,
        environment: config.NODE_ENV,
        services,
        system: {
          memory: this.getMemoryUsage(),
          cpu: await this.getCPUUsage(),
          nodeVersion: process.version
        },
        responseTime: Date.now() - startTime
      };

      const statusCode = overallStatus === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthReport);

    } catch (error) {
      logger.error('Detailed health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        responseTime: Date.now() - startTime
      });
    }
  }

  // Kubernetes readiness probe
  async readinessProbe(req: Request, res: Response): Promise<void> {
    try {
      // Check if service can accept traffic
      const databaseReady = await this.isDatabaseReady();
      const redisReady = await this.isRedisReady();

      if (databaseReady && redisReady) {
        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: 'not ready',
          timestamp: new Date().toISOString(),
          reasons: {
            database: !databaseReady ? 'not ready' : 'ready',
            redis: !redisReady ? 'not ready' : 'ready'
          }
        });
      }
    } catch (error) {
      logger.error('Readiness probe failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'Readiness check failed'
      });
    }
  }

  // Kubernetes liveness probe
  async livenessProbe(req: Request, res: Response): Promise<void> {
    try {
      // Check if service is alive (basic functionality)
      const memoryUsage = process.memoryUsage();
      const isMemoryHealthy = memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9; // <90% heap usage

      if (isMemoryHealthy) {
        res.status(200).json({
          status: 'alive',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });
      } else {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          reason: 'memory_pressure'
        });
      }
    } catch (error) {
      logger.error('Liveness probe failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Liveness check failed'
      });
    }
  }

  // Performance metrics endpoint
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000)); // Last 24 hours

      const [performanceMetrics, businessKPIs, systemHealth] = await Promise.all([
        MetricsAggregationService.getPerformanceMetrics(startDate, endDate),
        MetricsAggregationService.getBusinessKPIs(startDate, endDate),
        MetricsAggregationService.getSystemHealth()
      ]);

      res.status(200).json({
        timestamp: new Date().toISOString(),
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        performance: performanceMetrics,
        businessKPIs,
        systemHealth
      });

    } catch (error) {
      logger.error('Failed to get metrics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        error: 'Failed to retrieve metrics',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Private helper methods

  private async checkDatabaseHealth(): Promise<any> {
    const startTime = Date.now();
    
    try {
      const dbStatus = await DatabaseConnection.getStatus();
      
      return {
        status: dbStatus.healthy ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime,
        details: dbStatus
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkRedisHealth(): Promise<any> {
    const startTime = Date.now();
    
    try {
      const redisStatus = await RedisConnection.getStatus();
      
      return {
        status: redisStatus.healthy ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime,
        details: redisStatus
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkExternalAPIs(): Promise<any> {
    const startTime = Date.now();
    const results: any = {};

    // Check Tally Forms API
    try {
      const tallyStartTime = Date.now();
      await axios.get(`${config.TALLY_API_URL}/health`, {
        timeout: config.EXTERNAL_SERVICES_TIMEOUT,
        headers: {
          'Authorization': `Bearer ${config.TALLY_API_KEY}`
        }
      });
      
      results.tallyForms = {
        status: 'healthy',
        responseTime: Date.now() - tallyStartTime
      };
    } catch (error) {
      results.tallyForms = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check Sistema Multiagente API
    try {
      const multiagentStartTime = Date.now();
      await axios.get(`${config.MULTIAGENT_API_URL}/health`, {
        timeout: config.EXTERNAL_SERVICES_TIMEOUT,
        headers: {
          'Authorization': `Bearer ${config.MULTIAGENT_API_KEY}`
        }
      });
      
      results.multiagentSystem = {
        status: 'healthy',
        responseTime: Date.now() - multiagentStartTime
      };
    } catch (error) {
      results.multiagentSystem = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check Email Service
    try {
      // This would depend on your email service provider's health check endpoint
      results.emailService = {
        status: 'healthy',
        responseTime: 0,
        note: 'Email service health check not implemented'
      };
    } catch (error) {
      results.emailService = {
        status: 'unknown',
        error: 'Health check not available'
      };
    }

    return {
      status: Object.values(results).every((service: any) => service.status === 'healthy') ? 'healthy' : 'degraded',
      responseTime: Date.now() - startTime,
      services: results
    };
  }

  private async isDatabaseReady(): Promise<boolean> {
    try {
      return DatabaseConnection.isHealthy();
    } catch {
      return false;
    }
  }

  private async isRedisReady(): Promise<boolean> {
    try {
      const status = await RedisConnection.getStatus();
      return status.healthy;
    } catch {
      return false;
    }
  }

  private getMemoryUsage(): any {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      heapUsagePercent: Math.round((usage.heapUsed / usage.heapTotal) * 100)
    };
  }

  private async getCPUUsage(): Promise<any> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = Date.now();

      setTimeout(() => {
        const currentUsage = process.cpuUsage(startUsage);
        const currentTime = Date.now();
        const timeDiff = currentTime - startTime;

        const userPercent = (currentUsage.user / 1000 / timeDiff) * 100;
        const systemPercent = (currentUsage.system / 1000 / timeDiff) * 100;

        resolve({
          user: Math.round(userPercent * 100) / 100,
          system: Math.round(systemPercent * 100) / 100,
          total: Math.round((userPercent + systemPercent) * 100) / 100
        });
      }, 100);
    });
  }

  private extractResult(settledResult: PromiseSettledResult<any>): any {
    if (settledResult.status === 'fulfilled') {
      return settledResult.value;
    } else {
      return {
        status: 'error',
        error: settledResult.reason instanceof Error ? settledResult.reason.message : 'Unknown error'
      };
    }
  }
}