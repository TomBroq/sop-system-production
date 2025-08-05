/**
 * LGPD Compliance Service
 * Implementa framework completo de compliance LGPD
 * Inclui gestão de consentimentos, direitos dos titulares, e incident response
 */

import { PrismaClient, DataProcessingRecord, AuditLog } from '@prisma/client';
import { logger } from '../shared/logger';
import { EmailService } from './email-service';
import { EncryptionService } from './encryption-service';

// Types para LGPD
export interface DataSubjectRequest {
  id: string;
  clientId: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'objection';
  details: Record<string, any>;
  requestDate: Date;
  requesterEmail: string;
  requesterIdentityVerified: boolean;
}

export interface DataSubjectResponse {
  requestId: string;
  status: 'processing' | 'completed' | 'rejected';
  responseData?: any;
  rejectionReason?: string;
  processingTimeMs: number;
}

export interface SecurityAnomaly {
  id: string;
  type: 'unauthorized_access' | 'data_leak' | 'unusual_activity' | 'system_breach';
  severity: IncidentSeverity;
  details: Record<string, any>;
  affectedDataCategories: string[];
  estimatedAffectedSubjects: number;
  detectionTimestamp: Date;
}

export enum IncidentSeverity {
  LOW = 1,
  MEDIUM = 2,  
  HIGH = 3,
  CRITICAL = 4
}

export interface ConsentRecord {
  id: string;
  clientId: string;
  consentType: ConsentType;
  consentGiven: boolean;
  consentDate: Date;
  consentMethod: 'form_checkbox' | 'email_confirmation' | 'portal_update';
  evidenceData: Record<string, any>;
  version: number;
}

export enum ConsentType {
  FORM_COMPLETION = 'form_completion',
  MARKETING_COMMUNICATION = 'marketing_communication', 
  PROCESS_IMPROVEMENT = 'process_improvement',
  CASE_STUDY_ANONYMOUS = 'case_study_anonymous'
}

export class LGPDComplianceService {
  private prisma: PrismaClient;
  private emailService: EmailService;
  private encryptionService: EncryptionService;
  
  constructor(
    prisma: PrismaClient,
    emailService: EmailService,
    encryptionService: EncryptionService
  ) {
    this.prisma = prisma;
    this.emailService = emailService;
    this.encryptionService = encryptionService;
  }

  /**
   * Processa solicitações de direitos dos titulares de dados
   */
  async processDataSubjectRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    const startTime = Date.now();
    
    try {
      // Log audit obrigatório
      await this.createAuditLog({
        action: 'data_subject_request_received',
        entityType: 'data_subject_right', 
        entityId: request.id,
        personalDataAccessed: true,
        dataCategories: ['contact_data', 'business_data'],
        legalBasis: 'data_subject_rights',
        requestDetails: {
          requestType: request.type,
          requesterEmail: request.requesterEmail,
          verificationStatus: request.requesterIdentityVerified
        }
      });

      // Verificação de identidade obrigatória
      if (!request.requesterIdentityVerified) {
        return {
          requestId: request.id,
          status: 'rejected',
          rejectionReason: 'Identity verification required',
          processingTimeMs: Date.now() - startTime
        };
      }

      let responseData: any = null;

      switch (request.type) {
        case 'access':
          responseData = await this.processAccessRequest(request);
          break;
        case 'rectification':
          responseData = await this.processRectificationRequest(request);
          break;
        case 'erasure':
          responseData = await this.processErasureRequest(request);
          break;
        case 'portability':
          responseData = await this.processPortabilityRequest(request);
          break;
        case 'objection':
          responseData = await this.processObjectionRequest(request);
          break;
        default:
          throw new Error(`Unsupported request type: ${request.type}`);
      }

      // Notificar titular sobre conclusão
      await this.emailService.sendDataSubjectResponseEmail(
        request.requesterEmail,
        request.type,
        responseData
      );

      return {
        requestId: request.id,
        status: 'completed',
        responseData,
        processingTimeMs: Date.now() - startTime
      };

    } catch (error) {
      logger.error('Error processing data subject request', {
        requestId: request.id,
        error: error.message,
        stack: error.stack
      });

      return {
        requestId: request.id,
        status: 'rejected',
        rejectionReason: 'Internal processing error',
        processingTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Processa solicitação de acesso aos dados (Art. 9º LGPD)
   */
  private async processAccessRequest(request: DataSubjectRequest): Promise<any> {
    const client = await this.prisma.client.findUnique({
      where: { id: request.clientId },
      include: {
        generatedForms: true,
        formResponses: true,
        generatedSOPs: true,
        commercialProposals: true,
        dataProcessingRecords: true,
        notifications: true
      }
    });

    if (!client) {
      throw new Error('Client not found');
    }

    // Estruturar dados para o titular
    const personalDataSummary = {
      dadosIdentificacao: {
        nomeEmpresa: client.name,
        emailContato: client.contactEmail,
        setor: await this.getIndustryName(client.industryId),
        tamanhoEmpresa: client.companySize
      },
      dadosOperacionais: {
        anosOperacao: client.yearsOperation,
        numeroFuncionarios: client.employeeCount,
        faturamentoAnual: client.annualRevenue
      },
      processamentosDados: client.dataProcessingRecords.map(record => ({
        finalidade: record.processingPurpose,
        baseLegal: record.legalBasis,
        dataConsentimento: record.consentDate,
        prazoRetencao: record.retentionPeriodMonths + ' meses',
        status: record.isActive ? 'Ativo' : 'Inativo'
      })),
      historico: {
        dataCriacao: client.createdAt,
        ultimaAtualizacao: client.updatedAt,
        statusAtual: client.currentStatus,
        formulariosEnviados: client.generatedForms.length,
        sopsGerados: client.generatedSOPs.length,
        propostasComerciais: client.commercialProposals.length
      }
    };

    // Gerar PDF estruturado
    const pdfBuffer = await this.generatePersonalDataReport(personalDataSummary);
    const encryptedPdf = await this.encryptionService.encrypt(pdfBuffer);

    return {
      summary: personalDataSummary,
      reportPdf: encryptedPdf,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    };
  }

  /**
   * Processa solicitação de retificação (Art. 9º LGPD)
   */
  private async processRectificationRequest(request: DataSubjectRequest): Promise<any> {
    const { fieldsToUpdate } = request.details;
    
    const updateData: any = {};
    const allowedFields = ['name', 'contactEmail', 'employeeCount', 'annualRevenue'];
    
    // Validar campos permitidos para retificação
    for (const [field, value] of Object.entries(fieldsToUpdate)) {
      if (allowedFields.includes(field)) {
        updateData[field] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields provided for rectification');
    }

    const updatedClient = await this.prisma.client.update({
      where: { id: request.clientId },
      data: updateData
    });

    // Log da retificação
    await this.createAuditLog({
      action: 'data_rectification',
      entityType: 'client',
      entityId: request.clientId,
      personalDataAccessed: true,
      dataCategories: Object.keys(updateData),
      legalBasis: 'data_subject_rights',
      requestDetails: {
        fieldsUpdated: Object.keys(updateData),
        previousValues: await this.getPreviousValues(request.clientId, Object.keys(updateData))
      }
    });

    return {
      updatedFields: Object.keys(updateData),
      updatedAt: updatedClient.updatedAt,
      message: 'Dados retificados com sucesso'
    };
  }

  /**
   * Processa solicitação de exclusão/esquecimento (Art. 9º LGPD)
   */
  private async processErasureRequest(request: DataSubjectRequest): Promise<any> {
    const { reason } = request.details;
    
    // Verificar se há base legal para manter os dados
    const activeProcessingRecords = await this.prisma.dataProcessingRecord.findMany({
      where: { 
        clientId: request.clientId,
        isActive: true 
      }
    });

    const hasLegalObligation = activeProcessingRecords.some(
      record => record.legalBasis === 'legal_obligation'
    );

    if (hasLegalObligation) {
      return {
        status: 'partially_granted',
        message: 'Alguns dados devem ser mantidos por obrigação legal',
        retainedDataCategories: ['audit_logs', 'financial_records'],
        deletedDataCategories: ['marketing_data', 'optional_business_data']
      };
    }

    // Soft delete - marcar para exclusão
    await this.prisma.client.update({
      where: { id: request.clientId },
      data: {
        scheduledDeletionDate: new Date(),
        currentStatus: 'closed'
      }
    });

    // Marcar registros de processamento como inativos
    await this.prisma.dataProcessingRecord.updateMany({
      where: { clientId: request.clientId },
      data: { 
        isActive: false,
        withdrawnAt: new Date(),
        withdrawalReason: reason || 'data_subject_erasure_request'
      }
    });

    return {
      status: 'granted',
      scheduledDeletionDate: new Date(),
      message: 'Dados agendados para exclusão permanente'
    };
  }

  /**
   * Processa solicitação de portabilidade (Art. 9º LGPD)
   */
  private async processPortabilityRequest(request: DataSubjectRequest): Promise<any> {
    const client = await this.prisma.client.findUnique({
      where: { id: request.clientId },
      include: {
        formResponses: {
          select: {
            rawResponses: true,
            processedResponses: true,
            submittedAt: true
          }
        },
        generatedSOPs: {
          select: {
            objective: true,
            responsibleRoles: true,
            steps: true,
            createdAt: true
          }
        }
      }
    });

    // Estruturar dados em formato portável (JSON estruturado)
    const portableData = {
      dadosEmpresariais: {
        nome: client.name,
        setor: await this.getIndustryName(client.industryId),
        tamanho: client.companySize,
        anosOperacao: client.yearsOperation,
        numeroFuncionarios: client.employeeCount
      },
      respostasFormularios: client.formResponses.map(response => ({
        respostas: response.processedResponses,
        dataSubmissao: response.submittedAt
      })),
      sopsGerados: client.generatedSOPs.map(sop => ({
        objetivo: sop.objective,
        responsaveis: sop.responsibleRoles,
        passos: sop.steps,
        dataCriacao: sop.createdAt
      })),
      metadados: {
        dataExportacao: new Date(),
        formato: 'JSON',
        versao: '1.0'
      }
    };

    // Gerar arquivo JSON criptografado
    const jsonBuffer = Buffer.from(JSON.stringify(portableData, null, 2));
    const encryptedData = await this.encryptionService.encrypt(jsonBuffer);

    return {
      dataFormat: 'JSON',
      encryptedData,
      dataCategories: Object.keys(portableData),
      recordCount: client.formResponses.length + client.generatedSOPs.length
    };
  }

  /**
   * Processa solicitação de oposição ao processamento (Art. 9º LGPD)
   */
  private async processObjectionRequest(request: DataSubjectRequest): Promise<any> {
    const { processingCategories, reason } = request.details;

    // Verificar quais processamentos podem ser interrompidos
    const processingRecords = await this.prisma.dataProcessingRecord.findMany({
      where: { clientId: request.clientId }
    });

    const updatableRecords = processingRecords.filter(record => 
      record.legalBasis === 'legitimate_interest' && 
      processingCategories.includes(record.processingPurpose)
    );

    if (updatableRecords.length === 0) {
      return {
        status: 'rejected',
        message: 'Não há processamentos baseados em interesse legítimo para interromper',
        reason: 'legal_basis_different'
      };
    }

    // Suspender processamentos aplicáveis
    await this.prisma.dataProcessingRecord.updateMany({
      where: {
        id: { in: updatableRecords.map(record => record.id) }
      },
      data: {
        isActive: false,
        withdrawnAt: new Date(),
        withdrawalReason: reason
      }
    });

    return {
      status: 'granted',
      suspendedProcessing: updatableRecords.map(record => record.processingPurpose),
      suspendedAt: new Date()
    };
  }

  /**
   * Detecta e responde a incidentes de segurança
   */
  async detectSecurityIncident(anomaly: SecurityAnomaly): Promise<void> {
    // Log do incidente
    await this.createAuditLog({
      action: 'security_incident_detected',
      entityType: 'security_incident',
      entityId: anomaly.id,
      personalDataAccessed: anomaly.affectedDataCategories.length > 0,
      dataCategories: anomaly.affectedDataCategories,
      legalBasis: 'security_monitoring',
      requestDetails: {
        incidentType: anomaly.type,
        severity: anomaly.severity,
        estimatedAffectedSubjects: anomaly.estimatedAffectedSubjects,
        detectionMethod: 'automated_monitoring'
      }
    });

    // Alerta DPO para incidentes HIGH/CRITICAL
    if (anomaly.severity >= IncidentSeverity.HIGH) {
      await this.emailService.sendDPOAlert({
        type: 'security_incident',
        severity: anomaly.severity,
        details: anomaly,
        requiresANPDNotification: anomaly.severity === IncidentSeverity.CRITICAL,
        detectedAt: anomaly.detectionTimestamp
      });
    }

    // Para incidentes CRÍTICOS, iniciar processo ANPD automaticamente
    if (anomaly.severity === IncidentSeverity.CRITICAL) {
      await this.initiateANPDNotificationProcess(anomaly);
    }

    logger.info('Security incident processed', {
      incidentId: anomaly.id,
      severity: anomaly.severity,
      affectedSubjects: anomaly.estimatedAffectedSubjects
    });
  }

  /**
   * Inicia processo de notificação ANPD para breaches críticos
   */
  private async initiateANPDNotificationProcess(anomaly: SecurityAnomaly): Promise<void> {
    const anpdReport = {
      incidentId: anomaly.id,
      detectionDate: anomaly.detectionTimestamp,
      incidentType: anomaly.type,
      affectedDataCategories: anomaly.affectedDataCategories,
      estimatedAffectedSubjects: anomaly.estimatedAffectedSubjects,
      containmentMeasures: 'Automated isolation and access suspension',
      plannedNotificationDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h deadline
      dpoContact: 'dpo@empresa.com',
      technicalContact: 'security@empresa.com'
    };

    // Salvar draft da notificação ANPD
    await this.prisma.auditLog.create({
      data: {
        action: 'anpd_notification_initiated',
        entityType: 'anpd_notification',
        entityId: anomaly.id,
        details: anpdReport,
        sensitiveDataAccessed: true
      }
    });

    // Alertar equipe jurídica/DPO
    await this.emailService.sendCriticalIncidentAlert(anpdReport);
  }

  /**
   * Gestão de consentimentos
   */
  async updateConsent(
    clientId: string, 
    consentType: ConsentType, 
    consentGiven: boolean,
    evidenceData: Record<string, any>
  ): Promise<ConsentRecord> {
    const consentRecord = await this.prisma.consentRecord.create({
      data: {
        clientId,
        consentType,
        consentGiven,
        consentDate: new Date(),
        consentMethod: evidenceData.method || 'portal_update',
        evidenceData,
        version: 1
      }
    });

    // Audit log obrigatório
    await this.createAuditLog({
      action: consentGiven ? 'consent_granted' : 'consent_withdrawn',
      entityType: 'consent_record',
      entityId: consentRecord.id,
      personalDataAccessed: false,
      dataCategories: ['consent_data'],
      legalBasis: 'consent_management',
      requestDetails: {
        consentType,
        previousConsent: await this.getPreviousConsent(clientId, consentType)
      }
    });

    return consentRecord as ConsentRecord;
  }

  /**
   * Cria log de auditoria imutável
   */
  private async createAuditLog(logData: {
    action: string;
    entityType: string;
    entityId: string;
    personalDataAccessed: boolean;
    dataCategories: string[];
    legalBasis: string;
    requestDetails?: Record<string, any>;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    return await this.prisma.auditLog.create({
      data: {
        action: logData.action,
        entityType: logData.entityType,
        entityId: logData.entityId,
        userId: logData.userId,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
        details: {
          personalDataAccessed: logData.personalDataAccessed,
          dataCategories: logData.dataCategories,
          legalBasis: logData.legalBasis,
          ...logData.requestDetails
        },
        sensitiveDataAccessed: logData.personalDataAccessed
      }
    });
  }

  // Helper methods
  private async getIndustryName(industryId: string): Promise<string> {
    const industry = await this.prisma.industry.findUnique({
      where: { id: industryId },
      select: { displayNameEs: true }
    });
    return industry?.displayNameEs || 'Não especificado';
  }

  private async getPreviousValues(clientId: string, fields: string[]): Promise<Record<string, any>> {
    // Implementar busca de valores anteriores nos audit logs
    const previousLogs = await this.prisma.auditLog.findMany({
      where: {
        entityType: 'client',
        entityId: clientId,
        action: { in: ['client_created', 'client_updated'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    return previousLogs[0]?.details || {};
  }

  private async getPreviousConsent(clientId: string, consentType: ConsentType): Promise<boolean | null> {
    const previousConsent = await this.prisma.consentRecord.findFirst({
      where: { clientId, consentType },
      orderBy: { consentDate: 'desc' }
    });

    return previousConsent?.consentGiven || null;
  }

  private async generatePersonalDataReport(data: any): Promise<Buffer> {
    // Implementar geração de PDF com dados pessoais estruturados
    // Por ora, retornar JSON como Buffer
    return Buffer.from(JSON.stringify(data, null, 2));
  }
}

export default LGPDComplianceService;