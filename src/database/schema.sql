-- ==============================================
-- SISTEMA DE LEVANTAMIENTO AUTOMATIZADO DE PROCESOS
-- Database Schema Completo - Optimizado para 68 Reglas de Negocio
-- ==============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==============================================
-- SISTEMA DE USUARIOS Y AUTENTICACIÓN
-- ==============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Roles granulares (RN de autorización)
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'senior_consultant', 'consultant', 'client')),
    
    -- Autenticación
    password_hash VARCHAR(255), -- NULL para SSO users
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    
    -- Profile
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'America/Santiago',
    language VARCHAR(5) DEFAULT 'es',
    
    -- Estado
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ==============================================
-- INDUSTRIES & KNOWLEDGE BASE
-- ==============================================

-- Base de conocimiento de las 13 industrias prioritarias
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'accounting', 'real_estate', etc.
    name VARCHAR(100) NOT NULL,
    display_name_es VARCHAR(100) NOT NULL,
    
    -- Configuración de formularios (RN2 de RF002)
    is_regulated BOOLEAN DEFAULT FALSE,
    additional_compliance_questions INTEGER DEFAULT 0,
    
    -- Procesos típicos de la industria
    typical_processes JSONB DEFAULT '[]', -- Array de procesos estándar
    common_pain_points JSONB DEFAULT '[]', -- Pain points frecuentes
    automation_benchmarks JSONB DEFAULT '{}', -- Benchmarks típicos
    
    -- Control de versiones
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar las 13 industrias prioritarias del PRD
INSERT INTO industries (code, name, display_name_es, is_regulated, typical_processes, common_pain_points) VALUES
('accounting', 'Accounting', 'Contabilidad', TRUE, 
 '[
    {"name": "Facturación mensual", "category": "primary", "frequency": "monthly"},
    {"name": "Conciliación bancaria", "category": "primary", "frequency": "daily"},
    {"name": "Cálculo de impuestos", "category": "support", "frequency": "monthly"},
    {"name": "Reportes financieros", "category": "management", "frequency": "monthly"}
 ]'::jsonb,
 '["Errores en conciliación", "Retrasos en facturación", "Cálculos manuales propensos a error"]'::jsonb),

('real_estate', 'Real Estate', 'Gestión Inmobiliaria', FALSE,
 '[
    {"name": "Gestión de propiedades", "category": "primary", "frequency": "daily"},
    {"name": "Proceso de arrendamiento", "category": "primary", "frequency": "weekly"},
    {"name": "Mantenimiento preventivo", "category": "support", "frequency": "monthly"},
    {"name": "Reportes de ocupación", "category": "management", "frequency": "monthly"}
 ]'::jsonb,
 '["Seguimiento manual de contratos", "Comunicación fragmentada con inquilinos", "Gestión ineficiente de mantenimiento"]'::jsonb),

('sales', 'Sales & Prospecting', 'Prospección y Ventas', FALSE,
 '[
    {"name": "Prospección de leads", "category": "primary", "frequency": "daily"},
    {"name": "Seguimiento comercial", "category": "primary", "frequency": "daily"},
    {"name": "Gestión de pipeline", "category": "management", "frequency": "weekly"},
    {"name": "Reportes de ventas", "category": "management", "frequency": "weekly"}
 ]'::jsonb,
 '["Leads perdidos por falta seguimiento", "Procesos de venta no estandarizados", "Falta de visibilidad del pipeline"]'::jsonb),

('agriculture', 'Agriculture', 'Agrícola', TRUE,
 '[
    {"name": "Planificación de cultivos", "category": "primary", "frequency": "seasonal"},
    {"name": "Control de inventario", "category": "support", "frequency": "weekly"},
    {"name": "Seguimiento de cosechas", "category": "primary", "frequency": "daily"},
    {"name": "Reportes de producción", "category": "management", "frequency": "monthly"}
 ]'::jsonb,
 '["Trazabilidad manual de productos", "Control ineficiente de inventarios", "Falta de datos de producción"]'::jsonb),

('public_bids', 'Public Bidding', 'Licitaciones', TRUE,
 '[
    {"name": "Búsqueda de licitaciones", "category": "primary", "frequency": "daily"},
    {"name": "Preparación de propuestas", "category": "primary", "frequency": "weekly"},
    {"name": "Seguimiento de procesos", "category": "support", "frequency": "daily"},
    {"name": "Gestión documental", "category": "support", "frequency": "daily"}
 ]'::jsonb,
 '["Búsqueda manual de oportunidades", "Preparación tardía de documentos", "Falta de seguimiento sistemático"]'::jsonb),

('tech_startups', 'Tech Startups', 'Startups TI', FALSE,
 '[
    {"name": "Desarrollo de producto", "category": "primary", "frequency": "daily"},
    {"name": "Gestión de usuarios", "category": "support", "frequency": "daily"},
    {"name": "Análisis de métricas", "category": "management", "frequency": "weekly"},
    {"name": "Deploy y monitoring", "category": "support", "frequency": "daily"}
 ]'::jsonb,
 '["Procesos de desarrollo no estandarizados", "Falta de automation en deploy", "Métricas dispersas"]'::jsonb),

('healthcare', 'Healthcare', 'Consultas Médicas', TRUE,
 '[
    {"name": "Agendamiento de citas", "category": "primary", "frequency": "daily"},
    {"name": "Gestión de historias clínicas", "category": "primary", "frequency": "daily"},
    {"name": "Facturación médica", "category": "support", "frequency": "daily"},
    {"name": "Seguimiento de pacientes", "category": "support", "frequency": "weekly"}
 ]'::jsonb,
 '["Doble agendamiento", "Historias clínicas en papel", "Seguimiento manual de tratamientos"]'::jsonb),

('telecommunications', 'Telecommunications', 'Telecomunicaciones', TRUE,
 '[
    {"name": "Gestión de órdenes de servicio", "category": "primary", "frequency": "daily"},
    {"name": "Soporte técnico", "category": "support", "frequency": "daily"},
    {"name": "Instalaciones", "category": "primary", "frequency": "daily"},
    {"name": "Facturación de servicios", "category": "support", "frequency": "monthly"}
 ]'::jsonb,
 '["Órdenes de trabajo manuales", "Seguimiento ineficiente de instalaciones", "Comunicación fragmentada con técnicos"]'::jsonb),

('solar_energy', 'Solar Energy', 'Energía Solar', FALSE,
 '[
    {"name": "Evaluación de sitios", "category": "primary", "frequency": "weekly"},
    {"name": "Diseño de sistemas", "category": "primary", "frequency": "weekly"},
    {"name": "Instalación y comisionado", "category": "primary", "frequency": "monthly"},
    {"name": "Mantenimiento preventivo", "category": "support", "frequency": "quarterly"}
 ]'::jsonb,
 '["Evaluaciones manuales de sitio", "Cálculos complejos de dimensionamiento", "Seguimiento manual de rendimiento"]'::jsonb),

('hospitality', 'Hospitality', 'Hotelería', FALSE,
 '[
    {"name": "Gestión de reservas", "category": "primary", "frequency": "daily"},
    {"name": "Check-in/Check-out", "category": "primary", "frequency": "daily"},
    {"name": "Housekeeping", "category": "support", "frequency": "daily"},
    {"name": "Gestión de inventarios", "category": "support", "frequency": "weekly"}
 ]'::jsonb,
 '["Sobrereservas", "Coordinación manual de housekeeping", "Control ineficiente de inventarios"]'::jsonb),

('consulting', 'Consulting', 'Consultoría', FALSE,
 '[
    {"name": "Gestión de proyectos", "category": "primary", "frequency": "daily"},
    {"name": "Seguimiento de tiempo", "category": "support", "frequency": "daily"},
    {"name": "Facturación por proyecto", "category": "support", "frequency": "monthly"},
    {"name": "Gestión del conocimiento", "category": "management", "frequency": "weekly"}
 ]'::jsonb,
 '["Seguimiento manual de tiempo", "Proyectos sin metodología estándar", "Conocimiento no sistematizado"]'::jsonb),

('retail', 'Mass Retail', 'Venta Masiva', FALSE,
 '[
    {"name": "Gestión de inventario", "category": "primary", "frequency": "daily"},
    {"name": "Proceso de ventas", "category": "primary", "frequency": "daily"},
    {"name": "Reposición de stock", "category": "support", "frequency": "daily"},
    {"name": "Análisis de ventas", "category": "management", "frequency": "weekly"}
 ]'::jsonb,
 '["Stock-outs frecuentes", "Reposición manual ineficiente", "Falta de análisis de demanda"]'::jsonb),

('architecture', 'Architecture', 'Arquitectura', FALSE,
 '[
    {"name": "Diseño conceptual", "category": "primary", "frequency": "weekly"},
    {"name": "Gestión de permisos", "category": "support", "frequency": "monthly"},
    {"name": "Supervisión de obra", "category": "primary", "frequency": "weekly"},
    {"name": "Gestión documental", "category": "support", "frequency": "daily"}
 ]'::jsonb,
 '["Revisiones manuales extensas", "Seguimiento ineficiente de permisos", "Comunicación fragmentada en obra"]'::jsonb);

-- Templates de preguntas por industria + tamaño (RN1 de RF002)
CREATE TABLE question_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id UUID NOT NULL REFERENCES industries(id),
    company_size VARCHAR(20) NOT NULL CHECK (company_size IN ('micro', 'small', 'medium', 'large')),
    
    -- Contenido de preguntas
    questions JSONB NOT NULL, -- Array de preguntas específicas
    question_count INTEGER NOT NULL,
    estimated_completion_time INTEGER NOT NULL, -- minutos
    
    -- Reglas de negocio embebidas
    priority_order INTEGER DEFAULT 1,
    compliance_questions JSONB DEFAULT '[]', -- Preguntas adicionales si es regulada
    
    -- Metadatos
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints de las reglas de negocio (RN1 de RF002)
    CONSTRAINT chk_question_count_by_size CHECK (
        (company_size = 'micro' AND question_count BETWEEN 15 AND 20) OR
        (company_size = 'small' AND question_count BETWEEN 20 AND 25) OR
        (company_size = 'medium' AND question_count BETWEEN 25 AND 30) OR
        (company_size = 'large' AND question_count BETWEEN 30 AND 40)
    ),
    
    UNIQUE(industry_id, company_size, version)
);

CREATE INDEX idx_question_templates_industry ON question_templates(industry_id);
CREATE INDEX idx_question_templates_size ON question_templates(company_size);
CREATE INDEX idx_question_templates_active ON question_templates(is_active);

-- ==============================================
-- CLIENT MANAGEMENT DOMAIN
-- ==============================================

-- Tabla principal de clientes con clasificación automática (RN1, RN2 de RF001)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry_id UUID NOT NULL REFERENCES industries(id),
    subindustry VARCHAR(100),
    company_size VARCHAR(20) NOT NULL CHECK (company_size IN ('micro', 'small', 'medium', 'large')),
    years_operation INTEGER,
    employee_count INTEGER,
    annual_revenue DECIMAL(12,2),
    contact_email VARCHAR(255) NOT NULL,
    
    -- Clasificación automática IA (RN2 de RF001)
    classification_confidence DECIMAL(3,2) CHECK (classification_confidence BETWEEN 0.00 AND 1.00),
    classification_timestamp TIMESTAMP,
    classification_metadata JSONB DEFAULT '{}',
    
    -- Estado del proceso workflow (estados definidos en PRD)
    current_status VARCHAR(50) DEFAULT 'created' CHECK (current_status IN (
        'created', 
        'form_sent', 
        'responses_received', 
        'processing_ai', 
        'sops_generated', 
        'proposal_ready', 
        'proposal_sent', 
        'closed'
    )),
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Índices optimizados para performance <3s
CREATE INDEX idx_clients_industry ON clients(industry_id);
CREATE INDEX idx_clients_status ON clients(current_status);
CREATE INDEX idx_clients_created ON clients(created_at DESC);
CREATE INDEX idx_clients_company_size ON clients(company_size);
CREATE INDEX idx_clients_email ON clients(contact_email);

-- ==============================================
-- FORM MANAGEMENT DOMAIN
-- ==============================================

-- Formularios generados vía Tally API (RF002)
CREATE TABLE generated_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Integración Tally Forms
    tally_form_id VARCHAR(100) UNIQUE NOT NULL,
    tally_form_url TEXT NOT NULL,
    tally_webhook_url TEXT,
    
    -- Configuración del formulario
    industry_id UUID REFERENCES industries(id),
    company_size VARCHAR(20) CHECK (company_size IN ('micro', 'small', 'medium', 'large')),
    question_template_id UUID REFERENCES question_templates(id),
    total_questions INTEGER NOT NULL,
    
    -- Estado y timing
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'sent', 'in_progress', 'completed', 'expired')),
    sent_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Tracking de progreso
    current_question INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Persistencia parcial (RN3 de RF002 - guardado parcial)
    partial_responses JSONB DEFAULT '{}',
    last_saved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forms_client ON generated_forms(client_id);
CREATE INDEX idx_forms_status ON generated_forms(status);
CREATE INDEX idx_forms_tally_id ON generated_forms(tally_form_id);
CREATE INDEX idx_forms_industry ON generated_forms(industry_id);

-- Respuestas de formularios recibidas vía webhook
CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES generated_forms(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Datos completos de respuestas
    raw_responses JSONB NOT NULL, -- Respuestas tal como vienen de Tally
    processed_responses JSONB NOT NULL, -- Respuestas procesadas y estructuradas
    
    -- Metadatos de completado
    completion_time_minutes INTEGER,
    submitted_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Validación de calidad
    validation_score DECIMAL(3,2) CHECK (validation_score BETWEEN 0.00 AND 1.00),
    validation_issues JSONB DEFAULT '[]',
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraint único por formulario
    UNIQUE(form_id)
);

CREATE INDEX idx_responses_client ON form_responses(client_id);
CREATE INDEX idx_responses_submitted ON form_responses(submitted_at DESC);
CREATE INDEX idx_responses_validation_score ON form_responses(validation_score);

-- ==============================================
-- AI PROCESSING DOMAIN
-- ==============================================

-- Jobs de procesamiento IA con sistema multiagente (RF003)
CREATE TABLE ai_processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    form_response_id UUID NOT NULL REFERENCES form_responses(id),
    
    -- Estado del procesamiento
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'retrying')),
    
    -- Configuración de procesamiento
    multiagent_system_config JSONB DEFAULT '{}',
    industry_context JSONB DEFAULT '{}',
    
    -- Timing y performance (RN performance <2min)
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    processing_time_seconds INTEGER,
    
    -- Resultados
    identified_processes JSONB DEFAULT '[]',
    process_count INTEGER DEFAULT 0,
    confidence_scores JSONB DEFAULT '{}',
    
    -- Control de errores y retry
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    error_details JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraint de calidad (RN3 de validación: mínimo 5 procesos)
    CONSTRAINT chk_min_processes CHECK (
        status != 'completed' OR process_count >= 5
    )
);

CREATE INDEX idx_ai_jobs_status ON ai_processing_jobs(status);
CREATE INDEX idx_ai_jobs_client ON ai_processing_jobs(client_id);
CREATE INDEX idx_ai_jobs_created ON ai_processing_jobs(created_at DESC);

-- ==============================================
-- SOP GENERATION DOMAIN
-- ==============================================

-- Procesos identificados con categorización (RN1 de RF003)
CREATE TABLE identified_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    ai_job_id UUID NOT NULL REFERENCES ai_processing_jobs(id),
    
    -- Clasificación del proceso (RN1 de RF003)
    process_name VARCHAR(255) NOT NULL,
    process_category VARCHAR(20) NOT NULL CHECK (process_category IN ('primary', 'support', 'management')),
    process_description TEXT,
    
    -- Características del proceso
    is_explicit BOOLEAN NOT NULL DEFAULT TRUE, -- Explícito vs implícito en respuestas
    frequency_per_month INTEGER DEFAULT 0,
    manual_steps_count INTEGER DEFAULT 0,
    error_rate_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Datos para automatización (reglas de priorización)
    automation_feasibility_score DECIMAL(3,2) DEFAULT 0.00 CHECK (automation_feasibility_score BETWEEN 0.00 AND 1.00),
    estimated_roi_percentage INTEGER DEFAULT 0,
    implementation_complexity VARCHAR(20) DEFAULT 'medium' CHECK (implementation_complexity IN ('low', 'medium', 'high')),
    
    -- Sistemas involucrados
    systems_involved JSONB DEFAULT '[]',
    integration_complexity VARCHAR(20) DEFAULT 'medium' CHECK (integration_complexity IN ('low', 'medium', 'high')),
    
    -- Metadatos adicionales
    process_metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_processes_client ON identified_processes(client_id);
CREATE INDEX idx_processes_category ON identified_processes(process_category);
CREATE INDEX idx_processes_automation_score ON identified_processes(automation_feasibility_score DESC);
CREATE INDEX idx_processes_ai_job ON identified_processes(ai_job_id);

-- SOPs generados estructurados (RN2 de RF003)
CREATE TABLE generated_sops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES identified_processes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Estructura estándar del SOP (RN2 de RF003)
    objective TEXT NOT NULL,
    responsible_roles JSONB NOT NULL DEFAULT '[]', -- Array de roles responsables
    inputs JSONB NOT NULL DEFAULT '[]', -- Inputs necesarios
    steps JSONB NOT NULL DEFAULT '[]', -- Pasos detallados
    outputs JSONB NOT NULL DEFAULT '[]', -- Outputs generados
    
    -- Metadata del SOP
    estimated_duration_minutes INTEGER DEFAULT 0,
    complexity_level VARCHAR(20) DEFAULT 'medium' CHECK (complexity_level IN ('low', 'medium', 'high')),
    compliance_requirements JSONB DEFAULT '[]', -- Para industrias reguladas
    
    -- Validación de calidad automática (RN1 de reglas de validación)
    has_objective BOOLEAN GENERATED ALWAYS AS (objective IS NOT NULL AND LENGTH(objective) > 10) STORED,
    has_responsible BOOLEAN GENERATED ALWAYS AS (jsonb_array_length(responsible_roles) >= 1) STORED,
    has_min_steps BOOLEAN GENERATED ALWAYS AS (jsonb_array_length(steps) >= 3) STORED,
    has_inputs_outputs BOOLEAN GENERATED ALWAYS AS (jsonb_array_length(inputs) >= 1 AND jsonb_array_length(outputs) >= 1) STORED,
    
    -- Control de versiones y aprobación
    version INTEGER DEFAULT 1,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    
    -- Notas y observaciones
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraint de calidad mínima (RN1 de validación)
    CONSTRAINT chk_sop_quality CHECK (
        has_objective AND has_responsible AND has_min_steps AND has_inputs_outputs
    ),
    
    -- Alert para SOPs complejos (RN3 de validación: >20 pasos sugerir división)
    CONSTRAINT chk_steps_count CHECK (
        jsonb_array_length(steps) <= 20 OR 
        (jsonb_array_length(steps) > 20 AND complexity_level = 'high')
    )
);

CREATE INDEX idx_sops_client ON generated_sops(client_id);
CREATE INDEX idx_sops_process ON generated_sops(process_id);
CREATE INDEX idx_sops_approved ON generated_sops(is_approved);
CREATE INDEX idx_sops_complexity ON generated_sops(complexity_level);

-- ==============================================
-- PROPOSAL GENERATION DOMAIN
-- ==============================================

-- Análisis de automatización por cliente (RF004)
CREATE TABLE automation_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Matriz de priorización automática (RN1, RN2, RN3 de RF004)
    quick_wins JSONB DEFAULT '[]', -- Procesos 0-3 meses (ROI >300%)
    medium_term JSONB DEFAULT '[]', -- Procesos 3-6 meses
    complex_projects JSONB DEFAULT '[]', -- Procesos 6+ meses
    
    -- Métricas globales
    total_processes_analyzed INTEGER NOT NULL DEFAULT 0,
    high_priority_count INTEGER DEFAULT 0,
    estimated_total_roi_percentage INTEGER DEFAULT 0,
    total_implementation_cost_usd DECIMAL(10,2) DEFAULT 0.00,
    
    -- Reglas de priorización aplicadas (RN matriz_automatizacion)
    high_volume_processes JSONB DEFAULT '[]', -- >100 transacciones/mes + >10 pasos
    high_error_processes JSONB DEFAULT '[]', -- >5% tasa error
    complex_integration_processes JSONB DEFAULT '[]', -- >3 sistemas
    compliance_critical_processes JSONB DEFAULT '[]', -- Forzar alta prioridad
    
    -- Metadatos del análisis
    analysis_metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraint de calidad mínima (RN3 de validación)
    CONSTRAINT chk_analysis_quality CHECK (
        total_processes_analyzed >= 5
    )
);

CREATE INDEX idx_analysis_client ON automation_analysis(client_id);
CREATE INDEX idx_analysis_roi ON automation_analysis(estimated_total_roi_percentage DESC);

-- Propuestas comerciales generadas (RF004)
CREATE TABLE commercial_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    automation_analysis_id UUID NOT NULL REFERENCES automation_analysis(id),
    
    -- Contenido de la propuesta
    executive_summary TEXT,
    identified_opportunities JSONB DEFAULT '[]',
    implementation_roadmap JSONB DEFAULT '[]',
    investment_breakdown JSONB DEFAULT '{}',
    expected_roi JSONB DEFAULT '{}',
    
    -- Archivos generados
    pdf_file_path TEXT,
    pdf_generated_at TIMESTAMP,
    pdf_file_size_bytes INTEGER,
    
    -- Estado de la propuesta
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'sent', 'accepted', 'rejected')),
    sent_at TIMESTAMP,
    client_feedback TEXT,
    
    -- Métricas de conversión
    opened_at TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_proposals_client ON commercial_proposals(client_id);
CREATE INDEX idx_proposals_status ON commercial_proposals(status);
CREATE INDEX idx_proposals_sent ON commercial_proposals(sent_at DESC);

-- ==============================================
-- NOTIFICATION & WORKFLOW DOMAIN
-- ==============================================

-- Sistema de notificaciones automáticas (RF006)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    user_id UUID REFERENCES users(id),
    
    -- Tipo y contenido
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'form_sent',
        'form_reminder',
        'form_completed',
        'processing_started',
        'sops_ready',
        'proposal_ready',
        'error_alert',
        'system_alert'
    )),
    
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    template_used VARCHAR(100),
    
    -- Estado de envío
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    sent_at TIMESTAMP,
    delivery_response JSONB DEFAULT '{}',
    
    -- Configuración
    is_automated BOOLEAN DEFAULT TRUE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_client ON notifications(client_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_email);

-- Workflow state transitions tracking
CREATE TABLE workflow_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Transición de estado
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    
    -- Contexto de cambio
    trigger_event VARCHAR(100) NOT NULL, -- 'webhook_received', 'manual_action', etc.
    triggered_by UUID REFERENCES users(id),
    
    -- Metadata
    additional_data JSONB DEFAULT '{}',
    processing_time_ms INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transitions_client ON workflow_transitions(client_id);
CREATE INDEX idx_transitions_status ON workflow_transitions(to_status);
CREATE INDEX idx_transitions_created ON workflow_transitions(created_at DESC);

-- ==============================================
-- PERFORMANCE MONITORING
-- ==============================================

-- Métricas de performance del sistema (targets del PRD)
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tipo de métrica
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN (
        'form_generation_time',      -- Target: <30s
        'ai_processing_time',        -- Target: <2min
        'sop_generation_time',       -- Target: <10s
        'pdf_generation_time',       -- Target: <5s
        'api_response_time',         -- Target: <3s
        'database_query_time',       -- Target: <1s
        'webhook_processing_time'    -- Target: <5s
    )),
    
    -- Valores
    value_ms INTEGER NOT NULL,
    client_id UUID REFERENCES clients(id),
    
    -- Contexto
    additional_context JSONB DEFAULT '{}',
    environment VARCHAR(20) DEFAULT 'production',
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_metrics_type ON system_metrics(metric_type);
CREATE INDEX idx_metrics_created ON system_metrics(created_at DESC);
CREATE INDEX idx_metrics_client ON system_metrics(client_id);

-- ==============================================
-- AUDITORIA Y COMPLIANCE LGPD
-- ==============================================

-- Audit log para compliance LGPD
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Qué acción
    action VARCHAR(100) NOT NULL, -- 'create_client', 'access_data', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'client', 'form_response', etc.
    entity_id UUID,
    
    -- Quién y cuándo
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    
    -- Detalles
    details JSONB DEFAULT '{}',
    sensitive_data_accessed BOOLEAN DEFAULT FALSE,
    
    -- Metadatos adicionales
    request_id VARCHAR(100), -- Para rastrear requests completas
    session_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_sensitive ON audit_logs(sensitive_data_accessed);

-- LGPD data processing records
CREATE TABLE data_processing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Consentimiento
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMP NOT NULL,
    consent_type VARCHAR(100) NOT NULL, -- 'form_completion', 'commercial_proposal'
    consent_text TEXT, -- Texto exacto del consentimiento
    
    -- Propósito del procesamiento
    processing_purpose TEXT NOT NULL,
    legal_basis VARCHAR(100) NOT NULL, -- 'consent', 'legitimate_interest'
    
    -- Retención de datos
    retention_period_months INTEGER DEFAULT 24, -- 2 años por defecto
    scheduled_deletion_date DATE,
    
    -- Estado
    is_active BOOLEAN DEFAULT TRUE,
    withdrawn_at TIMESTAMP,
    withdrawal_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_processing_client ON data_processing_records(client_id);
CREATE INDEX idx_processing_deletion ON data_processing_records(scheduled_deletion_date);
CREATE INDEX idx_processing_active ON data_processing_records(is_active);

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industries_updated_at BEFORE UPDATE ON industries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_templates_updated_at BEFORE UPDATE ON question_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_sops_updated_at BEFORE UPDATE ON generated_sops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_analysis_updated_at BEFORE UPDATE ON automation_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commercial_proposals_updated_at BEFORE UPDATE ON commercial_proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_processing_records_updated_at BEFORE UPDATE ON data_processing_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function para audit logging automático
CREATE OR REPLACE FUNCTION audit_data_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (action, entity_type, entity_id, details, sensitive_data_accessed)
    VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'timestamp', NOW()
        ),
        TG_TABLE_NAME IN ('clients', 'form_responses', 'commercial_proposals')
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers para audit logging en tablas sensibles
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION audit_data_access();

CREATE TRIGGER audit_form_responses AFTER INSERT OR UPDATE OR DELETE ON form_responses
    FOR EACH ROW EXECUTE FUNCTION audit_data_access();

CREATE TRIGGER audit_commercial_proposals AFTER INSERT OR UPDATE OR DELETE ON commercial_proposals
    FOR EACH ROW EXECUTE FUNCTION audit_data_access();

-- ==============================================
-- VIEWS FOR REPORTING AND ANALYTICS
-- ==============================================

-- Vista para dashboard de clientes
CREATE VIEW client_dashboard AS
SELECT 
    c.id,
    c.name,
    c.current_status,
    i.display_name_es as industry_name,
    c.company_size,
    c.created_at,
    f.status as form_status,
    f.completion_percentage,
    ai.status as ai_processing_status,
    ai.process_count,
    COUNT(s.id) as sops_count,
    p.status as proposal_status
FROM clients c
LEFT JOIN industries i ON c.industry_id = i.id
LEFT JOIN generated_forms f ON c.id = f.client_id
LEFT JOIN ai_processing_jobs ai ON c.id = ai.client_id
LEFT JOIN generated_sops s ON c.id = s.client_id
LEFT JOIN commercial_proposals p ON c.id = p.client_id
GROUP BY c.id, c.name, c.current_status, i.display_name_es, c.company_size, c.created_at, 
         f.status, f.completion_percentage, ai.status, ai.process_count, p.status;

-- Vista para métricas de performance
CREATE VIEW performance_metrics AS
SELECT 
    metric_type,
    AVG(value_ms) as avg_time_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value_ms) as p95_time_ms,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value_ms) as p99_time_ms,
    COUNT(*) as sample_count,
    DATE_TRUNC('hour', created_at) as hour_bucket
FROM system_metrics 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY metric_type, DATE_TRUNC('hour', created_at)
ORDER BY hour_bucket DESC;

-- Vista para business KPIs
CREATE VIEW business_kpis AS
SELECT 
    COUNT(DISTINCT c.id) FILTER (WHERE c.created_at >= DATE_TRUNC('month', NOW())) as monthly_clients,
    COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'completed') * 100.0 / 
        NULLIF(COUNT(DISTINCT f.id) FILTER (WHERE f.status IN ('sent', 'in_progress', 'completed')), 0) as form_completion_rate,
    COUNT(DISTINCT s.id) FILTER (WHERE s.is_approved = true) * 100.0 / 
        NULLIF(COUNT(DISTINCT s.id), 0) as sop_approval_rate,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'accepted') * 100.0 / 
        NULLIF(COUNT(DISTINCT p.id) FILTER (WHERE p.status IN ('sent', 'accepted', 'rejected')), 0) as proposal_conversion_rate
FROM clients c
LEFT JOIN generated_forms f ON c.id = f.client_id
LEFT JOIN generated_sops s ON c.id = s.client_id
LEFT JOIN commercial_proposals p ON c.id = p.client_id;

-- ==============================================
-- INITIAL DATA SETUP
-- ==============================================

-- Crear usuario admin inicial
INSERT INTO users (email, name, role) VALUES 
('admin@sistema-sop.com', 'Administrador Sistema', 'admin'),
('consultor@sistema-sop.com', 'Consultor Principal', 'senior_consultant');

-- ==============================================
-- SECURITY POLICIES (Row Level Security)
-- ==============================================

-- Habilitar RLS en tablas sensibles
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para consultores: solo pueden ver sus clientes
CREATE POLICY consultant_clients ON clients
    FOR ALL TO authenticated
    USING (created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'senior_consultant')));

-- Política para responses: solo pueden ver responses de sus clientes
CREATE POLICY consultant_responses ON form_responses
    FOR ALL TO authenticated
    USING (client_id IN (
        SELECT id FROM clients WHERE created_by = auth.uid()
    ) OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'senior_consultant')));

-- ==============================================
-- PERFORMANCE OPTIMIZATIONS
-- ==============================================

-- Partitioning para audit_logs (por mes)
CREATE TABLE audit_logs_template (LIKE audit_logs INCLUDING ALL);

-- Función para crear particiones mensuales automáticamente
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I 
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- Crear partición inicial para audit_logs
SELECT create_monthly_partition('audit_logs', DATE_TRUNC('month', NOW()));

-- ==============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ==============================================

COMMENT ON TABLE clients IS 'Tabla principal de clientes con clasificación automática por IA y workflow states';
COMMENT ON TABLE industries IS 'Base de conocimiento de las 13 industrias prioritarias con procesos típicos';
COMMENT ON TABLE question_templates IS 'Templates de preguntas específicas por industria y tamaño de empresa';
COMMENT ON TABLE generated_forms IS 'Formularios generados vía Tally Forms API con tracking de progreso';
COMMENT ON TABLE form_responses IS 'Respuestas de formularios recibidas vía webhook con validación de calidad';
COMMENT ON TABLE ai_processing_jobs IS 'Jobs de procesamiento con sistema multiagente existente';
COMMENT ON TABLE identified_processes IS 'Procesos identificados por IA con categorización y priorización';
COMMENT ON TABLE generated_sops IS 'SOPs estructurados generados con validación automática de calidad';
COMMENT ON TABLE automation_analysis IS 'Análisis de automatización con matriz de priorización';
COMMENT ON TABLE commercial_proposals IS 'Propuestas comerciales generadas automáticamente';
COMMENT ON TABLE audit_logs IS 'Log de auditoría para compliance LGPD';
COMMENT ON TABLE data_processing_records IS 'Registros de procesamiento de datos para LGPD';

-- ==============================================
-- FINAL VERIFICATION
-- ==============================================

-- Verificar que todas las constraints y reglas de negocio están implementadas
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Mensaje de finalización
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Tables: % | Indexes: % | Views: %', 
        (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'),
        (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public'),
        (SELECT count(*) FROM information_schema.views WHERE table_schema = 'public');
END $$;