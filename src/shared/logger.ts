/**
 * Centralized Logging System
 * Winston-based logger with file rotation and structured logging
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '@/config/environment';

// Custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    trace: 5
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
    trace: 'gray'
  }
};

// Add colors to winston
winston.addColors(customLevels.colors);

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    
    const logEntry = {
      timestamp,
      level,
      message,
      ...(stack && { stack }),
      ...(Object.keys(meta).length > 0 && { meta })
    };

    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    return logMessage;
  })
);

// File transport configuration
const fileTransports = [
  // Error logs - separate file for errors only
  new DailyRotateFile({
    filename: `${config.LOG_FILE_PATH}/error-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: structuredFormat,
    maxSize: config.LOG_MAX_SIZE,
    maxFiles: config.LOG_MAX_FILES,
    zippedArchive: true
  }),

  // Combined logs - all levels
  new DailyRotateFile({
    filename: `${config.LOG_FILE_PATH}/combined-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    format: structuredFormat,
    maxSize: config.LOG_MAX_SIZE,
    maxFiles: config.LOG_MAX_FILES,
    zippedArchive: true
  }),

  // Audit logs - for LGPD compliance
  new DailyRotateFile({
    filename: `${config.LOG_FILE_PATH}/audit-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.printf((info) => {
        // Only log entries marked as audit logs
        if (info.audit) {
          return JSON.stringify({
            timestamp: info.timestamp,
            action: info.action,
            userId: info.userId,
            clientId: info.clientId,
            ipAddress: info.ipAddress,
            userAgent: info.userAgent,
            details: info.details,
            sensitiveData: info.sensitiveData || false
          });
        }
        return '';
      })
    ),
    maxSize: config.LOG_MAX_SIZE,
    maxFiles: '2555d', // 7 years for audit compliance
    zippedArchive: true
  })
];

// Console transport for development
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: config.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Create logger instance
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: config.LOG_LEVEL,
  format: structuredFormat,
  defaultMeta: {
    service: config.APP_NAME,
    version: config.APP_VERSION,
    environment: config.NODE_ENV
  },
  transports: [
    consoleTransport,
    ...fileTransports
  ],
  exitOnError: false
});

// Performance logger for metrics
const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: `${config.LOG_FILE_PATH}/performance-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: config.LOG_MAX_SIZE,
      maxFiles: '30d',
      zippedArchive: true
    })
  ]
});

// Business metrics logger
const businessLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: `${config.LOG_FILE_PATH}/business-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: config.LOG_MAX_SIZE,
      maxFiles: '365d', // 1 year for business metrics
      zippedArchive: true
    })
  ]
});

// Logger interfaces and types
interface LogContext {
  requestId?: string;
  userId?: string;
  clientId?: string;
  action?: string;
  duration?: number;
  error?: Error;
  [key: string]: any;
}

interface AuditLogContext extends LogContext {
  audit: true;
  action: string;
  userId?: string;
  clientId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  sensitiveData?: boolean;
}

interface PerformanceLogContext {
  metric: string;
  value: number;
  unit: string;
  clientId?: string;
  additionalContext?: any;
}

interface BusinessLogContext {
  event: string;
  clientId?: string;
  userId?: string;
  value?: number;
  metadata?: any;
}

// Enhanced logger with convenience methods
class EnhancedLogger {
  private winston: winston.Logger;
  private performanceLogger: winston.Logger;
  private businessLogger: winston.Logger;

  constructor(
    winstonLogger: winston.Logger,
    perfLogger: winston.Logger,
    bizLogger: winston.Logger
  ) {
    this.winston = winstonLogger;
    this.performanceLogger = perfLogger;
    this.businessLogger = bizLogger;
  }

  // Standard logging methods
  error(message: string, context?: LogContext): void {
    this.winston.error(message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.winston.warn(message, context);
  }

  info(message: string, context?: LogContext): void {
    this.winston.info(message, context);
  }

  http(message: string, context?: LogContext): void {
    this.winston.http(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.winston.debug(message, context);
  }

  trace(message: string, context?: LogContext): void {
    this.winston.log('trace', message, context);
  }

  // Audit logging for LGPD compliance
  audit(message: string, context: Omit<AuditLogContext, 'audit'>): void {
    this.winston.info(message, { ...context, audit: true });
  }

  // Performance logging
  performance(context: PerformanceLogContext): void {
    this.performanceLogger.info('Performance Metric', {
      metric: context.metric,
      value: context.value,
      unit: context.unit,
      clientId: context.clientId,
      additionalContext: context.additionalContext
    });
  }

  // Business event logging
  business(context: BusinessLogContext): void {
    this.businessLogger.info('Business Event', {
      event: context.event,
      clientId: context.clientId,
      userId: context.userId,
      value: context.value,
      metadata: context.metadata
    });
  }

  // Request logging with timing
  requestStart(requestId: string, method: string, url: string, userId?: string): void {
    this.http('Request started', {
      requestId,
      method,
      url,
      userId,
      timestamp: Date.now()
    });
  }

  requestEnd(
    requestId: string, 
    method: string, 
    url: string, 
    statusCode: number, 
    duration: number,
    userId?: string
  ): void {
    this.http('Request completed', {
      requestId,
      method,
      url,
      statusCode,
      duration,
      userId
    });

    // Log performance metric
    this.performance({
      metric: 'api_response_time',
      value: duration,
      unit: 'ms',
      additionalContext: { method, url, statusCode }
    });
  }

  // AI processing logging
  aiProcessingStart(jobId: string, clientId: string): void {
    this.info('AI processing started', {
      jobId,
      clientId,
      action: 'ai_processing_start'
    });
  }

  aiProcessingEnd(
    jobId: string, 
    clientId: string, 
    duration: number, 
    processCount: number,
    success: boolean
  ): void {
    this.info('AI processing completed', {
      jobId,
      clientId,
      duration,
      processCount,
      success,
      action: 'ai_processing_end'
    });

    // Log performance and business metrics
    this.performance({
      metric: 'ai_processing_time',
      value: duration,
      unit: 'ms',
      clientId
    });

    this.business({
      event: 'ai_processing_completed',
      clientId,
      value: processCount,
      metadata: { duration, success }
    });
  }

  // Form generation logging
  formGenerated(clientId: string, formId: string, questionCount: number, duration: number): void {
    this.info('Form generated', {
      clientId,
      formId,
      questionCount,
      duration,
      action: 'form_generated'
    });

    this.performance({
      metric: 'form_generation_time',
      value: duration,
      unit: 'ms',
      clientId
    });

    this.business({
      event: 'form_generated',
      clientId,
      value: questionCount,
      metadata: { formId, duration }
    });
  }

  // SOP generation logging
  sopGenerated(clientId: string, processId: string, sopId: string, duration: number): void {
    this.info('SOP generated', {
      clientId,
      processId,
      sopId,
      duration,
      action: 'sop_generated'
    });

    this.performance({
      metric: 'sop_generation_time',
      value: duration,
      unit: 'ms',
      clientId
    });

    this.business({
      event: 'sop_generated',
      clientId,
      metadata: { processId, sopId, duration }
    });
  }

  // Proposal generation logging
  proposalGenerated(clientId: string, proposalId: string, duration: number): void {
    this.info('Proposal generated', {
      clientId,
      proposalId,
      duration,
      action: 'proposal_generated'
    });

    this.performance({
      metric: 'pdf_generation_time',
      value: duration,
      unit: 'ms',
      clientId
    });

    this.business({
      event: 'proposal_generated',
      clientId,
      metadata: { proposalId, duration }
    });
  }

  // Client workflow state changes
  clientStatusChanged(
    clientId: string, 
    fromStatus: string, 
    toStatus: string, 
    userId?: string,
    trigger?: string
  ): void {
    this.info('Client status changed', {
      clientId,
      fromStatus,
      toStatus,
      userId,
      trigger,
      action: 'client_status_changed'
    });

    this.business({
      event: 'client_status_changed',
      clientId,
      userId,
      metadata: { fromStatus, toStatus, trigger }
    });
  }

  // Error logging with context
  logError(error: Error, context?: LogContext): void {
    this.error(error.message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }

  // Security event logging
  securityEvent(event: string, context: LogContext): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      security: true
    });

    // Also log as audit event
    this.audit(`Security Event: ${event}`, {
      action: event,
      userId: context.userId,
      clientId: context.clientId,
      ipAddress: context.ipAddress as string,
      userAgent: context.userAgent as string,
      details: context,
      sensitiveData: false
    });
  }
}

// Create and export enhanced logger instance
export const logger = new EnhancedLogger(logger, performanceLogger, businessLogger);

// Export for testing and advanced usage
export { winston };

// Stream interface for Morgan HTTP logging
export const logStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};