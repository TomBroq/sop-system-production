// Base types for the SOP Dashboard System

export type ClientStatus = 
  | 'cliente_creado'
  | 'formulario_enviado'
  | 'respuestas_recibidas'
  | 'procesando_ia'
  | 'sops_generados'
  | 'propuesta_lista'
  | 'propuesta_enviada'
  | 'cerrado'
  | 'cancelado'
  | 'error_procesamiento'
  | 'expirado';

export type CompanySize = 'micro' | 'pequena' | 'mediana' | 'grande';

export type Priority = 'baja' | 'media' | 'alta' | 'critica';

export type IndustryType = 
  | 'contabilidad'
  | 'inmobiliaria'
  | 'ventas'
  | 'agricola'
  | 'licitaciones'
  | 'startups-ti'
  | 'consultas-medicas'
  | 'telecomunicaciones'
  | 'energia-solar'
  | 'hoteleria'
  | 'consultoria'
  | 'venta-masiva'
  | 'arquitectura';

export type ProcessType = 'primario' | 'soporte' | 'gestion';

export type AutomationFeasibility = 'baja' | 'media' | 'alta';

export type ProjectPhase = 'quick-wins' | 'medium-term' | 'complex' | 'future';

// Core entities
export interface Client {
  id: string;
  nombre: string;
  industria: IndustryType;
  subindustria?: string;
  tamano: CompanySize;
  anos_operacion: number;
  empleados_count: number;
  estado: ClientStatus;
  fecha_creacion: string;
  fecha_actualizacion: string;
  email_contacto: string;
  telefono?: string;
  descripcion?: string;
  pais: string;
  ciudad: string;
  // Campos calculados
  procesos_identificados?: number;
  sops_generados?: number;
  propuesta_valor?: number;
  probabilidad_cierre?: number;
  // Relaciones
  formularios?: Form[];
  sops?: SOP[];
  propuestas?: Proposal[];
  analytics?: ClientAnalytics;
}

export interface Form {
  id: string;
  client_id: string;
  tally_form_id: string;
  title: string;
  description?: string;
  estado: 'creado' | 'enviado' | 'completado' | 'expirado';
  fecha_creacion: string;
  fecha_envio?: string;
  fecha_completado?: string;
  fecha_expiracion: string;
  link_publico: string;
  preguntas_count: number;
  respuestas_count?: number;
  tiempo_completado?: number; // en minutos
  // Configuración dinámica
  industria_config: IndustryConfig;
  preguntas: Question[];
  respuestas?: FormResponse[];
}

export interface Question {
  id: string;
  tipo: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date' | 'boolean';
  pregunta: string;
  descripcion?: string;
  opciones?: string[];
  requerida: boolean;
  orden: number;
  categoria: string;
  peso_analisis: number; // Para IA processing
}

export interface FormResponse {
  id: string;
  form_id: string;
  question_id: string;
  respuesta: string | string[] | number | boolean;
  fecha_respuesta: string;
}

export interface SOP {
  id: string;
  client_id: string;
  nombre: string;
  descripcion: string;
  tipo_proceso: ProcessType;
  objetivo: string;
  responsables: string[];
  inputs: string[];
  pasos: SOPStep[];
  outputs: string[];
  estimacion_tiempo: number; // en minutos
  frecuencia: string;
  complejidad: Priority;
  estado: 'borrador' | 'revision' | 'aprobado' | 'rechazado';
  fecha_creacion: string;
  fecha_aprobacion?: string;
  notas_revision?: string;
  // Análisis de automatización
  automation_score: number; // 0-100
  automation_feasibility: AutomationFeasibility;
  roi_estimado?: number;
  costo_implementacion?: number;
  tiempo_implementacion?: number; // en semanas
  herramientas_sugeridas: string[];
}

export interface SOPStep {
  orden: number;
  descripcion: string;
  responsable: string;
  tiempo_estimado: number;
  sistemas_involucrados: string[];
  es_automatizable: boolean;
  complejidad_automatizacion: Priority;
}

export interface Proposal {
  id: string;
  client_id: string;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_envio?: string;
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada' | 'negociacion';
  valor_propuesta: number;
  roi_estimado: number;
  tiempo_implementacion: number; // en meses
  fases: ProposalPhase[];
  procesos_incluidos: string[]; // SOP IDs
  pdf_url?: string;
  notas?: string;
}

export interface ProposalPhase {
  nombre: string;
  descripcion: string;
  duracion: number; // en semanas
  costo: number;
  procesos: string[];
  hitos: string[];
  tipo: ProjectPhase;
}

// Analytics and metrics
export interface DashboardMetrics {
  clientes_activos: number;
  formularios_completados: number;
  formularios_pendientes: number;
  sops_generados: number;
  propuestas_enviadas: number;
  propuestas_aceptadas: number;
  valor_pipeline: number;
  conversion_rate: number;
  tiempo_promedio_proceso: number; // en días
  satisfaccion_promedio: number;
}

export interface ClientAnalytics {
  client_id: string;
  tiempo_en_proceso: number; // días desde creación
  progreso_percentage: number;
  procesos_automatizables: number;
  roi_total_estimado: number;
  prioridad_comercial: Priority;
  probabilidad_cierre: number;
  valor_contrato_estimado: number;
  actividad_reciente: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  tipo: 'client_created' | 'form_sent' | 'form_completed' | 'sop_generated' | 'proposal_sent' | 'proposal_updated' | 'error_occurred';
  descripcion: string;
  fecha: string;
  usuario?: string;
  metadata?: Record<string, any>;
}

// Knowledge base and industry data
export interface IndustryConfig {
  industria: IndustryType;
  nombre_display: string;
  descripcion: string;
  procesos_tipicos: string[];
  pain_points_comunes: string[];
  herramientas_estandar: string[];
  regulaciones?: string[];
  benchmarks: IndustryBenchmark[];
  preguntas_base: Question[];
}

export interface IndustryBenchmark {
  proceso: string;
  tiempo_manual: number; // horas/mes
  costo_manual: number; // USD/mes
  potencial_ahorro: number; // %
  complejidad_automatizacion: Priority;
  roi_promedio: number; // %
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form and validation types
export interface CreateClientRequest {
  nombre: string;
  industria: IndustryType;
  tamano: CompanySize;
  anos_operacion: number;
  empleados_count: number;
  email_contacto: string;
  telefono?: string;
  descripcion?: string;
  pais: string;
  ciudad: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  estado?: ClientStatus;
}

export interface FormFilters {
  estado?: ClientStatus;
  industria?: IndustryType;
  tamano?: CompanySize;
  fecha_desde?: string;
  fecha_hasta?: string;
  busqueda?: string;
}

// Real-time and notifications
export interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface WebSocketMessage {
  type: 'client_updated' | 'form_completed' | 'sop_generated' | 'error_occurred' | 'notification';
  data: any;
  timestamp: string;
}

// UI State types
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;