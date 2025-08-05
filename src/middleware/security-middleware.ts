/**
 * Security Middleware - LGPD Compliance
 * Implementa monitoramento de segurança em tempo real
 * Detecção de anomalias e incident response automático
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logger';
import LGPDComplianceService, { SecurityAnomaly, IncidentSeverity } from '../services/lgpd-compliance-service';

interface SecurityMetrics {
  failedLogins: Map<string, number>;
  suspiciousIPs: Set<string>;
  dataAccessAttempts: Map<string, number>;
  lastCleanup: Date;
}

interface SecurityRequest extends Request {
  securityContext?: {
    riskScore: number;
    anomaliesDetected: string[];
    requiresExtraValidation: boolean;
  };
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class SecurityMiddleware {
  private prisma: PrismaClient;
  private complianceService: LGPDComplianceService;
  private metrics: SecurityMetrics;
  private maxFailedLogins = 5;
  private maxDataAccess = 100; // requests per hour
  private cleanupInterval = 60 * 60 * 1000; // 1 hour

  constructor(prisma: PrismaClient, complianceService: LGPDComplianceService) {
    this.prisma = prisma;
    this.complianceService = complianceService;
    this.metrics = {
      failedLogins: new Map(),
      suspiciousIPs: new Set(),
      dataAccessAttempts: new Map(),
      lastCleanup: new Date()
    };

    // Cleanup metrics periodically
    setInterval(() => this.cleanupMetrics(), this.cleanupInterval);
  }

  /**
   * Rate limiting middleware específico para APIs de dados pessoais
   */
  createPersonalDataRateLimit() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 100, // máximo 100 requests por hora para dados pessoais
      message: {
        error: 'Too many requests to personal data endpoints',
        retryAfter: '1 hour',
        lgpdCompliance: 'Rate limited for data protection'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        return req.user?.id || req.ip;
      },
      handler: async (req: SecurityRequest, res: Response) => {
        // Log potential abuse
        await this.logSecurityEvent({
          action: 'rate_limit_exceeded',
          entityType: 'personal_data_access',
          userId: req.user?.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: {
            endpoint: req.path,
            method: req.method,
            rateLimitType: 'personal_data'
          }
        });

        res.status(429).json({
          error: 'Too many requests to personal data endpoints',
          retryAfter: '1 hour'
        });
      }
    });
  }

  /**
   * Middleware para detecção de anomalias de segurança
   */
  anomalyDetection() {
    return async (req: SecurityRequest, res: Response, next: NextFunction) => {
      try {
        const riskScore = await this.calculateRiskScore(req);
        const anomalies = await this.detectAnomalies(req);

        req.securityContext = {
          riskScore,
          anomaliesDetected: anomalies,
          requiresExtraValidation: riskScore > 70 || anomalies.length > 0
        };

        // Log high-risk requests
        if (riskScore > 50) {
          await this.logSecurityEvent({
            action: 'high_risk_request',
            entityType: 'security_monitoring',
            userId: req.user?.id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            details: {
              riskScore,
              anomalies,
              endpoint: req.path,
              method: req.method
            }
          });
        }

        // Block extremely high-risk requests
        if (riskScore > 90) {
          return res.status(403).json({
            error: 'Request blocked due to security policy',
            reference: 'SEC-' + Date.now()
          });
        }

        next();
      } catch (error) {
        logger.error('Anomaly detection middleware error', { error: error.message });
        next(); // Continue on error to avoid breaking functionality
      }
    };
  }

  /**
   * Middleware para validação de acesso a dados pessoais
   */
  personalDataAccess() {
    return async (req: SecurityRequest, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?.id;
        const ipAddress = req.ip;
        
        if (!userId) {
          return res.status(401).json({ error: 'Authentication required for personal data access' });
        }

        // Check data access limits
        const accessKey = `${userId}:${ipAddress}`;
        const currentAccess = this.metrics.dataAccessAttempts.get(accessKey) || 0;

        if (currentAccess > this.maxDataAccess) {
          await this.triggerSecurityIncident({
            id: `excessive_data_access_${Date.now()}`,
            type: 'unusual_activity',
            severity: IncidentSeverity.HIGH,
            details: {
              userId,
              ipAddress,
              accessAttempts: currentAccess,
              timeWindow: '1 hour'
            },
            affectedDataCategories: ['personal_data'],
            estimatedAffectedSubjects: 1,
            detectionTimestamp: new Date()
          });

          return res.status(429).json({
            error: 'Data access limit exceeded',
            lgpdCompliance: 'Request blocked for data protection'
          });
        }

        // Update access count
        this.metrics.dataAccessAttempts.set(accessKey, currentAccess + 1);

        // Log personal data access
        await this.logSecurityEvent({
          action: 'personal_data_accessed',
          entityType: 'personal_data',
          entityId: req.params.clientId || req.params.id,
          userId,
          ipAddress,
          userAgent: req.get('User-Agent'),
          details: {
            endpoint: req.path,
            method: req.method,
            dataCategory: this.identifyDataCategory(req.path)
          },
          personalDataAccessed: true
        });

        next();
      } catch (error) {
        logger.error('Personal data access middleware error', { error: error.message });
        res.status(500).json({ error: 'Internal security error' });
      }
    };
  }

  /**
   * Middleware para monitoramento de login failures
   */
  loginAttemptMonitor() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const originalSend = res.json.bind(res);
      
      res.json = function(data: any) {
        // Detect failed login attempt
        if (res.statusCode === 401 || (data && data.error && data.error.includes('login'))) {
          const email = req.body.email || 'unknown';
          const currentFailures = this.metrics.failedLogins.get(email) || 0;
          this.metrics.failedLogins.set(email, currentFailures + 1);

          // Block after max attempts
          if (currentFailures >= this.maxFailedLogins) {
            this.metrics.suspiciousIPs.add(req.ip);
            
            this.triggerSecurityIncident({
              id: `brute_force_${Date.now()}`,
              type: 'unauthorized_access',
              severity: IncidentSeverity.MEDIUM,
              details: {
                email,
                ipAddress: req.ip,
                failedAttempts: currentFailures + 1,
                userAgent: req.get('User-Agent')
              },
              affectedDataCategories: ['authentication'],
              estimatedAffectedSubjects: 1,
              detectionTimestamp: new Date()
            });
          }
        }

        return originalSend(data);
      }.bind(this);

      next();
    };
  }

  /**
   * Calcula score de risco da requisição
   */
  private async calculateRiskScore(req: SecurityRequest): Promise<number> {
    let score = 0;

    // IP suspeito
    if (this.metrics.suspiciousIPs.has(req.ip)) {
      score += 30;
    }

    // Múltiplas tentativas de acesso falhadas
    const failedAttempts = this.metrics.failedLogins.get(req.user?.email || req.ip) || 0;
    score += Math.min(failedAttempts * 10, 40);

    // Horário suspeito (fora do horário comercial)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      score += 15;
    }

    // User agent suspeito
    const userAgent = req.get('User-Agent') || '';
    if (!userAgent || userAgent.includes('bot') || userAgent.includes('curl')) {
      score += 25;
    }

    // Geolocalização suspeita (implementar com GeoIP service)
    // score += await this.checkGeolocation(req.ip);

    // Alto volume de requests
    const accessKey = `${req.user?.id || req.ip}`;
    const accessCount = this.metrics.dataAccessAttempts.get(accessKey) || 0;
    if (accessCount > 50) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  /**
   * Detecta anomalias específicas
   */
  private async detectAnomalies(req: SecurityRequest): Promise<string[]> {
    const anomalies: string[] = [];

    // Padrões de SQL injection
    const sqlPatterns = /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bDROP\b)/i;
    const queryString = JSON.stringify(req.query) + JSON.stringify(req.body);
    if (sqlPatterns.test(queryString)) {
      anomalies.push('sql_injection_attempt');
    }

    // Tentativas de path traversal
    if (req.path.includes('../') || req.path.includes('..\\')) {
      anomalies.push('path_traversal_attempt');
    }

    // Headers suspeitos
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip'];
    for (const header of suspiciousHeaders) {
      if (req.get(header) && req.get(header) !== req.ip) {
        anomalies.push('header_manipulation');
        break;
      }
    }

    // Acesso a endpoints sensíveis sem autenticação
    const sensitiveEndpoints = ['/api/clients/', '/api/forms/', '/api/sops/'];
    if (sensitiveEndpoints.some(endpoint => req.path.includes(endpoint)) && !req.user) {
      anomalies.push('unauthorized_sensitive_access');
    }

    return anomalies;
  }

  /**
   * Identifica categoria de dados baseada no endpoint
   */
  private identifyDataCategory(path: string): string {
    if (path.includes('/clients')) return 'client_data';
    if (path.includes('/forms')) return 'form_responses';
    if (path.includes('/sops')) return 'generated_documents';
    if (path.includes('/proposals')) return 'commercial_data';
    return 'unknown';
  }

  /**
   * Dispara incidente de segurança
   */
  private async triggerSecurityIncident(anomaly: SecurityAnomaly): Promise<void> {
    try {
      await this.complianceService.detectSecurityIncident(anomaly);
      
      logger.warn('Security incident triggered', {
        incidentId: anomaly.id,
        type: anomaly.type,
        severity: anomaly.severity
      });
    } catch (error) {
      logger.error('Failed to trigger security incident', {
        error: error.message,
        anomaly
      });
    }
  }

  /**
   * Log eventos de segurança
   */
  private async logSecurityEvent(eventData: {
    action: string;
    entityType: string;
    entityId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    details: Record<string, any>;
    personalDataAccessed?: boolean;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: eventData.action,
          entityType: eventData.entityType,
          entityId: eventData.entityId,
          userId: eventData.userId,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
          details: eventData.details,
          sensitiveDataAccessed: eventData.personalDataAccessed || false
        }
      });
    } catch (error) {
      logger.error('Failed to log security event', {
        error: error.message,
        eventData
      });
    }
  }

  /**
   * Limpa métricas antigas
   */
  private cleanupMetrics(): void {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Limpar contadores de login failures (reset a cada hora)
    this.metrics.failedLogins.clear();
    
    // Limpar contadores de acesso a dados
    this.metrics.dataAccessAttempts.clear();

    // Manter IPs suspeitos por mais tempo (24h)
    if (now.getTime() - this.metrics.lastCleanup.getTime() > 24 * 60 * 60 * 1000) {
      this.metrics.suspiciousIPs.clear();
      this.metrics.lastCleanup = now;
    }

    logger.info('Security metrics cleaned', {
      cleanupTime: now,
      suspiciousIPs: this.metrics.suspiciousIPs.size
    });
  }

  /**
   * Middleware para Content Security Policy
   */
  contentSecurityPolicy() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.tally.so",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; '));

      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

      next();
    };
  }

  /**
   * Validação de CSRF token para formulários
   */
  csrfProtection() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const token = req.headers['x-csrf-token'] || req.body._csrf;
        
        if (!token) {
          return res.status(403).json({
            error: 'CSRF token required',
            lgpdCompliance: 'Security validation failed'
          });
        }

        // Validar token (implementar validação real)
        // Por ora, aceitar qualquer token não-vazio
        if (typeof token !== 'string' || token.length < 10) {
          return res.status(403).json({
            error: 'Invalid CSRF token',
            lgpdCompliance: 'Security validation failed'
          });
        }
      }

      next();
    };
  }
}

export default SecurityMiddleware;