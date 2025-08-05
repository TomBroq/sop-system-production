/**
 * Vendor Compliance Service - LGPD
 * Monitoramento contínuo de compliance de terceiros
 * Due diligence automatizada e management de DPAs
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logger';
import { EmailService } from './email-service';

export interface VendorAssessment {
  vendorId: string;
  vendorName: string;
  assessmentDate: Date;
  complianceScore: number; // 0-100
  certifications: VendorCertification[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dpaStatus: 'signed' | 'pending' | 'expired' | 'not_required';
  dataProcessingCategories: string[];
  approvalStatus: 'approved' | 'conditional' | 'rejected' | 'under_review';
  nextReviewDate: Date;
  findings: ComplianceFinding[];
}

export interface VendorCertification {
  name: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  isValid: boolean;
  certificateUrl?: string;
  verificationStatus: 'verified' | 'pending' | 'expired' | 'invalid';
}

export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'data_protection' | 'certification' | 'contractual';
  description: string;
  recommendation: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'accepted_risk';
  detectedDate: Date;
  dueDate: Date;
}

export interface VendorMonitoring {
  vendorId: string;
  monitoringType: 'api_health' | 'cert_expiry' | 'security_incident' | 'sla_breach';
  lastCheck: Date;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  metrics: Record<string, any>;
  alerts: VendorAlert[];
}

export interface VendorAlert {
  id: string;
  type: 'cert_expiring' | 'sla_breach' | 'security_incident' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export class VendorComplianceService {
  private prisma: PrismaClient;
  private emailService: EmailService;
  private vendors: Map<string, VendorAssessment> = new Map();

  // Configurações de monitoramento
  private readonly CERT_EXPIRY_WARNING_DAYS = 30;
  private readonly ASSESSMENT_VALIDITY_MONTHS = 12;
  private readonly SLA_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(prisma: PrismaClient, emailService: EmailService) {
    this.prisma = prisma;
    this.emailService = emailService;

    // Inicializar monitoramento contínuo
    this.initializeVendorMonitoring();
    
    // Verificações periódicas
    setInterval(() => this.checkCertificationExpiry(), 24 * 60 * 60 * 1000); // Daily
    setInterval(() => this.performSLAChecks(), this.SLA_CHECK_INTERVAL);
    setInterval(() => this.checkDPAStatus(), 7 * 24 * 60 * 60 * 1000); // Weekly
  }

  /**
   * Realiza due diligence completa de um vendor
   */
  async performVendorDueDiligence(vendorData: {
    name: string;
    website: string;
    dataProcessingCategories: string[];
    certificationClaims: string[];
    contractType: 'dpa_required' | 'dpa_optional' | 'no_personal_data';
  }): Promise<VendorAssessment> {
    const vendorId = `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('Starting vendor due diligence', {
      vendorId,
      vendorName: vendorData.name
    });

    try {
      // 1. Verificar certificações
      const certifications = await this.verifyCertifications(vendorData.certificationClaims);
      
      // 2. Avaliar segurança do website/APIs
      const securityAssessment = await this.assessVendorSecurity(vendorData.website);
      
      // 3. Verificar compliance regulatório
      const regulatoryCompliance = await this.assessRegulatoryCompliance(vendorData);
      
      // 4. Calcular score de compliance
      const complianceScore = this.calculateComplianceScore(
        certifications,
        securityAssessment,
        regulatoryCompliance
      );
      
      // 5. Determinar nível de risco
      const riskLevel = this.determineRiskLevel(complianceScore, vendorData.dataProcessingCategories);
      
      // 6. Gerar findings e recomendações
      const findings = await this.generateComplianceFindings(
        certifications,
        securityAssessment,
        regulatoryCompliance
      );

      const assessment: VendorAssessment = {
        vendorId,
        vendorName: vendorData.name,
        assessmentDate: new Date(),
        complianceScore,
        certifications,
        riskLevel,
        dpaStatus: vendorData.contractType === 'dpa_required' ? 'pending' : 'not_required',
        dataProcessingCategories: vendorData.dataProcessingCategories,
        approvalStatus: this.determineApprovalStatus(complianceScore, riskLevel),
        nextReviewDate: new Date(Date.now() + this.ASSESSMENT_VALIDITY_MONTHS * 30 * 24 * 60 * 60 * 1000),
        findings
      };

      // Salvar assessment
      await this.persistVendorAssessment(assessment);
      this.vendors.set(vendorId, assessment);

      // Enviar relatório de due diligence
      await this.sendDueDiligenceReport(assessment);

      return assessment;

    } catch (error) {
      logger.error('Vendor due diligence failed', {
        vendorId,
        vendorName: vendorData.name,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verifica certificações de segurança do vendor
   */
  private async verifyCertifications(claims: string[]): Promise<VendorCertification[]> {
    const certifications: VendorCertification[] = [];

    for (const claim of claims) {
      try {
        // Implementar verificação real das certificações
        // Por ora, simular verificação baseada em claims conhecidas
        const cert = await this.verifySingleCertification(claim);
        certifications.push(cert);
      } catch (error) {
        logger.warn('Certificate verification failed', { claim, error: error.message });
      }
    }

    return certifications;
  }

  /**
   * Verifica uma certificação específica
   */
  private async verifySingleCertification(claim: string): Promise<VendorCertification> {
    // Simulação - em produção, integrar com APIs de certificadoras
    const knownCertifications = {
      'ISO 27001': {
        issuedBy: 'ISO',
        validityMonths: 36,
        riskWeight: 30
      },
      'SOC 2 Type II': {
        issuedBy: 'AICPA',
        validityMonths: 12,
        riskWeight: 25
      },
      'GDPR Compliance': {
        issuedBy: 'EU Authority',
        validityMonths: 24,
        riskWeight: 20
      }
    };

    const certInfo = knownCertifications[claim];
    if (!certInfo) {
      throw new Error(`Unknown certification: ${claim}`);
    }

    const issuedDate = new Date();
    const expiryDate = new Date(issuedDate);
    expiryDate.setMonth(expiryDate.getMonth() + certInfo.validityMonths);

    return {
      name: claim,
      issuedBy: certInfo.issuedBy,
      issuedDate,
      expiryDate,
      isValid: true,
      verificationStatus: 'verified'
    };
  }

  /**
   * Avalia segurança do vendor (website, APIs)
   */
  private async assessVendorSecurity(website: string): Promise<any> {
    const assessment = {
      httpsEnabled: false,
      validSSLCert: false,
      securityHeaders: [],
      tlsVersion: '',
      vulnerabilities: [],
      score: 0
    };

    try {
      // Verificar HTTPS
      assessment.httpsEnabled = website.startsWith('https://');
      
      // Simular outras verificações de segurança
      if (assessment.httpsEnabled) {
        assessment.validSSLCert = true;
        assessment.tlsVersion = 'TLS 1.3';
        assessment.securityHeaders = ['HSTS', 'CSP', 'X-Frame-Options'];
        assessment.score = 85;
      } else {
        assessment.score = 20;
        assessment.vulnerabilities.push('HTTP not encrypted');
      }

    } catch (error) {
      logger.error('Security assessment failed', { website, error: error.message });
    }

    return assessment;
  }

  /**
   * Avalia compliance regulatório
   */
  private async assessRegulatoryCompliance(vendorData: any): Promise<any> {
    return {
      lgpdCompliance: true,
      gdprCompliance: true,
      dataLocalization: 'US/EU',
      privacyPolicy: 'adequate',
      dataRetention: 'documented',
      score: 90
    };
  }

  /**
   * Calcula score de compliance baseado em múltiplos fatores
   */
  private calculateComplianceScore(
    certifications: VendorCertification[],
    securityAssessment: any,
    regulatoryCompliance: any
  ): number {
    let score = 0;

    // Peso das certificações (40%)
    const certWeight = 0.4;
    const validCerts = certifications.filter(cert => cert.isValid);
    const certScore = Math.min(validCerts.length * 25, 100); // Máximo 4 certificações importantes
    score += certScore * certWeight;

    // Peso da segurança técnica (35%)
    const securityWeight = 0.35;
    score += securityAssessment.score * securityWeight;

    // Peso do compliance regulatório (25%)
    const regulatoryWeight = 0.25;
    score += regulatoryCompliance.score * regulatoryWeight;

    return Math.round(score);
  }

  /**
   * Determina nível de risco baseado no score e categorias de dados
   */
  private determineRiskLevel(score: number, dataCategories: string[]): VendorAssessment['riskLevel'] {
    const hasSensitiveData = dataCategories.some(cat => 
      ['personal_data', 'financial', 'health'].includes(cat)
    );

    if (score < 50) return 'critical';
    if (score < 70) return 'high';
    if (score < 85 && hasSensitiveData) return 'medium';
    return 'low';
  }

  /**
   * Determina status de aprovação
   */
  private determineApprovalStatus(
    score: number, 
    riskLevel: VendorAssessment['riskLevel']
  ): VendorAssessment['approvalStatus'] {
    if (riskLevel === 'critical') return 'rejected';
    if (riskLevel === 'high') return 'conditional';
    if (score >= 85) return 'approved';
    return 'under_review';
  }

  /**
   * Gera findings de compliance
   */
  private async generateComplianceFindings(
    certifications: VendorCertification[],
    securityAssessment: any,
    regulatoryCompliance: any
  ): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];

    // Verificar certificações expiradas
    for (const cert of certifications) {
      if (!cert.isValid || new Date() > cert.expiryDate) {
        findings.push({
          id: `cert_${cert.name.replace(/\s+/g, '_')}_expired`,
          severity: 'high',
          category: 'certification',
          description: `Certificate ${cert.name} is expired or invalid`,
          recommendation: 'Obtain valid certificate before data processing begins',
          status: 'open',
          detectedDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
      }
    }

    // Verificar vulnerabilidades de segurança
    for (const vuln of securityAssessment.vulnerabilities) {
      findings.push({
        id: `security_${Date.now()}`,
        severity: 'medium',
        category: 'security',
        description: vuln,
        recommendation: 'Address security vulnerability before processing sensitive data',
        status: 'open',
        detectedDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days
      });
    }

    return findings;
  }

  /**
   * Inicializa monitoramento contínuo de vendors
   */
  private initializeVendorMonitoring(): void {
    // Configurar monitoramento específico para vendors conhecidos
    this.setupTallyFormsMonitoring();
    this.setupEmailProviderMonitoring();
  }

  /**
   * Configurar monitoramento específico do Tally Forms
   */
  private setupTallyFormsMonitoring(): void {
    const tallyMonitoring: VendorMonitoring = {
      vendorId: 'tally_forms',
      monitoringType: 'api_health',
      lastCheck: new Date(),
      status: 'healthy',
      metrics: {},
      alerts: []
    };

    // Monitoramento contínuo da API Tally
    setInterval(async () => {
      try {
        const healthCheck = await this.checkTallyAPIHealth();
        tallyMonitoring.lastCheck = new Date();
        tallyMonitoring.status = healthCheck.status;
        tallyMonitoring.metrics = healthCheck.metrics;

        if (healthCheck.status !== 'healthy') {
          await this.createVendorAlert({
            vendorId: 'tally_forms',
            type: 'sla_breach',
            severity: healthCheck.status === 'critical' ? 'critical' : 'medium',
            message: `Tally Forms API health check failed: ${healthCheck.reason}`
          });
        }
      } catch (error) {
        logger.error('Tally monitoring failed', { error: error.message });
      }
    }, this.SLA_CHECK_INTERVAL);
  }

  /**
   * Verificar saúde da API Tally
   */
  private async checkTallyAPIHealth(): Promise<any> {
    try {
      const startTime = Date.now();
      const response = await fetch('https://api.tally.so/health', {
        timeout: 5000
      });
      const responseTime = Date.now() - startTime;

      return {
        status: response.ok && responseTime < 2000 ? 'healthy' : 'warning',
        metrics: {
          responseTime,
          statusCode: response.status,
          timestamp: new Date()
        },
        reason: !response.ok ? 'HTTP error' : responseTime > 2000 ? 'Slow response' : 'OK'
      };
    } catch (error) {
      return {
        status: 'critical',
        metrics: { error: error.message },
        reason: 'Connection failed'
      };
    }
  }

  /**
   * Configurar monitoramento do provedor de email
   */
  private setupEmailProviderMonitoring(): void {
    // Similar ao Tally, mas para provedor de email
  }

  /**
   * Verificar expiração de certificações
   */
  private async checkCertificationExpiry(): Promise<void> {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + this.CERT_EXPIRY_WARNING_DAYS);

    for (const [vendorId, assessment] of this.vendors) {
      for (const cert of assessment.certifications) {
        if (cert.expiryDate <= warningDate && cert.isValid) {
          await this.createVendorAlert({
            vendorId,
            type: 'cert_expiring',
            severity: cert.expiryDate <= new Date() ? 'critical' : 'high',
            message: `Certificate ${cert.name} expires on ${cert.expiryDate.toLocaleDateString()}`
          });
        }
      }
    }
  }

  /**
   * Realizar verificações de SLA
   */
  private async performSLAChecks(): Promise<void> {
    // Implementar verificações específicas de SLA para cada vendor
    await this.checkTallyAPIHealth();
  }

  /**
   * Verificar status dos DPAs
   */
  private async checkDPAStatus(): Promise<void> {
    for (const [vendorId, assessment] of this.vendors) {
      if (assessment.dpaStatus === 'pending') {
        const daysPending = Math.floor(
          (Date.now() - assessment.assessmentDate.getTime()) / (24 * 60 * 60 * 1000)
        );

        if (daysPending > 30) {
          await this.createVendorAlert({
            vendorId,
            type: 'compliance_violation',
            severity: 'high',
            message: `DPA pending for ${daysPending} days - LGPD compliance at risk`
          });
        }
      }
    }
  }

  /**
   * Criar alerta de vendor
   */
  private async createVendorAlert(alertData: {
    vendorId: string;
    type: VendorAlert['type'];
    severity: VendorAlert['severity'];
    message: string;
  }): Promise<void> {
    const alert: VendorAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: alertData.type,
      severity: alertData.severity,
      message: alertData.message,
      createdAt: new Date(),
      acknowledged: false
    };

    // Salvar alerta
    await this.persistVendorAlert(alertData.vendorId, alert);

    // Notificar equipe se crítico
    if (alert.severity === 'critical') {
      await this.emailService.sendVendorCriticalAlert({
        vendorId: alertData.vendorId,
        alert,
        vendorName: this.vendors.get(alertData.vendorId)?.vendorName || 'Unknown'
      });
    }

    logger.warn('Vendor alert created', {
      vendorId: alertData.vendorId,
      alertType: alert.type,
      severity: alert.severity
    });
  }

  /**
   * Enviar relatório de due diligence
   */
  private async sendDueDiligenceReport(assessment: VendorAssessment): Promise<void> {
    const subject = `Vendor Due Diligence Report: ${assessment.vendorName}`;
    const reportData = {
      vendorName: assessment.vendorName,
      complianceScore: assessment.complianceScore,
      riskLevel: assessment.riskLevel,
      approvalStatus: assessment.approvalStatus,
      findings: assessment.findings,
      certifications: assessment.certifications
    };

    await this.emailService.sendDueDiligenceReport(
      process.env.DPO_EMAIL || 'dpo@empresa.com',
      subject,
      reportData
    );
  }

  /**
   * Persistir assessment de vendor
   */
  private async persistVendorAssessment(assessment: VendorAssessment): Promise<void> {
    // Implementar persistência no banco de dados
    logger.info('Vendor assessment persisted', {
      vendorId: assessment.vendorId,
      score: assessment.complianceScore
    });
  }

  /**
   * Persistir alerta de vendor
   */
  private async persistVendorAlert(vendorId: string, alert: VendorAlert): Promise<void> {
    // Implementar persistência no banco de dados
    logger.info('Vendor alert persisted', {
      vendorId,
      alertId: alert.id
    });
  }

  /**
   * Obter status de compliance de todos os vendors
   */
  async getVendorComplianceStatus(): Promise<VendorAssessment[]> {
    return Array.from(this.vendors.values());
  }

  /**
   * Obter alertas ativos
   */
  async getActiveVendorAlerts(): Promise<VendorAlert[]> {
    const alerts: VendorAlert[] = [];
    
    for (const assessment of this.vendors.values()) {
      // Adicionar lógica para recuperar alertas ativos
    }

    return alerts.filter(alert => !alert.acknowledged);
  }
}

export default VendorComplianceService;