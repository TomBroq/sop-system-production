/**
 * Redis Connection Management
 * Handles Redis connection for caching, session storage, and queue management
 */

import Redis from 'ioredis';
import { config } from '@/config/environment';
import { logger } from '@/shared/logger';

// Redis connection options
const redisOptions = {
  host: new URL(config.REDIS_URL).hostname,
  port: parseInt(new URL(config.REDIS_URL).port) || 6379,
  password: config.REDIS_PASSWORD || new URL(config.REDIS_URL).password,
  db: config.REDIS_DB,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,
  lazyConnect: true,
  keepAlive: 30000,
  commandTimeout: 5000,
  connectTimeout: 10000
};

// Extended Redis client with custom methods
class ExtendedRedis extends Redis {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isHealthy: boolean = false;

  constructor(options: any) {
    super(options);

    // Event handlers
    this.on('connect', () => {
      logger.info('Redis connected');
      this.isHealthy = true;
    });

    this.on('ready', () => {
      logger.info('Redis ready');
      this.isHealthy = true;
    });

    this.on('error', (error) => {
      logger.error('Redis error', {
        error: error.message
      });
      this.isHealthy = false;
    });

    this.on('close', () => {
      logger.warn('Redis connection closed');
      this.isHealthy = false;
    });

    this.on('reconnecting', () => {
      logger.info('Redis reconnecting');
    });
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Start health monitoring
  startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      const healthy = await this.healthCheck();
      if (this.isHealthy !== healthy) {
        this.isHealthy = healthy;
        logger.info('Redis health status changed', { healthy });
      }
    }, config.HEALTH_CHECK_INTERVAL_MS);
  }

  // Stop health monitoring
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Get Redis info and stats
  async getStats(): Promise<any> {
    try {
      const info = await this.info();
      const memory = await this.info('memory');
      const stats = await this.info('stats');
      
      return {
        info: this.parseRedisInfo(info),
        memory: this.parseRedisInfo(memory),
        stats: this.parseRedisInfo(stats),
        healthy: this.isHealthy
      };
    } catch (error) {
      logger.error('Failed to get Redis stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  // Parse Redis INFO command output
  private parseRedisInfo(info: string): any {
    const result: any = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = isNaN(Number(value)) ? value : Number(value);
      }
    }
    
    return result;
  }

  // Check if healthy
  isConnected(): boolean {
    return this.isHealthy;
  }
}

// Cache service with business logic
export class CacheService {
  private redis: ExtendedRedis;

  constructor(redisClient: ExtendedRedis) {
    this.redis = redisClient;
  }

  // Generic cache operations
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      logger.error('Cache set error', {
        key,
        ttl: ttlSeconds,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  // Pattern-based operations
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      const result = await this.redis.del(...keys);
      return result;
    } catch (error) {
      logger.error('Cache delete pattern error', {
        pattern,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  // Business-specific cache methods

  // Industry data caching (high TTL as it changes infrequently)
  async getIndustryData(industryCode: string): Promise<any> {
    const key = `industry:${industryCode}`;
    return this.get(key);
  }

  async setIndustryData(industryCode: string, data: any): Promise<boolean> {
    const key = `industry:${industryCode}`;
    return this.set(key, data, config.cache.industryDataTtl);
  }

  // Question templates caching
  async getQuestionTemplate(industryId: string, companySize: string): Promise<any> {
    const key = `template:${industryId}:${companySize}`;
    return this.get(key);
  }

  async setQuestionTemplate(industryId: string, companySize: string, template: any): Promise<boolean> {
    const key = `template:${industryId}:${companySize}`;
    return this.set(key, template, config.cache.questionTemplatesTtl);
  }

  // Client data caching (shorter TTL as it changes more frequently)
  async getClientData(clientId: string): Promise<any> {
    const key = `client:${clientId}`;
    return this.get(key);
  }

  async setClientData(clientId: string, data: any, ttl: number = 1800): Promise<boolean> {
    const key = `client:${clientId}`;
    return this.set(key, data, ttl);
  }

  async invalidateClientData(clientId: string): Promise<void> {
    const patterns = [
      `client:${clientId}`,
      `client:${clientId}:*`,
      `form:client:${clientId}:*`,
      `sops:client:${clientId}:*`,
      `proposal:client:${clientId}:*`
    ];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }

    logger.info('Client cache invalidated', { clientId });
  }

  // Form data caching
  async getFormData(formId: string): Promise<any> {
    const key = `form:${formId}`;
    return this.get(key);
  }

  async setFormData(formId: string, data: any): Promise<boolean> {
    const key = `form:${formId}`;
    return this.set(key, data, 3600); // 1 hour TTL
  }

  // AI processing job status caching
  async getAIJobStatus(jobId: string): Promise<any> {
    const key = `ai_job:${jobId}:status`;
    return this.get(key);
  }

  async setAIJobStatus(jobId: string, status: any): Promise<boolean> {
    const key = `ai_job:${jobId}:status`;
    return this.set(key, status, 300); // 5 minutes TTL
  }

  // Session management
  async getSession(sessionId: string): Promise<any> {
    const key = `session:${sessionId}`;
    return this.get(key);
  }

  async setSession(sessionId: string, sessionData: any, ttl: number = 86400): Promise<boolean> {
    const key = `session:${sessionId}`;
    return this.set(key, sessionData, ttl);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    return this.del(key);
  }

  // Rate limiting
  async checkRateLimit(identifier: string, windowSeconds: number, maxRequests: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `rate_limit:${identifier}`;
    
    try {
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        await this.redis.expire(key, windowSeconds);
      }
      
      const ttl = await this.redis.ttl(key);
      const resetTime = Date.now() + (ttl * 1000);
      
      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetTime
      };
    } catch (error) {
      logger.error('Rate limit check error', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Allow request on error (fail open)
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: Date.now() + (windowSeconds * 1000)
      };
    }
  }

  // Performance metrics caching
  async cacheMetric(metricType: string, value: number, timestamp?: Date): Promise<boolean> {
    const key = `metric:${metricType}:${timestamp?.getTime() || Date.now()}`;
    return this.set(key, { metricType, value, timestamp: timestamp || new Date() }, 3600);
  }

  // Cache warming - preload frequently accessed data
  async warmCache(): Promise<void> {
    try {
      logger.info('Starting cache warm-up');

      // This would typically load frequently accessed data
      // For now, we'll just log the operation
      logger.info('Cache warm-up completed');

    } catch (error) {
      logger.error('Cache warm-up failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Cache statistics
  async getCacheStats(): Promise<any> {
    try {
      const info = await this.redis.getStats();
      const keyspace = await this.redis.info('keyspace');
      
      return {
        ...info,
        keyspace: this.parseKeyspace(keyspace),
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to get cache stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  private parseKeyspace(keyspace: string): any {
    const result: any = {};
    const lines = keyspace.split('\r\n');
    
    for (const line of lines) {
      if (line.startsWith('db')) {
        const [db, info] = line.split(':');
        const stats = info.split(',').reduce((acc: any, pair) => {
          const [key, value] = pair.split('=');
          acc[key] = parseInt(value);
          return acc;
        }, {});
        result[db] = stats;
      }
    }
    
    return result;
  }
}

// Redis connection manager
export class RedisConnection {
  private static instance: ExtendedRedis | null = null;
  private static cacheService: CacheService | null = null;

  // Get Redis instance
  static getInstance(): ExtendedRedis {
    if (!this.instance) {
      this.instance = new ExtendedRedis(redisOptions);
    }
    return this.instance;
  }

  // Get cache service
  static getCacheService(): CacheService {
    if (!this.cacheService) {
      this.cacheService = new CacheService(this.getInstance());
    }
    return this.cacheService;
  }

  // Initialize Redis connection
  static async initialize(): Promise<void> {
    try {
      const redis = this.getInstance();
      
      // Connect to Redis
      await redis.connect();
      
      // Start health monitoring
      redis.startHealthMonitoring();
      
      // Warm cache if enabled
      if (config.features.enableMetrics) {
        const cacheService = this.getCacheService();
        await cacheService.warmCache();
      }

      logger.info('Redis connection initialized', {
        host: redisOptions.host,
        port: redisOptions.port,
        db: redisOptions.db
      });

    } catch (error) {
      logger.error('Failed to initialize Redis connection', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Disconnect from Redis
  static async disconnect(): Promise<void> {
    try {
      if (this.instance) {
        this.instance.stopHealthMonitoring();
        await this.instance.quit();
        this.instance = null;
        this.cacheService = null;
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error disconnecting from Redis', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Check connection status
  static async getStatus(): Promise<any> {
    if (!this.instance) {
      return { connected: false, healthy: false };
    }

    try {
      const healthy = await this.instance.healthCheck();
      const stats = await this.instance.getStats();
      
      return {
        connected: this.instance.isConnected(),
        healthy,
        stats
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

// Export cache service for use in controllers
export const cache = RedisConnection.getCacheService();

export default RedisConnection;