/**
 * Environment Configuration
 * Centralized configuration management for the Sistema SOP backend
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  // Application Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('Sistema SOP Backend'),
  APP_VERSION: z.string().default('1.0.0'),

  // Database Configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_MIN: z.string().transform(Number).default('2'),
  DATABASE_POOL_MAX: z.string().transform(Number).default('10'),
  DATABASE_TIMEOUT: z.string().transform(Number).default('30000'),

  // Redis Configuration
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Encryption Configuration (LGPD Compliance)
  ENCRYPTION_KEY: z.string().length(32, 'ENCRYPTION_KEY must be exactly 32 characters'),
  ENCRYPTION_ALGORITHM: z.string().default('aes-256-gcm'),

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('300000'), // 5 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_ADMIN_MAX: z.string().transform(Number).default('1000'),

  // CORS Configuration
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.string().transform(Boolean).default('true'),

  // Tally Forms API Integration
  TALLY_API_URL: z.string().url().default('https://api.tally.so/api'),
  TALLY_API_KEY: z.string().min(1, 'TALLY_API_KEY is required'),
  TALLY_WEBHOOK_SECRET: z.string().min(1, 'TALLY_WEBHOOK_SECRET is required'),

  // Sistema Multiagente Integration
  MULTIAGENT_API_URL: z.string().url(),
  MULTIAGENT_API_KEY: z.string().min(1, 'MULTIAGENT_API_KEY is required'),
  MULTIAGENT_TIMEOUT_MS: z.string().transform(Number).default('120000'), // 2 minutes

  // Email Service Configuration
  EMAIL_SERVICE: z.enum(['sendgrid', 'resend', 'nodemailer']).default('sendgrid'),
  EMAIL_API_KEY: z.string().min(1, 'EMAIL_API_KEY is required'),
  EMAIL_FROM_ADDRESS: z.string().email('EMAIL_FROM_ADDRESS must be valid email'),
  EMAIL_FROM_NAME: z.string().default('Sistema SOP'),

  // PDF Generation Configuration
  PDF_GENERATION_TIMEOUT: z.string().transform(Number).default('30000'),
  PDF_STORAGE_PATH: z.string().default('./storage/pdfs'),
  PDF_MAX_SIZE_MB: z.string().transform(Number).default('10'),

  // File Upload Configuration
  UPLOAD_MAX_SIZE_MB: z.string().transform(Number).default('5'),
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,application/pdf'),
  UPLOAD_STORAGE_PATH: z.string().default('./storage/uploads'),

  // Monitoring and Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().default('./logs'),
  LOG_MAX_SIZE: z.string().default('20m'),
  LOG_MAX_FILES: z.string().default('14d'),

  // Sentry Configuration
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default('development'),
  SENTRY_SAMPLE_RATE: z.string().transform(Number).default('1.0'),

  // Performance Monitoring
  ENABLE_METRICS: z.string().transform(Boolean).default('true'),
  METRICS_COLLECTION_INTERVAL: z.string().transform(Number).default('60000'),

  // Security Configuration
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  COOKIE_SECURE: z.string().transform(Boolean).default('false'),
  COOKIE_HTTP_ONLY: z.string().transform(Boolean).default('true'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),

  // Business Rules Configuration (from PRD)
  MIN_PROCESSES_PER_ANALYSIS: z.string().transform(Number).default('5'),
  MAX_FORM_EXPIRY_DAYS: z.string().transform(Number).default('30'),
  DEFAULT_ANALYSIS_TIMEOUT_MINUTES: z.string().transform(Number).default('5'),

  // Development/Testing Configuration
  ENABLE_SEED_DATA: z.string().transform(Boolean).default('true'),
  ENABLE_SWAGGER_DOCS: z.string().transform(Boolean).default('true'),
  ENABLE_DEBUG_ROUTES: z.string().transform(Boolean).default('false'),

  // External Services Health Check
  HEALTH_CHECK_INTERVAL_MS: z.string().transform(Number).default('300000'),
  EXTERNAL_SERVICES_TIMEOUT: z.string().transform(Number).default('10000'),

  // Cache Configuration
  CACHE_TTL_SECONDS: z.string().transform(Number).default('3600'),
  CACHE_INDUSTRY_DATA_TTL: z.string().transform(Number).default('7200'),
  CACHE_QUESTION_TEMPLATES_TTL: z.string().transform(Number).default('3600'),

  // Queue Configuration
  QUEUE_REDIS_URL: z.string().optional(),
  QUEUE_DEFAULT_JOB_ATTEMPTS: z.string().transform(Number).default('3'),
  QUEUE_DEFAULT_BACKOFF_DELAY: z.string().transform(Number).default('5000'),
  
  // Queue Concurrency Configuration
  QUEUE_AI_PROCESSING_CONCURRENCY: z.string().transform(Number).default('2'),
  QUEUE_SOP_GENERATION_CONCURRENCY: z.string().transform(Number).default('3'),
  QUEUE_NOTIFICATIONS_CONCURRENCY: z.string().transform(Number).default('5'),
  QUEUE_PROPOSAL_GENERATION_CONCURRENCY: z.string().transform(Number).default('2'),
  QUEUE_PDF_GENERATION_CONCURRENCY: z.string().transform(Number).default('3'),

  // Webhook Configuration
  WEBHOOK_SIGNATURE_HEADER: z.string().default('x-tally-signature'),
  WEBHOOK_TIMEOUT_MS: z.string().transform(Number).default('5000'),

  // Backup and Maintenance
  AUTO_BACKUP_ENABLED: z.string().transform(Boolean).default('true'),
  AUTO_BACKUP_SCHEDULE: z.string().default('0 2 * * *'),
  DATA_RETENTION_DAYS: z.string().transform(Number).default('730'),

  // Compliance and Audit
  AUDIT_LOG_RETENTION_DAYS: z.string().transform(Number).default('2555'),
  SENSITIVE_DATA_LOG_RETENTION_DAYS: z.string().transform(Number).default('90'),
  GDPR_DATA_EXPORT_FORMAT: z.enum(['json', 'csv', 'xml']).default('json'),

  // Localization
  DEFAULT_LOCALE: z.string().default('es'),
  DEFAULT_TIMEZONE: z.string().default('America/Santiago'),
  SUPPORTED_LOCALES: z.string().default('es,en'),

  // API Documentation
  SWAGGER_TITLE: z.string().default('Sistema SOP API'),
  SWAGGER_DESCRIPTION: z.string().default('API para el Sistema de Levantamiento Automatizado de Procesos'),
  SWAGGER_VERSION: z.string().default('1.0.0'),
  SWAGGER_CONTACT_EMAIL: z.string().email().default('api@sistema-sop.com')
});

// Validate and parse environment variables
let config: z.infer<typeof envSchema>;

try {
  config = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    console.error('❌ Environment validation failed:');
    console.error(missingVars.join('\n'));
    process.exit(1);
  }
  throw error;
}

// Derived configurations
const derivedConfig = {
  // Database configuration object
  database: {
    url: config.DATABASE_URL,
    pool: {
      min: config.DATABASE_POOL_MIN,
      max: config.DATABASE_POOL_MAX
    },
    timeout: config.DATABASE_TIMEOUT
  },

  // Redis configuration object
  redis: {
    url: config.REDIS_URL,
    password: config.REDIS_PASSWORD,
    db: config.REDIS_DB
  },

  // JWT configuration object
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
    refresh: {
      secret: config.JWT_REFRESH_SECRET,
      expiresIn: config.JWT_REFRESH_EXPIRES_IN
    }
  },

  // External APIs configuration
  externalApis: {
    tally: {
      baseUrl: config.TALLY_API_URL,
      apiKey: config.TALLY_API_KEY,
      webhookSecret: config.TALLY_WEBHOOK_SECRET
    },
    multiagent: {
      baseUrl: config.MULTIAGENT_API_URL,
      apiKey: config.MULTIAGENT_API_KEY,
      timeout: config.MULTIAGENT_TIMEOUT_MS
    },
    email: {
      service: config.EMAIL_SERVICE,
      apiKey: config.EMAIL_API_KEY,
      from: {
        address: config.EMAIL_FROM_ADDRESS,
        name: config.EMAIL_FROM_NAME
      }
    }
  },

  // Security configuration object
  security: {
    encryption: {
      key: config.ENCRYPTION_KEY,
      algorithm: config.ENCRYPTION_ALGORITHM
    },
    bcrypt: {
      rounds: config.BCRYPT_ROUNDS
    },
    session: {
      secret: config.SESSION_SECRET,
      cookie: {
        secure: config.COOKIE_SECURE,
        httpOnly: config.COOKIE_HTTP_ONLY,
        sameSite: config.COOKIE_SAME_SITE
      }
    }
  },

  // Business rules from PRD
  businessRules: {
    minProcessesPerAnalysis: config.MIN_PROCESSES_PER_ANALYSIS,
    maxFormExpiryDays: config.MAX_FORM_EXPIRY_DAYS,
    defaultAnalysisTimeoutMinutes: config.DEFAULT_ANALYSIS_TIMEOUT_MINUTES,
    
    // Form generation rules (RN1 de RF002)
    questionCountByCompanySize: {
      micro: { min: 15, max: 20 },
      small: { min: 20, max: 25 },
      medium: { min: 25, max: 30 },
      large: { min: 30, max: 40 }
    },

    // Performance targets from PRD
    performanceTargets: {
      apiResponseTime: 3000, // <3s for queries
      formGenerationTime: 30000, // <30s
      aiProcessingTime: 120000, // <2min
      sopGenerationTime: 10000, // <10s
      pdfGenerationTime: 5000, // <5s
      webhookProcessingTime: 5000 // <5s
    },

    // Business KPI targets
    kpiTargets: {
      formCompletionRate: 85, // >85%
      sopApprovalRate: 90, // >90%
      proposalConversionRate: 25, // >25%
      systemUptime: 99 // >99%
    }
  },

  // File upload configuration
  upload: {
    maxSizeMB: config.UPLOAD_MAX_SIZE_MB,
    allowedTypes: config.UPLOAD_ALLOWED_TYPES.split(','),
    storagePath: config.UPLOAD_STORAGE_PATH
  },

  // Cache configuration
  cache: {
    defaultTtl: config.CACHE_TTL_SECONDS,
    industryDataTtl: config.CACHE_INDUSTRY_DATA_TTL,
    questionTemplatesTtl: config.CACHE_QUESTION_TEMPLATES_TTL
  },

  // Queue configuration
  queue: {
    redis: {
      url: config.QUEUE_REDIS_URL || config.REDIS_URL,
      host: config.REDIS_URL.split('@')[1]?.split(':')[0] || 'localhost',
      port: parseInt(config.REDIS_URL.split(':').pop()?.split('/')[0] || '6379'),
      password: config.REDIS_PASSWORD
    },
    concurrency: {
      AI_PROCESSING: config.QUEUE_AI_PROCESSING_CONCURRENCY,
      SOP_GENERATION: config.QUEUE_SOP_GENERATION_CONCURRENCY,
      NOTIFICATIONS: config.QUEUE_NOTIFICATIONS_CONCURRENCY,
      PROPOSAL_GENERATION: config.QUEUE_PROPOSAL_GENERATION_CONCURRENCY,
      PDF_GENERATION: config.QUEUE_PDF_GENERATION_CONCURRENCY
    },
    defaults: {
      attempts: config.QUEUE_DEFAULT_JOB_ATTEMPTS,
      backoffDelay: config.QUEUE_DEFAULT_BACKOFF_DELAY
    }
  },

  // Feature flags
  features: {
    enableMetrics: config.ENABLE_METRICS,
    enableSeedData: config.ENABLE_SEED_DATA,
    enableSwaggerDocs: config.ENABLE_SWAGGER_DOCS,
    enableDebugRoutes: config.ENABLE_DEBUG_ROUTES,
    autoBackupEnabled: config.AUTO_BACKUP_ENABLED
  }
};

// Export complete configuration
export const environment = {
  ...config,
  ...derivedConfig
} as const;

// Export individual configurations for convenience
export { config };
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isStaging = config.NODE_ENV === 'staging';

// Environment-specific logging
if (isDevelopment) {
  console.log('🔧 Development environment loaded');
  console.log(`📦 App: ${config.APP_NAME} v${config.APP_VERSION}`);
  console.log(`🚀 Port: ${config.PORT}`);
  console.log(`🗄️  Database: ${config.DATABASE_URL.split('@')[1]?.split('/')[0] || 'configured'}`);
  console.log(`📮 Redis: ${config.REDIS_URL.split('@')[1]?.split('/')[0] || 'configured'}`);
}

// Validate critical configurations
if (isProduction) {
  // Production-specific validations
  if (config.JWT_SECRET.length < 64) {
    console.warn('⚠️  Warning: JWT_SECRET should be at least 64 characters in production');
  }
  
  if (!config.SENTRY_DSN) {
    console.warn('⚠️  Warning: SENTRY_DSN not configured for error tracking in production');
  }
  
  if (config.CORS_ORIGIN.includes('localhost')) {
    console.warn('⚠️  Warning: CORS_ORIGIN includes localhost in production');
  }
}

export default environment;