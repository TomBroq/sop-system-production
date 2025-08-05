/**
 * Database Connection Management
 * Handles PostgreSQL connection via Prisma with connection pooling and health checks
 */

import { PrismaClient } from '@prisma/client';
import { config } from '@/config/environment';
import { logger } from '@/shared/logger';

// Extend Prisma Client with custom methods
class ExtendedPrismaClient extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: config.DATABASE_URL
        }
      },
      log: [
        {
          emit: 'event',
          level: 'query'
        },
        {
          emit: 'event', 
          level: 'error'
        },
        {
          emit: 'event',
          level: 'info'
        },
        {
          emit: 'event',
          level: 'warn'
        }
      ],
      errorFormat: 'pretty'
    });

    // Log database queries in development
    if (config.NODE_ENV === 'development') {
      this.$on('query', (e) => {
        logger.debug('Database query', {
          query: e.query,
          params: e.params,
          duration: e.duration,
          target: e.target
        });
      });
    }

    // Log database errors
    this.$on('error', (e) => {
      logger.error('Database error', {
        target: e.target,
        message: e.message
      });
    });

    // Log database warnings
    this.$on('warn', (e) => {
      logger.warn('Database warning', {
        target: e.target,
        message: e.message
      });
    });

    // Log database info
    this.$on('info', (e) => {
      logger.info('Database info', {
        target: e.target,
        message: e.message
      });
    });
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.$executeRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Get connection pool status
  async getConnectionPoolStatus(): Promise<any> {
    try {
      // This is a simplified version - in production you might want more detailed metrics
      const result = await this.$executeRaw`
        SELECT 
          numbackends as active_connections,
          xact_commit as transactions_committed,
          xact_rollback as transactions_rolled_back,
          blks_read as blocks_read,
          blks_hit as blocks_hit
        FROM pg_stat_database 
        WHERE datname = current_database()
      `;
      
      return result;
    } catch (error) {
      logger.error('Failed to get connection pool status', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  // Performance metrics
  async getPerformanceMetrics(): Promise<any> {
    try {
      const slowQueries = await this.$executeRaw`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements 
        WHERE mean_time > 1000 
        ORDER BY mean_time DESC 
        LIMIT 10
      `;

      const tableStats = await this.$executeRaw`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
        LIMIT 10
      `;

      return {
        slowQueries,
        tableStats
      };
    } catch (error) {
      logger.error('Failed to get performance metrics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  // Transaction wrapper with automatic retry
  async withRetry<T>(
    operation: (prisma: ExtendedPrismaClient) => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation(this);
      } catch (error) {
        lastError = error as Error;
        
        logger.warn('Database operation failed, retrying', {
          attempt,
          maxRetries,
          error: lastError.message
        });

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }

    throw lastError!;
  }

  // Batch operations for better performance
  async batchInsert<T>(
    tableName: string,
    data: T[],
    batchSize: number = 1000
  ): Promise<void> {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await this.$transaction(async (tx) => {
        // This would need to be implemented based on specific table schemas
        // For now, this is a placeholder
        logger.info('Batch insert', {
          tableName,
          batchSize: batch.length
        });
      });
    }
  }

  // Audit log cleanup (LGPD compliance)
  async cleanupOldAuditLogs(retentionDays: number = 2555): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        // Keep sensitive data access logs longer
        sensitiveDataAccessed: false
      }
    });

    logger.info('Cleaned up old audit logs', {
      deletedCount: result.count,
      cutoffDate: cutoffDate.toISOString()
    });

    return result.count;
  }

  // LGPD data export
  async exportClientData(clientId: string): Promise<any> {
    const [
      client,
      forms,
      responses,
      processes,
      sops,
      proposals,
      auditLogs,
      dataProcessingRecords
    ] = await Promise.all([
      this.client.findUnique({ where: { id: clientId } }),
      this.generatedForm.findMany({ where: { clientId } }),
      this.formResponse.findMany({ where: { clientId } }),
      this.identifiedProcess.findMany({ where: { clientId } }),
      this.generatedSOP.findMany({ where: { clientId } }),
      this.commercialProposal.findMany({ where: { clientId } }),
      this.auditLog.findMany({ where: { entityId: clientId } }),
      this.dataProcessingRecord.findMany({ where: { clientId } })
    ]);

    return {
      exportDate: new Date().toISOString(),
      clientData: {
        client,
        forms,
        responses,
        processes,
        sops,
        proposals,
        auditLogs,
        dataProcessingRecords
      }
    };
  }

  // LGPD data deletion
  async deleteClientData(clientId: string): Promise<any> {
    const deletionResults = await this.$transaction(async (tx) => {
      // Delete in reverse dependency order
      const auditLogs = await tx.auditLog.deleteMany({ where: { entityId: clientId } });
      const dataProcessing = await tx.dataProcessingRecord.deleteMany({ where: { clientId } });
      const notifications = await tx.notification.deleteMany({ where: { clientId } });
      const proposals = await tx.commercialProposal.deleteMany({ where: { clientId } });
      const analysis = await tx.automationAnalysis.deleteMany({ where: { clientId } });
      const sops = await tx.generatedSOP.deleteMany({ where: { clientId } });
      const processes = await tx.identifiedProcess.deleteMany({ where: { clientId } });
      const aiJobs = await tx.aIProcessingJob.deleteMany({ where: { clientId } });
      const responses = await tx.formResponse.deleteMany({ where: { clientId } });
      const forms = await tx.generatedForm.deleteMany({ where: { clientId } });
      const workflows = await tx.workflowTransition.deleteMany({ where: { clientId } });
      const metrics = await tx.systemMetric.deleteMany({ where: { clientId } });
      const client = await tx.client.delete({ where: { id: clientId } });

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

    logger.info('Client data deleted (LGPD compliance)', {
      clientId,
      deletionResults
    });

    return deletionResults;
  }
}

// Database connection manager
export class DatabaseConnection {
  private static instance: ExtendedPrismaClient | null = null;
  private static isConnected: boolean = false;
  private static healthCheckInterval: NodeJS.Timeout | null = null;

  // Get database instance
  static getInstance(): ExtendedPrismaClient {
    if (!this.instance) {
      this.instance = new ExtendedPrismaClient();
    }
    return this.instance;
  }

  // Initialize database connection
  static async initialize(): Promise<void> {
    try {
      const db = this.getInstance();
      
      // Test connection
      await db.$connect();
      
      // Verify health
      const isHealthy = await db.healthCheck();
      if (!isHealthy) {
        throw new Error('Database health check failed');
      }

      this.isConnected = true;
      
      logger.info('Database connection established', {
        url: config.DATABASE_URL.split('@')[1]?.split('/')[0] || 'configured'
      });

      // Start health check monitoring
      this.startHealthCheckMonitoring();

      // Log connection pool status
      const poolStatus = await db.getConnectionPoolStatus();
      if (poolStatus) {
        logger.info('Database connection pool initialized', poolStatus);
      }

    } catch (error) {
      logger.error('Failed to initialize database connection', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Start periodic health checks
  private static startHealthCheckMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const db = this.getInstance();
        const isHealthy = await db.healthCheck();
        
        if (!isHealthy) {
          logger.error('Database health check failed during monitoring');
          this.isConnected = false;
        } else if (!this.isConnected) {
          logger.info('Database connection restored');
          this.isConnected = true;
        }

        // Log performance metrics periodically
        if (config.ENABLE_METRICS) {
          const metrics = await db.getPerformanceMetrics();
          if (metrics) {
            logger.performance({
              metric: 'database_performance',
              value: 0, // Placeholder
              unit: 'ms',
              additionalContext: metrics
            });
          }
        }

      } catch (error) {
        logger.error('Health check monitoring error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, config.HEALTH_CHECK_INTERVAL_MS);
  }

  // Disconnect from database
  static async disconnect(): Promise<void> {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      if (this.instance) {
        await this.instance.$disconnect();
        this.instance = null;
        this.isConnected = false;
        logger.info('Database connection closed');
      }
    } catch (error) {
      logger.error('Error disconnecting from database', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Check if connected
  static isHealthy(): boolean {
    return this.isConnected;
  }

  // Get connection status
  static async getStatus(): Promise<any> {
    if (!this.instance) {
      return { connected: false, healthy: false };
    }

    try {
      const healthy = await this.instance.healthCheck();
      const poolStatus = await this.instance.getConnectionPoolStatus();
      
      return {
        connected: this.isConnected,
        healthy,
        poolStatus
      };
    } catch (error) {
      return {
        connected: false,
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export database instance for use in services
export const db = DatabaseConnection.getInstance();

export default DatabaseConnection;