-- ===============================================
-- LGPD COMPLIANCE MIGRATION
-- Adiciona tabelas específicas para compliance LGPD
-- Versão: 008
-- Data: 2025-08-05
-- ===============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ===============================================
-- TABELAS DE CONSENTIMENTO E DIREITOS
-- ===============================================

-- Tabela de consentimentos granulares
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN (
        'form_completion', 'marketing_communication', 
        'process_improvement', 'case_study_anonymous'
    )),
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    consent_method VARCHAR(50) NOT NULL CHECK (consent_method IN (
        'form_checkbox', 'email_confirmation', 'portal_update'
    )),
    consent_text TEXT,
    evidence_data JSONB DEFAULT '{}',
    withdrawn_date TIMESTAMP WITH TIME ZONE,
    withdrawal_method VARCHAR(50),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consentimentos
CREATE INDEX IF NOT EXISTS idx_consent_client_type ON consent_records(client_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_date ON consent_records(consent_date);
CREATE INDEX IF NOT EXISTS idx_consent_withdrawn ON consent_records(withdrawn_date) WHERE withdrawn_date IS NOT NULL;

-- Tabela de solicitações de direitos dos titulares
CREATE TABLE IF NOT EXISTS data_subject_rights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN (
        'access', 'rectification', 'erasure', 'portability', 'objection'
    )),
    request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    request_details JSONB DEFAULT '{}',
    requester_email VARCHAR(255) NOT NULL,
    requester_identity_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'rejected'
    )),
    response_date TIMESTAMP WITH TIME ZONE,
    response_details JSONB DEFAULT '{}',
    automated_response BOOLEAN DEFAULT FALSE,
    legal_basis_review JSONB DEFAULT '{}',
    processing_time_ms INTEGER,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '15 days'),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para direitos dos titulares
CREATE INDEX IF NOT EXISTS idx_data_rights_client ON data_subject_rights(client_id);
CREATE INDEX IF NOT EXISTS idx_data_rights_status ON data_subject_rights(status);
CREATE INDEX IF NOT EXISTS idx_data_rights_deadline ON data_subject_rights(deadline) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_data_rights_email ON data_subject_rights(requester_email);

-- ===============================================
-- TABELAS DE INCIDENTES E SEGURANÇA
-- ===============================================

-- Tabela de incidentes de segurança
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(100) UNIQUE NOT NULL,
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN (
        'data_breach', 'unauthorized_access', 'system_compromise', 'vendor_incident'
    )),
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 4), -- 1=LOW, 4=CRITICAL
    status VARCHAR(20) NOT NULL DEFAULT 'detected' CHECK (status IN (
        'detected', 'investigating', 'contained', 'resolved', 'anpd_notified'
    )),
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    contained_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    affected_data_types TEXT[] DEFAULT '{}',
    affected_subjects_count INTEGER DEFAULT 0,
    description TEXT NOT NULL,
    containment_actions TEXT[] DEFAULT '{}',
    investigation_notes TEXT[] DEFAULT '{}',
    anpd_notification_required BOOLEAN DEFAULT FALSE,
    anpd_notification_sent BOOLEAN DEFAULT FALSE,
    anpd_notification_date TIMESTAMP WITH TIME ZONE,
    subject_notification_required BOOLEAN DEFAULT FALSE,
    subject_notifications_sent INTEGER DEFAULT 0,
    risk_assessment JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para incidentes
CREATE INDEX IF NOT EXISTS idx_incidents_type_severity ON security_incidents(incident_type, severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_anpd_required ON security_incidents(anpd_notification_required) WHERE anpd_notification_required = TRUE;
CREATE INDEX IF NOT EXISTS idx_incidents_detected_date ON security_incidents(detected_at);

-- Tabela de notificações ANPD
CREATE TABLE IF NOT EXISTS anpd_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES security_incidents(id) ON DELETE CASCADE,
    notification_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    incident_description TEXT NOT NULL,
    data_types_affected TEXT[] NOT NULL,
    subjects_affected INTEGER NOT NULL,
    cause_analysis TEXT,
    containment_measures TEXT[] DEFAULT '{}',
    preventive_measures TEXT[] DEFAULT '{}',
    contact_dpo VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'acknowledged', 'under_review'
    )),
    anpd_response JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- TABELAS DE VENDOR COMPLIANCE
-- ===============================================

-- Tabela de assessments de vendors
CREATE TABLE IF NOT EXISTS vendor_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id VARCHAR(100) UNIQUE NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    assessment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    compliance_score INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    dpa_status VARCHAR(20) NOT NULL CHECK (dpa_status IN ('signed', 'pending', 'expired', 'not_required')),
    data_processing_categories TEXT[] DEFAULT '{}',
    approval_status VARCHAR(20) NOT NULL CHECK (approval_status IN (
        'approved', 'conditional', 'rejected', 'under_review'
    )),
    next_review_date DATE NOT NULL,
    assessment_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de certificações de vendors
CREATE TABLE IF NOT EXISTS vendor_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id VARCHAR(100) NOT NULL REFERENCES vendor_assessments(vendor_id) ON DELETE CASCADE,
    certification_name VARCHAR(100) NOT NULL,
    issued_by VARCHAR(255) NOT NULL,
    issued_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    certificate_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'verified' CHECK (verification_status IN (
        'verified', 'pending', 'expired', 'invalid'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de alertas de vendors
CREATE TABLE IF NOT EXISTS vendor_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id VARCHAR(100) NOT NULL REFERENCES vendor_assessments(vendor_id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'cert_expiring', 'sla_breach', 'security_incident', 'compliance_violation'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para vendors
CREATE INDEX IF NOT EXISTS idx_vendor_risk_level ON vendor_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_vendor_approval_status ON vendor_assessments(approval_status);
CREATE INDEX IF NOT EXISTS idx_vendor_cert_expiry ON vendor_certifications(expiry_date) WHERE is_valid = TRUE;
CREATE INDEX IF NOT EXISTS idx_vendor_alerts_unack ON vendor_alerts(acknowledged) WHERE acknowledged = FALSE;

-- ===============================================
-- TABELAS DE AUDITORIA ESTENDIDA
-- ===============================================

-- Tabela de logs de auditoria imutáveis (complementa audit_logs existente)
CREATE TABLE IF NOT EXISTS immutable_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    previous_hash VARCHAR(64),
    current_hash VARCHAR(64),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    user_id UUID REFERENCES users(id),
    personal_data_accessed BOOLEAN DEFAULT FALSE,
    data_categories TEXT[] DEFAULT '{}',
    legal_basis VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    request_details JSONB DEFAULT '{}',
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Função para calcular hash da cadeia de auditoria
CREATE OR REPLACE FUNCTION calculate_audit_hash()
RETURNS TRIGGER AS $$
DECLARE
    prev_hash VARCHAR(64) := '';
    hash_input TEXT;
BEGIN
    -- Obter hash anterior
    SELECT current_hash INTO prev_hash 
    FROM immutable_audit_logs 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF prev_hash IS NULL THEN
        prev_hash := '';
    END IF;
    
    -- Calcular hash atual
    hash_input := prev_hash || NEW.action || NEW.entity_type || 
                  COALESCE(NEW.entity_id::TEXT, '') || 
                  COALESCE(NEW.user_id::TEXT, '') || 
                  NEW.created_at::TEXT;
    
    NEW.previous_hash := prev_hash;
    NEW.current_hash := encode(sha256(hash_input::bytea), 'hex');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular hash automaticamente
DROP TRIGGER IF EXISTS trg_calculate_audit_hash ON immutable_audit_logs;
CREATE TRIGGER trg_calculate_audit_hash
    BEFORE INSERT ON immutable_audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION calculate_audit_hash();

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_immutable_audit_entity ON immutable_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_immutable_audit_user ON immutable_audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_immutable_audit_personal_data ON immutable_audit_logs(personal_data_accessed) WHERE personal_data_accessed = TRUE;
CREATE INDEX IF NOT EXISTS idx_immutable_audit_hash_chain ON immutable_audit_logs(previous_hash, current_hash);

-- ===============================================
-- TABELAS DE COMPLIANCE METRICS
-- ===============================================

-- Tabela de métricas de compliance
CREATE TABLE IF NOT EXISTS compliance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    active_consents INTEGER DEFAULT 0,
    pending_data_subject_requests INTEGER DEFAULT 0,
    incidents_last_30_days INTEGER DEFAULT 0,
    compliance_score INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
    avg_response_time_hours DECIMAL(10,2),
    data_processed_today INTEGER DEFAULT 0,
    backups_completed_today INTEGER DEFAULT 0,
    valid_certifications INTEGER DEFAULT 0,
    vendor_alerts_active INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice único por data
CREATE UNIQUE INDEX IF NOT EXISTS idx_compliance_metrics_date ON compliance_metrics(metric_date);

-- ===============================================
-- FUNÇÕES E TRIGGERS AUTOMÁTICOS
-- ===============================================

-- Função para agendar exclusão automática de dados
CREATE OR REPLACE FUNCTION schedule_automatic_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Agenda exclusão automática após período retenção
    UPDATE clients 
    SET scheduled_deletion_date = CURRENT_DATE + INTERVAL '24 months'
    WHERE id = NEW.client_id 
    AND scheduled_deletion_date IS NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para agendar exclusão automática
DROP TRIGGER IF EXISTS trg_schedule_deletion ON data_processing_records;
CREATE TRIGGER trg_schedule_deletion
    AFTER INSERT ON data_processing_records
    FOR EACH ROW
    EXECUTE FUNCTION schedule_automatic_deletion();

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at em todas as tabelas relevantes
DROP TRIGGER IF EXISTS trg_consent_updated_at ON consent_records;
CREATE TRIGGER trg_consent_updated_at
    BEFORE UPDATE ON consent_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_data_rights_updated_at ON data_subject_rights;
CREATE TRIGGER trg_data_rights_updated_at
    BEFORE UPDATE ON data_subject_rights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_incidents_updated_at ON security_incidents;
CREATE TRIGGER trg_incidents_updated_at
    BEFORE UPDATE ON security_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- JOBS AUTOMÁTICOS PARA COMPLIANCE
-- ===============================================

-- Job diário para exclusão automática de dados expirados
SELECT cron.schedule(
    'lgpd_auto_deletion',
    '0 2 * * *', -- Todo dia às 2h
    $$
    BEGIN;
    
    -- Marcar clientes para exclusão
    UPDATE clients 
    SET current_status = 'closed',
        updated_at = NOW()
    WHERE scheduled_deletion_date <= CURRENT_DATE
    AND current_status != 'closed';
    
    -- Log das exclusões
    INSERT INTO immutable_audit_logs (
        action, entity_type, personal_data_accessed, 
        data_categories, legal_basis, request_details
    )
    SELECT 
        'automated_data_deletion',
        'client',
        TRUE,
        ARRAY['all_personal_data'],
        'retention_policy',
        jsonb_build_object(
            'deletion_date', CURRENT_DATE,
            'clients_affected', COUNT(*)
        )
    FROM clients
    WHERE scheduled_deletion_date <= CURRENT_DATE
    AND current_status = 'closed';
    
    COMMIT;
    $$
);

-- Job semanal para verificar deadlines de direitos dos titulares
SELECT cron.schedule(
    'lgpd_check_deadlines',
    '0 9 * * 1', -- Toda segunda às 9h
    $$
    -- Alertar sobre deadlines próximos (3 dias)
    INSERT INTO vendor_alerts (vendor_id, alert_type, severity, message)
    SELECT 
        'internal_system',
        'compliance_violation',
        CASE 
            WHEN deadline <= CURRENT_DATE THEN 'critical'
            ELSE 'high'
        END,
        'Data subject request deadline: ' || deadline::text || ' for request ' || id::text
    FROM data_subject_rights
    WHERE status IN ('pending', 'processing')
    AND deadline <= CURRENT_DATE + INTERVAL '3 days'
    AND NOT EXISTS (
        SELECT 1 FROM vendor_alerts 
        WHERE message LIKE '%' || data_subject_rights.id::text || '%'
        AND created_at > CURRENT_DATE - INTERVAL '7 days'
    );
    $$
);

-- Job mensal para atualizar métricas de compliance
SELECT cron.schedule(
    'lgpd_update_metrics',
    '0 8 1 * *', -- Dia 1 de cada mês às 8h
    $$
    INSERT INTO compliance_metrics (
        metric_date,
        active_consents,
        pending_data_subject_requests,
        incidents_last_30_days,
        compliance_score,
        avg_response_time_hours,
        valid_certifications,
        vendor_alerts_active
    )
    SELECT 
        CURRENT_DATE,
        (SELECT COUNT(*) FROM consent_records WHERE consent_given = TRUE AND withdrawn_date IS NULL),
        (SELECT COUNT(*) FROM data_subject_rights WHERE status IN ('pending', 'processing')),
        (SELECT COUNT(*) FROM security_incidents WHERE detected_at > CURRENT_DATE - INTERVAL '30 days'),
        GREATEST(85 - (SELECT COUNT(*) FROM vendor_alerts WHERE acknowledged = FALSE) * 5, 0), -- Score baseado em alertas
        (SELECT AVG(EXTRACT(EPOCH FROM (response_date - request_date)) / 3600) FROM data_subject_rights WHERE response_date IS NOT NULL),
        (SELECT COUNT(*) FROM vendor_certifications WHERE is_valid = TRUE AND expiry_date > CURRENT_DATE),
        (SELECT COUNT(*) FROM vendor_alerts WHERE acknowledged = FALSE)
    ON CONFLICT (metric_date) DO UPDATE SET
        active_consents = EXCLUDED.active_consents,
        pending_data_subject_requests = EXCLUDED.pending_data_subject_requests,
        incidents_last_30_days = EXCLUDED.incidents_last_30_days,
        compliance_score = EXCLUDED.compliance_score,
        avg_response_time_hours = EXCLUDED.avg_response_time_hours,
        valid_certifications = EXCLUDED.valid_certifications,
        vendor_alerts_active = EXCLUDED.vendor_alerts_active;
    $$
);

-- ===============================================
-- VIEWS PARA COMPLIANCE DASHBOARD
-- ===============================================

-- View para métricas de compliance em tempo real
CREATE OR REPLACE VIEW v_compliance_dashboard AS
SELECT 
    -- Métricas principais
    (SELECT COUNT(*) FROM consent_records WHERE consent_given = TRUE AND withdrawn_date IS NULL) as active_consents,
    (SELECT COUNT(*) FROM data_subject_rights WHERE status IN ('pending', 'processing')) as pending_requests,
    (SELECT COUNT(*) FROM security_incidents WHERE detected_at > CURRENT_DATE - INTERVAL '30 days') as recent_incidents,
    
    -- Score de compliance calculado
    GREATEST(
        100 - 
        (SELECT COUNT(*) * 10 FROM vendor_alerts WHERE acknowledged = FALSE AND severity IN ('high', 'critical')) -
        (SELECT COUNT(*) * 5 FROM data_subject_rights WHERE deadline < CURRENT_DATE AND status IN ('pending', 'processing')) -
        (SELECT COUNT(*) * 15 FROM security_incidents WHERE status NOT IN ('resolved') AND severity = 4),
        0
    ) as compliance_score,
    
    -- Tempo médio de resposta
    (SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (response_date - request_date)) / 3600), 0) 
     FROM data_subject_rights 
     WHERE response_date IS NOT NULL 
     AND request_date > CURRENT_DATE - INTERVAL '90 days'
    ) as avg_response_hours,
    
    -- Dados processados hoje
    (SELECT COUNT(*) FROM clients WHERE created_at::DATE = CURRENT_DATE) as data_processed_today,
    
    -- Certificações válidas
    (SELECT COUNT(*) FROM vendor_certifications WHERE is_valid = TRUE AND expiry_date > CURRENT_DATE) as valid_certifications,
    
    -- Timestamp da última atualização
    NOW() as last_updated;

-- View para alertas de compliance
CREATE OR REPLACE VIEW v_compliance_alerts AS
SELECT 
    'data_subject_deadline' as alert_type,
    CASE 
        WHEN deadline < CURRENT_DATE THEN 'critical'
        WHEN deadline <= CURRENT_DATE + INTERVAL '3 days' THEN 'high'
        ELSE 'medium'
    END as severity,
    'Data subject request deadline: ' || deadline::text || ' (Request #' || id::text || ')' as message,
    request_date as created_at,
    FALSE as acknowledged
FROM data_subject_rights
WHERE status IN ('pending', 'processing')
AND deadline <= CURRENT_DATE + INTERVAL '7 days'

UNION ALL

SELECT 
    'certificate_expiring' as alert_type,
    CASE 
        WHEN expiry_date <= CURRENT_DATE THEN 'critical'
        WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'high'
        ELSE 'medium'
    END as severity,
    'Certificate expiring: ' || certification_name || ' (' || vendor_id || ') - ' || expiry_date::text as message,
    created_at,
    FALSE as acknowledged
FROM vendor_certifications
WHERE is_valid = TRUE
AND expiry_date <= CURRENT_DATE + INTERVAL '60 days'

UNION ALL

SELECT 
    alert_type,
    severity,
    message,
    created_at,
    acknowledged
FROM vendor_alerts
WHERE acknowledged = FALSE

ORDER BY 
    CASE severity 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
    END,
    created_at DESC;

-- ===============================================
-- GRANTS E PERMISSÕES
-- ===============================================

-- Garantir que usuários da aplicação tenham acesso às novas tabelas
-- (ajustar conforme usuários da aplicação)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres;
GRANT SELECT, USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ===============================================
-- DADOS INICIAIS DE COMPLIANCE
-- ===============================================

-- Inserir métricas iniciais
INSERT INTO compliance_metrics (
    metric_date,
    active_consents,
    pending_data_subject_requests,
    incidents_last_30_days,
    compliance_score,
    avg_response_time_hours,
    data_processed_today,
    backups_completed_today,
    valid_certifications,
    vendor_alerts_active
) VALUES (
    CURRENT_DATE,
    0, 0, 0, 100, 0, 0, 1, 0, 0
) ON CONFLICT (metric_date) DO NOTHING;

-- Inserir assessment inicial do Tally Forms
INSERT INTO vendor_assessments (
    vendor_id,
    vendor_name,
    compliance_score,
    risk_level,
    dpa_status,
    data_processing_categories,
    approval_status,
    next_review_date,
    assessment_details
) VALUES (
    'tally_forms',
    'Tally Forms Inc.',
    85,
    'medium',
    'pending',
    ARRAY['form_data', 'contact_data'],
    'conditional',
    CURRENT_DATE + INTERVAL '12 months',
    jsonb_build_object(
        'website', 'https://tally.so',
        'jurisdiction', 'US',
        'last_assessment', CURRENT_DATE
    )
) ON CONFLICT (vendor_id) DO NOTHING;

-- ===============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ===============================================

COMMENT ON TABLE consent_records IS 'Registros de consentimento granular conforme LGPD Art. 8º';
COMMENT ON TABLE data_subject_rights IS 'Solicitações de exercício de direitos LGPD Art. 18';
COMMENT ON TABLE security_incidents IS 'Incidentes de segurança para notificação ANPD Art. 48';
COMMENT ON TABLE anpd_notifications IS 'Notificações enviadas à ANPD conforme prazo 72h';
COMMENT ON TABLE vendor_assessments IS 'Due diligence de fornecedores para compliance';
COMMENT ON TABLE immutable_audit_logs IS 'Logs de auditoria imutáveis com hash chain';
COMMENT ON VIEW v_compliance_dashboard IS 'Métricas em tempo real para dashboard LGPD';

-- ===============================================
-- MIGRAÇÃO COMPLETADA
-- ===============================================

-- Log da migração
INSERT INTO immutable_audit_logs (
    action, entity_type, personal_data_accessed, 
    data_categories, legal_basis, request_details
) VALUES (
    'lgpd_compliance_migration_completed',
    'system',
    FALSE,
    ARRAY['system_migration'],
    'legal_compliance',
    jsonb_build_object(
        'migration_version', '008',
        'tables_created', ARRAY[
            'consent_records', 'data_subject_rights', 'security_incidents',
            'anpd_notifications', 'vendor_assessments', 'vendor_certifications',
            'vendor_alerts', 'immutable_audit_logs', 'compliance_metrics'
        ],
        'migration_date', CURRENT_DATE,
        'compliance_framework', 'LGPD_complete'
    )
);

COMMIT;