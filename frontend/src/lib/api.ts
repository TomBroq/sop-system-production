import axios, { AxiosResponse } from 'axios'
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Client, 
  Form, 
  SOP, 
  Proposal,
  DashboardMetrics,
  ClientAnalytics,
  IndustryConfig,
  CreateClientRequest,
  UpdateClientRequest,
  FormFilters
} from '@/types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Generic API response handler
const handleResponse = <T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> => {
  return promise
    .then((response) => {
      const { success, data, error } = response.data
      if (!success) {
        throw new Error(error || 'API request failed')
      }
      return data as T
    })
    .catch((error) => {
      // Transform axios errors to our format
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw error
    })
}

// Dashboard Metrics API
export const dashboardApi = {
  getMetrics: (): Promise<DashboardMetrics> => 
    handleResponse(api.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics')),
  
  getRecentActivity: (limit = 10): Promise<any[]> =>
    handleResponse(api.get<ApiResponse<any[]>>(`/dashboard/activity?limit=${limit}`)),
}

// Clients API
export const clientsApi = {
  getAll: (filters?: FormFilters): Promise<PaginatedResponse<Client>> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    
    return api.get<PaginatedResponse<Client>>(`/clients?${params.toString()}`)
      .then(response => response.data)
  },
  
  getById: (id: string): Promise<Client> =>
    handleResponse(api.get<ApiResponse<Client>>(`/clients/${id}`)),
  
  create: (clientData: CreateClientRequest): Promise<Client> =>
    handleResponse(api.post<ApiResponse<Client>>('/clients', clientData)),
  
  update: (id: string, updates: UpdateClientRequest): Promise<Client> =>
    handleResponse(api.put<ApiResponse<Client>>(`/clients/${id}`, updates)),
  
  delete: (id: string): Promise<void> =>
    handleResponse(api.delete<ApiResponse<void>>(`/clients/${id}`)),
  
  getAnalytics: (id: string): Promise<ClientAnalytics> =>
    handleResponse(api.get<ApiResponse<ClientAnalytics>>(`/clients/${id}/analytics`)),
  
  classifyIndustry: (description: string): Promise<{ industria: string; confidence: number }> =>
    handleResponse(api.post<ApiResponse<{ industria: string; confidence: number }>>('/clients/classify-industry', { description })),
}

// Forms API
export const formsApi = {
  getByClientId: (clientId: string): Promise<Form[]> =>
    handleResponse(api.get<ApiResponse<Form[]>>(`/clients/${clientId}/forms`)),
  
  create: (clientId: string): Promise<Form> =>
    handleResponse(api.post<ApiResponse<Form>>(`/clients/${clientId}/forms`)),
  
  getById: (id: string): Promise<Form> =>
    handleResponse(api.get<ApiResponse<Form>>(`/forms/${id}`)),
  
  getResponses: (formId: string): Promise<any[]> =>
    handleResponse(api.get<ApiResponse<any[]>>(`/forms/${formId}/responses`)),
  
  sendToClient: (formId: string, email: string) => 
    handleResponse(api.post<ApiResponse<void>>(`/forms/${formId}/send`, { email })),
  
  processResponses: (formId: string): Promise<{ job_id: string }> =>
    handleResponse(api.post<ApiResponse<{ job_id: string }>>(`/forms/${formId}/process`)),
}

// SOPs API
export const sopsApi = {
  getByClientId: (clientId: string): Promise<SOP[]> =>
    handleResponse(api.get<ApiResponse<SOP[]>>(`/clients/${clientId}/sops`)),
  
  getById: (id: string): Promise<SOP> =>
    handleResponse(api.get<ApiResponse<SOP>>(`/sops/${id}`)),
  
  update: (id: string, updates: Partial<SOP>): Promise<SOP> =>
    handleResponse(api.put<ApiResponse<SOP>>(`/sops/${id}`, updates)),
  
  approve: (id: string, notes?: string): Promise<SOP> =>
    handleResponse(api.post<ApiResponse<SOP>>(`/sops/${id}/approve`, { notes })),
  
  reject: (id: string, notes: string): Promise<SOP> =>
    handleResponse(api.post<ApiResponse<SOP>>(`/sops/${id}/reject`, { notes })),
  
  getAutomationAnalysis: (id: string): Promise<any> =>
    handleResponse(api.get<ApiResponse<any>>(`/sops/${id}/automation-analysis`)),
}

// Proposals API
export const proposalsApi = {
  getByClientId: (clientId: string): Promise<Proposal[]> =>
    handleResponse(api.get<ApiResponse<Proposal[]>>(`/clients/${clientId}/proposals`)),
  
  create: (clientId: string): Promise<Proposal> =>
    handleResponse(api.post<ApiResponse<Proposal>>(`/clients/${clientId}/proposals`)),
  
  getById: (id: string): Promise<Proposal> =>
    handleResponse(api.get<ApiResponse<Proposal>>(`/proposals/${id}`)),
  
  update: (id: string, updates: Partial<Proposal>): Promise<Proposal> =>
    handleResponse(api.put<ApiResponse<Proposal>>(`/proposals/${id}`, updates)),
  
  generatePDF: (id: string): Promise<{ pdf_url: string }> =>
    handleResponse(api.post<ApiResponse<{ pdf_url: string }>>(`/proposals/${id}/generate-pdf`)),
  
  send: (id: string, email: string): Promise<void> =>
    handleResponse(api.post<ApiResponse<void>>(`/proposals/${id}/send`, { email })),
}

// Knowledge Base API
export const knowledgeBaseApi = {
  getIndustries: (): Promise<IndustryConfig[]> =>
    handleResponse(api.get<ApiResponse<IndustryConfig[]>>('/knowledge-base/industries')),
  
  getIndustryById: (industryId: string): Promise<IndustryConfig> =>
    handleResponse(api.get<ApiResponse<IndustryConfig>>(`/knowledge-base/industries/${industryId}`)),
  
  getQuestionTemplates: (industryId: string, companySize: string): Promise<any[]> =>
    handleResponse(api.get<ApiResponse<any[]>>(`/knowledge-base/industries/${industryId}/questions?size=${companySize}`)),
  
  getBenchmarks: (industryId: string): Promise<any[]> =>
    handleResponse(api.get<ApiResponse<any[]>>(`/knowledge-base/industries/${industryId}/benchmarks`)),
}

// Analytics & Reporting API
export const analyticsApi = {
  getKPIs: (dateRange?: { from: string; to: string }): Promise<any> => {
    const params = dateRange ? `?from=${dateRange.from}&to=${dateRange.to}` : ''
    return handleResponse(api.get<ApiResponse<any>>(`/analytics/kpis${params}`))
  },
  
  getConversionFunnel: (): Promise<any[]> =>
    handleResponse(api.get<ApiResponse<any[]>>('/analytics/conversion-funnel')),
  
  getClientProgress: (timeframe = '30d'): Promise<any[]> =>
    handleResponse(api.get<ApiResponse<any[]>>(`/analytics/client-progress?timeframe=${timeframe}`)),
  
  getFormCompletionStats: (): Promise<any> =>
    handleResponse(api.get<ApiResponse<any>>('/analytics/form-completion')),
  
  getROIAnalysis: (): Promise<any> =>
    handleResponse(api.get<ApiResponse<any>>('/analytics/roi-analysis')),
  
  exportReport: (type: string, filters: any): Promise<{ download_url: string }> =>
    handleResponse(api.post<ApiResponse<{ download_url: string }>>('/analytics/export', { type, filters })),
}

// Webhooks & Real-time API
export const webhooksApi = {
  getStatus: (): Promise<{ status: string; last_received: string }> =>
    handleResponse(api.get<ApiResponse<{ status: string; last_received: string }>>('/webhooks/status')),
  
  testWebhook: (formId: string): Promise<void> =>
    handleResponse(api.post<ApiResponse<void>>(`/webhooks/test/${formId}`)),
}

// AI Processing API
export const aiApi = {
  getProcessingStatus: (jobId: string): Promise<{ status: string; progress: number; result?: any }> =>
    handleResponse(api.get<ApiResponse<{ status: string; progress: number; result?: any }>>(`/ai/jobs/${jobId}`)),
  
  reprocessClient: (clientId: string): Promise<{ job_id: string }> =>
    handleResponse(api.post<ApiResponse<{ job_id: string }>>(`/ai/reprocess/${clientId}`)),
  
  getAvailableAgents: (): Promise<string[]> =>
    handleResponse(api.get<ApiResponse<string[]>>('/ai/agents')),
}

// Health Check API
export const healthApi = {
  check: (): Promise<{ status: string; timestamp: string; services: any }> =>
    handleResponse(api.get<ApiResponse<{ status: string; timestamp: string; services: any }>>('/health')),
}

// File Upload API
export const uploadApi = {
  uploadFile: (file: File, type: 'client-document' | 'proposal-attachment'): Promise<{ file_url: string; file_id: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return api.post<ApiResponse<{ file_url: string; file_id: string }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => {
      const { success, data, error } = response.data
      if (!success) {
        throw new Error(error || 'Upload failed')
      }
      return data as { file_url: string; file_id: string }
    })
  },
}

// Export all APIs
export {
  api as apiClient,
  API_BASE_URL,
}