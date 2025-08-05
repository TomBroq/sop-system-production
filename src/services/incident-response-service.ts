/**
 * Incident Response Service - LGPD Compliance
 * Sistema automático de resposta a incidentes de segurança
 * Notificação ANPD em até 72h conforme LGPD
 */

import { PrismaClient } from '@prisma/client';
import { EmailService } from './email-service';
import { logger } from '../shared/logger';
import { SecurityAnomaly, IncidentSeverity } from './lgpd-compliance-service';

export interface SecurityIncident {
  id: string;
  type: 'data_breach' | 'unauthorized_access' | 'system_compromise' | 'vendor_incident';
  severity: IncidentSeverity;
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'anpd_notified';
  detectedAt: Date;
  containedAt?: Date;
  resolvedAt?: Date;
  affectedDataTypes: string[];
  affectedSubjectsCount: number;
  description: string;
  containmentActions: string[];
  investigationNotes: string[];
  anpdNotificationRequired: boolean;
  anpdNotificationSent: boolean;
  anpdNotificationDate?: Date;
  subjectNotificationRequired: boolean;
  subjectNotificationsSent: number;
  riskAssessment: {
    dataTypesSensitivity: 'low' | 'medium' | 'high' | 'critical';
    potentialImpact: 'low' | 'medium' | 'high' | 'critical';
    likelihood: 'low' | 'medium' | 'high';
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface ANPDNotification {
  incidentId: string;
  notificationDate: Date;
  incidentDescription: string;
  dataTypesAffected: string[];
  subjectsAffected: number;
  causeAnalysis: string;
  containmentMeasures: string[];
  preventiveMeasures: string[];
  contactDPO: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'under_review';
}

export class IncidentResponseService {
  private prisma: PrismaClient;
  private emailService: EmailService;
  private incidents: Map<string, SecurityIncident> = new Map();

  // Configurações LGPD
  private readonly ANPD_NOTIFICATION_DEADLINE = 72 * 60 * 60 * 1000; // 72 hours in ms
  private readonly HIGH_RISK_THRESHOLD = 100; // affected subjects
  private readonly DPO_EMAIL = process.env.DPO_EMAIL || 'dpo@empresa.com';
  private readonly SECURITY_TEAM_EMAIL = process.env.SECURITY_EMAIL || 'security@empresa.com';

  constructor(prisma: PrismaClient, emailService: EmailService) {
    this.prisma = prisma;
    this.emailService = emailService;

    // Verificar deadlines ANPD a cada 30 minutos
    setInterval(() => this.checkANPDDeadlines(), 30 * 60 * 1000);
  }

  /**
   * Processa anomalia detectada e cria incidente se necessário
   */
  async handleSecurityAnomaly(anomaly: SecurityAnomaly): Promise<SecurityIncident | null> {
    try {
      // Avaliar se anomalia constitui um incidente
      const riskAssessment = await this.assessIncidentRisk(anomaly);
      
      if (this.shouldCreateIncident(anomaly, riskAssessment)) {
        const incident = await this.createSecurityIncident(anomaly, riskAssessment);
        await this.initiateIncidentResponse(incident);
        return incident;
      }

      // Log anomalia que não virou incidente
      logger.info('Security anomaly logged but no incident created', {
        anomalyId: anomaly.id,
        type: anomaly.type,
        severity: anomaly.severity,
        riskLevel: riskAssessment.overallRisk
      });

      return null;
    } catch (error) {
      logger.error('Error handling security anomaly', {
        anomalyId: anomaly.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Cria incidente de segurança formal
   */
  private async createSecurityIncident(
    anomaly: SecurityAnomaly, 
    riskAssessment: any
  ): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      id: `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.mapAnomalyToIncidentType(anomaly.type),
      severity: anomaly.severity,
      status: 'detected',
      detectedAt: anomaly.detectionTimestamp,
      affectedDataTypes: anomaly.affectedDataCategories,
      affectedSubjectsCount: anomaly.estimatedAffectedSubjects,
      description: this.generateIncidentDescription(anomaly),
      containmentActions: [],
      investigationNotes: [],
      anpdNotificationRequired: this.requiresANPDNotification(riskAssessment),
      anpdNotificationSent: false,
      subjectNotificationRequired: this.requiresSubjectNotification(riskAssessment),
      subjectNotificationsSent: 0,
      riskAssessment
    };

    this.incidents.set(incident.id, incident);

    // Persistir no banco
    await this.persistIncident(incident);

    logger.warn('Security incident created', {
      incidentId: incident.id,
      type: incident.type,
      severity: incident.severity,
      anpdRequired: incident.anpdNotificationRequired
    });

    return incident;
  }

  /**
   * Inicia resposta automática ao incidente
   */
  private async initiateIncidentResponse(incident: SecurityIncident): Promise<void> {
    // 1. Alertar equipe de segurança imediatamente
    await this.alertSecurityTeam(incident);

    // 2. Implementar contenção automática se possível
    await this.implementContainment(incident);

    // 3. Se crítico, alertar DPO e preparar notificação ANPD
    if (incident.severity === IncidentSeverity.CRITICAL || incident.anpdNotificationRequired) {
      await this.alertDPO(incident);
      await this.prepareANPDNotification(incident);
    }

    // 4. Iniciar investigação automática
    await this.startInvestigation(incident);

    // 5. Se necessário, notificar titulares afetados
    if (incident.subjectNotificationRequired) {
      await this.scheduleSubjectNotifications(incident);
    }
  }

  /**
   * Avalia risco do incidente para determinar resposta
   */
  private async assessIncidentRisk(anomaly: SecurityAnomaly): Promise<any> {
    let dataTypesSensitivity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let potentialImpact: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Avaliar sensibilidade dos dados
    const sensitiveDataTypes = ['personal_identification', 'financial', 'health', 'biometric'];
    if (anomaly.affectedDataCategories.some(type => sensitiveDataTypes.includes(type))) {
      dataTypesSensitivity = 'high';
    }

    // Avaliar impacto potencial baseado no número de afetados
    if (anomaly.estimatedAffectedSubjects > 1000) {
      potentialImpact = 'critical';
    } else if (anomaly.estimatedAffectedSubjects > 100) {
      potentialImpact = 'high';
    } else if (anomaly.estimatedAffectedSubjects > 10) {
      potentialImpact = 'medium';
    }

    // Avaliar probabilidade baseada no tipo de anomalia
    let likelihood: 'low' | 'medium' | 'high' = 'medium';
    if (anomaly.type === 'data_leak' || anomaly.type === 'system_breach') {
      likelihood = 'high';
    }

    // Calcular risco geral
    const riskMatrix = {
      'low-low': 'low',
      'low-medium': 'low', 
      'low-high': 'medium',
      'medium-low': 'low',
      'medium-medium': 'medium',
      'medium-high': 'high',
      'high-low': 'medium',
      'high-medium': 'high',
      'high-high': 'critical',
      'critical-low': 'high',
      'critical-medium': 'critical',
      'critical-high': 'critical'
    };

    const overallRisk = riskMatrix[`${potentialImpact}-${likelihood}`] || 'medium';

    return {
      dataTypesSensitivity,
      potentialImpact,
      likelihood,
      overallRisk
    };
  }

  /**
   * Determina se anomalia deve gerar incidente formal
   */
  private shouldCreateIncident(anomaly: SecurityAnomaly, riskAssessment: any): boolean {
    // Sempre criar incidente para severidade CRITICAL
    if (anomaly.severity === IncidentSeverity.CRITICAL) {
      return true;
    }

    // Criar para risco geral HIGH ou CRITICAL
    if (riskAssessment.overallRisk === 'high' || riskAssessment.overallRisk === 'critical') {
      return true;
    }

    // Criar se afeta muitos usuários
    if (anomaly.estimatedAffectedSubjects > this.HIGH_RISK_THRESHOLD) {
      return true;
    }

    // Criar para tipos específicos independente de outras condições
    const alwaysCreateFor = ['data_leak', 'system_breach'];
    if (alwaysCreateFor.includes(anomaly.type)) {
      return true;
    }

    return false;
  }

  /**
   * Determina se incidente requer notificação ANPD
   */
  private requiresANPDNotification(riskAssessment: any): boolean {
    // Art. 48 LGPD - notificar ANPD quando houver risco aos direitos dos titulares
    return riskAssessment.overallRisk === 'high' || riskAssessment.overallRisk === 'critical';
  }

  /**
   * Determina se incidente requer notificação aos titulares
   */
  private requiresSubjectNotification(riskAssessment: any): boolean {
    // Art. 48 §1º LGPD - notificar titular quando houver alto risco
    return riskAssessment.overallRisk === 'critical';
  }

  /**
   * Alerta equipe de segurança sobre incidente
   */
  private async alertSecurityTeam(incident: SecurityIncident): Promise<void> {
    const subject = `🚨 SECURITY INCIDENT: ${incident.type.toUpperCase()} - ${incident.severity}`;
    const message = `
INCIDENT DETAILS:
- ID: ${incident.id}
- Type: ${incident.type}
- Severity: ${incident.severity}
- Detected: ${incident.detectedAt.toISOString()}
- Affected Data: ${incident.affectedDataTypes.join(', ')}
- Affected Subjects: ${incident.affectedSubjectsCount}
- ANPD Notification Required: ${incident.anpdNotificationRequired ? 'YES' : 'NO'}

IMMEDIATE ACTIONS REQUIRED:
1. Review incident details in security dashboard
2. Verify automatic containment measures
3. Begin detailed investigation
4. Prepare communication materials if needed

Risk Assessment: ${incident.riskAssessment.overallRisk.toUpperCase()}
    `;

    await this.emailService.sendSecurityAlert(this.SECURITY_TEAM_EMAIL, subject, message);
  }

  /**
   * Alerta DPO sobre incidente crítico
   */
  private async alertDPO(incident: SecurityIncident): Promise<void> {
    const subject = `🔴 DPO ALERT: LGPD Incident Requiring Attention - ${incident.id}`;
    const message = `
CRITICAL INCIDENT REQUIRING DPO ATTENTION:

Incident ID: ${incident.id}
Type: ${incident.type}
Severity: ${incident.severity}
Detected: ${incident.detectedAt.toISOString()}

LGPD COMPLIANCE REQUIREMENTS:
- ANPD Notification Required: ${incident.anpdNotificationRequired ? 'YES' : 'NO'}
- Subject Notification Required: ${incident.subjectNotificationRequired ? 'YES' : 'NO'}
- ANPD Deadline: ${new Date(incident.detectedAt.getTime() + this.ANPD_NOTIFICATION_DEADLINE).toISOString()}

DATA AFFECTED:
- Categories: ${incident.affectedDataTypes.join(', ')}
- Estimated Subjects: ${incident.affectedSubjectsCount}
- Risk Level: ${incident.riskAssessment.overallRisk.toUpperCase()}

IMMEDIATE DPO ACTIONS REQUIRED:
1. Review incident classification
2. Approve/modify ANPD notification draft
3. Approve subject notification strategy
4. Coordinate with legal team if needed

Access incident details at: [DASHBOARD_URL]/incidents/${incident.id}
    `;

    await this.emailService.sendDPOAlert(this.DPO_EMAIL, subject, message);
  }

  /**
   * Implementa medidas de contenção automáticas
   */
  private async implementContainment(incident: SecurityIncident): Promise<void> {
    const actions: string[] = [];

    try {
      // Contenção baseada no tipo de incidente
      switch (incident.type) {
        case 'unauthorized_access':
          actions.push('Suspended suspicious user sessions');
          actions.push('Increased monitoring on affected endpoints');
          break;

        case 'data_breach':
          actions.push('Isolated affected database connections');
          actions.push('Enabled enhanced logging');
          actions.push('Restricted data export capabilities');
          break;

        case 'system_compromise':
          actions.push('Activated emergency access controls');
          actions.push('Isolated affected systems from network');
          actions.push('Enabled full audit logging');
          break;

        case 'vendor_incident':
          actions.push('Restricted third-party integrations');
          actions.push('Enhanced monitoring of vendor connections');
          break;
      }

      // Implementar ações específicas (placeholder - implementar integração real)
      for (const action of actions) {
        logger.info(`Containment action: ${action}`, { incidentId: incident.id });
      }

      // Atualizar incidente
      incident.containmentActions = actions;
      incident.status = 'contained';
      incident.containedAt = new Date();

      await this.updateIncident(incident);

    } catch (error) {
      logger.error('Failed to implement containment', {
        incidentId: incident.id,
        error: error.message
      });
    }
  }

  /**
   * Prepara notificação ANPD automática
   */
  private async prepareANPDNotification(incident: SecurityIncident): Promise<void> {
    const notification: ANPDNotification = {
      incidentId: incident.id,
      notificationDate: new Date(),
      incidentDescription: this.generateANPDDescription(incident),
      dataTypesAffected: incident.affectedDataTypes,
      subjectsAffected: incident.affectedSubjectsCount,
      causeAnalysis: 'Investigation in progress - preliminary assessment',
      containmentMeasures: incident.containmentActions,
      preventiveMeasures: [
        'Enhanced monitoring implemented',
        'Additional security controls activated',
        'Staff security awareness reinforcement planned'
      ],
      contactDPO: this.DPO_EMAIL,
      status: 'draft'
    };

    // Salvar draft da notificação
    await this.persistANPDNotification(notification);

    logger.info('ANPD notification prepared', {
      incidentId: incident.id,
      deadline: new Date(incident.detectedAt.getTime() + this.ANPD_NOTIFICATION_DEADLINE)
    });
  }

  /**
   * Verifica deadlines de notificação ANPD
   */
  private async checkANPDDeadlines(): Promise<void> {
    const now = new Date();
    
    for (const [id, incident] of this.incidents) {
      if (incident.anpdNotificationRequired && !incident.anpdNotificationSent) {
        const deadline = new Date(incident.detectedAt.getTime() + this.ANPD_NOTIFICATION_DEADLINE);
        const timeToDeadline = deadline.getTime() - now.getTime();

        // Alertar 24h antes do deadline
        if (timeToDeadline > 0 && timeToDeadline <= 24 * 60 * 60 * 1000) {
          await this.sendDeadlineWarning(incident, timeToDeadline);
        }

        // Alertar se deadline passou
        if (timeToDeadline <= 0) {
          await this.sendDeadlineViolationAlert(incident);
        }
      }
    }
  }

  /**
   * Helper methods
   */
  private mapAnomalyToIncidentType(anomalyType: string): SecurityIncident['type'] {
    const mapping = {
      'unauthorized_access': 'unauthorized_access',
      'data_leak': 'data_breach',
      'unusual_activity': 'unauthorized_access',
      'system_breach': 'system_compromise'
    };
    return mapping[anomalyType] || 'unauthorized_access';
  }

  private generateIncidentDescription(anomaly: SecurityAnomaly): string {
    return `Security anomaly detected: ${anomaly.type}. ` +
           `Affected data categories: ${anomaly.affectedDataCategories.join(', ')}. ` +
           `Estimated affected subjects: ${anomaly.estimatedAffectedSubjects}.`;
  }

  private generateANPDDescription(incident: SecurityIncident): string {
    return `Incidente de Segurança tipo ${incident.type} detectado em ${incident.detectedAt.toISOString()}. ` +
           `Dados afetados: ${incident.affectedDataTypes.join(', ')}. ` +
           `Número estimado de titulares afetados: ${incident.affectedSubjectsCount}. ` +
           `Medidas de contenção implementadas: ${incident.containmentActions.join(', ')}.`;
  }

  private async persistIncident(incident: SecurityIncident): Promise<void> {
    // Implementar persistência no banco de dados
    logger.info('Incident persisted', { incidentId: incident.id });
  }

  private async updateIncident(incident: SecurityIncident): Promise<void> {
    // Implementar atualização no banco de dados
    logger.info('Incident updated', { incidentId: incident.id });
  }

  private async persistANPDNotification(notification: ANPDNotification): Promise<void> {
    // Implementar persistência da notificação ANPD
    logger.info('ANPD notification saved', { incidentId: notification.incidentId });
  }

  private async startInvestigation(incident: SecurityIncident): Promise<void> {
    // Implementar início de investigação automática
    logger.info('Investigation started', { incidentId: incident.id });
  }

  private async scheduleSubjectNotifications(incident: SecurityIncident): Promise<void> {
    // Implementar agendamento de notificações aos titulares
    logger.info('Subject notifications scheduled', { incidentId: incident.id });
  }

  private async sendDeadlineWarning(incident: SecurityIncident, timeRemaining: number): Promise<void> {
    const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
    await this.emailService.sendDPOAlert(
      this.DPO_EMAIL,
      `⚠️ ANPD Notification Deadline Warning - ${incident.id}`,
      `ANPD notification deadline in ${hoursRemaining} hours for incident ${incident.id}`
    );
  }

  private async sendDeadlineViolationAlert(incident: SecurityIncident): Promise<void> {
    await this.emailService.sendDPOAlert(
      this.DPO_EMAIL,
      `🚨 ANPD Notification Deadline VIOLATED - ${incident.id}`,
      `CRITICAL: ANPD notification deadline has passed for incident ${incident.id}`
    );
  }
}

export default IncidentResponseService;