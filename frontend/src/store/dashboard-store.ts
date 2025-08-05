import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { 
  DashboardMetrics, 
  Client, 
  NotificationItem, 
  FormFilters,
  ClientStatus,
  IndustryType,
  CompanySize 
} from '@/types'
import { dashboardApi, clientsApi } from '@/lib/api'

interface DashboardState {
  // Metrics data
  metrics: DashboardMetrics | null
  metricsLoading: boolean
  metricsError: string | null
  
  // Clients data
  clients: Client[]
  clientsLoading: boolean
  clientsError: string | null
  clientsTotal: number
  clientsPage: number
  clientsPerPage: number
  
  // Filters
  filters: FormFilters
  
  // Selected client for detailed view
  selectedClient: Client | null
  selectedClientLoading: boolean
  
  // Notifications 
  notifications: NotificationItem[]
  unreadCount: number
  
  // Real-time connection status
  isConnected: boolean
  lastUpdate: string | null
  
  // UI state
  sidebarCollapsed: boolean
  isDarkMode: boolean
}

interface DashboardActions {
  // Metrics actions
  fetchMetrics: () => Promise<void>
  setMetrics: (metrics: DashboardMetrics) => void
  
  // Clients actions
  fetchClients: (page?: number) => Promise<void>
  setFilters: (filters: Partial<FormFilters>) => void
  clearFilters: () => void
  refreshClients: () => Promise<void>
  
  // Selected client actions
  selectClient: (clientId: string) => Promise<void>
  clearSelectedClient: () => void
  updateClientStatus: (clientId: string, status: ClientStatus) => void
  
  // Notifications actions
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  
  // Real-time actions
  setConnectionStatus: (connected: boolean) => void
  handleRealtimeUpdate: (data: any) => void
  
  // UI actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleDarkMode: () => void
  
  // Utility actions
  reset: () => void
}

type DashboardStore = DashboardState & DashboardActions

const initialState: DashboardState = {
  // Metrics
  metrics: null,
  metricsLoading: false,
  metricsError: null,
  
  // Clients
  clients: [],
  clientsLoading: false,
  clientsError: null,
  clientsTotal: 0,
  clientsPage: 1,
  clientsPerPage: 20,
  
  // Filters
  filters: {},
  
  // Selected client
  selectedClient: null,
  selectedClientLoading: false,
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  // Real-time
  isConnected: false,
  lastUpdate: null,
  
  // UI
  sidebarCollapsed: false,
  isDarkMode: false,
}

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Metrics actions
        fetchMetrics: async () => {
          set({ metricsLoading: true, metricsError: null })
          try {
            const metrics = await dashboardApi.getMetrics()
            set({ 
              metrics, 
              metricsLoading: false,
              lastUpdate: new Date().toISOString()
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error fetching metrics'
            set({ 
              metricsError: errorMessage, 
              metricsLoading: false 
            })
          }
        },
        
        setMetrics: (metrics) => {
          set({ metrics, lastUpdate: new Date().toISOString() })
        },
        
        // Clients actions
        fetchClients: async (page = 1) => {
          set({ clientsLoading: true, clientsError: null })
          try {
            const { filters, clientsPerPage } = get()
            const response = await clientsApi.getAll({
              ...filters,
              page,
              limit: clientsPerPage,
            })
            
            set({ 
              clients: response.data || [],
              clientsTotal: response.pagination?.total || 0,
              clientsPage: page,
              clientsLoading: false,
              lastUpdate: new Date().toISOString()
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error fetching clients'
            set({ 
              clientsError: errorMessage, 
              clientsLoading: false 
            })
          }
        },
        
        setFilters: (newFilters) => {
          const currentFilters = get().filters
          const updatedFilters = { ...currentFilters, ...newFilters }
          set({ filters: updatedFilters, clientsPage: 1 })
          
          // Auto-fetch with new filters
          get().fetchClients(1)
        },
        
        clearFilters: () => {
          set({ filters: {}, clientsPage: 1 })
          get().fetchClients(1)
        },
        
        refreshClients: async () => {
          const { clientsPage } = get()
          await get().fetchClients(clientsPage)
        },
        
        // Selected client actions
        selectClient: async (clientId) => {
          set({ selectedClientLoading: true })
          try {
            const client = await clientsApi.getById(clientId)
            set({ 
              selectedClient: client,
              selectedClientLoading: false 
            })
          } catch (error) {
            console.error('Error selecting client:', error)
            set({ selectedClientLoading: false })
          }
        },
        
        clearSelectedClient: () => {
          set({ selectedClient: null })
        },
        
        updateClientStatus: (clientId, status) => {
          const { clients, selectedClient } = get()
          
          // Update in clients list
          const updatedClients = clients.map(client => 
            client.id === clientId 
              ? { ...client, estado: status, fecha_actualizacion: new Date().toISOString() }
              : client
          )
          
          // Update selected client if it matches
          const updatedSelectedClient = selectedClient?.id === clientId 
            ? { ...selectedClient, estado: status, fecha_actualizacion: new Date().toISOString() }
            : selectedClient
          
          set({ 
            clients: updatedClients,
            selectedClient: updatedSelectedClient
          })
        },
        
        // Notifications actions
        addNotification: (notification) => {
          const newNotification: NotificationItem = {
            ...notification,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false,
          }
          
          const { notifications } = get()
          set({ 
            notifications: [newNotification, ...notifications].slice(0, 50), // Keep only last 50
            unreadCount: get().unreadCount + 1
          })
        },
        
        markNotificationRead: (notificationId) => {
          const { notifications, unreadCount } = get()
          const updatedNotifications = notifications.map(notif =>
            notif.id === notificationId && !notif.read
              ? { ...notif, read: true }
              : notif
          )
          
          const wasUnread = notifications.find(n => n.id === notificationId && !n.read)
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount
          })
        },
        
        markAllNotificationsRead: () => {
          const { notifications } = get()
          const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }))
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: 0
          })
        },
        
        clearNotifications: () => {
          set({ 
            notifications: [],
            unreadCount: 0
          })
        },
        
        // Real-time actions
        setConnectionStatus: (connected) => {
          set({ isConnected: connected })
        },
        
        handleRealtimeUpdate: (data) => {
          const { type, payload } = data
          
          switch (type) {
            case 'client_updated':
              get().updateClientStatus(payload.client_id, payload.status)
              get().addNotification({
                type: 'info',
                title: 'Cliente Actualizado',
                message: `El cliente ${payload.client_name} ha sido actualizado`,
                action_url: `/clients/${payload.client_id}`,
              })
              break
              
            case 'form_completed':
              get().addNotification({
                type: 'success',
                title: 'Formulario Completado',
                message: `${payload.client_name} ha completado el formulario`,
                action_url: `/clients/${payload.client_id}`,
              })
              // Refresh metrics and clients
              get().fetchMetrics()
              get().refreshClients()
              break
              
            case 'sop_generated':
              get().addNotification({
                type: 'success',
                title: 'SOPs Generados',
                message: `Se han generado ${payload.sop_count} SOPs para ${payload.client_name}`,
                action_url: `/clients/${payload.client_id}/sops`,
              })
              break
              
            case 'error_occurred':
              get().addNotification({
                type: 'error',
                title: 'Error del Sistema',
                message: payload.message || 'Ha ocurrido un error en el procesamiento',
                action_url: payload.client_id ? `/clients/${payload.client_id}` : undefined,
              })
              break
              
            default:
              console.log('Unhandled real-time update:', type, payload)
          }
          
          set({ lastUpdate: new Date().toISOString() })
        },
        
        // UI actions
        toggleSidebar: () => {
          set({ sidebarCollapsed: !get().sidebarCollapsed })
        },
        
        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed })
        },
        
        toggleDarkMode: () => {
          const { isDarkMode } = get()
          set({ isDarkMode: !isDarkMode })
          
          // Update document class for dark mode
          if (typeof document !== 'undefined') {
            if (!isDarkMode) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
        },
        
        // Utility actions
        reset: () => {
          set(initialState)
        },
      }),
      {
        name: 'sop-dashboard-store',
        partialize: (state) => ({
          // Only persist UI preferences and filters
          sidebarCollapsed: state.sidebarCollapsed,
          isDarkMode: state.isDarkMode,
          filters: state.filters,
          clientsPerPage: state.clientsPerPage,
        }),
      }
    ),
    { name: 'SOP Dashboard Store' }
  )
)

// Selectors for better performance
export const selectMetrics = (state: DashboardStore) => ({
  metrics: state.metrics,
  loading: state.metricsLoading,
  error: state.metricsError,
})

export const selectClients = (state: DashboardStore) => ({
  clients: state.clients,
  loading: state.clientsLoading,
  error: state.clientsError,
  total: state.clientsTotal,
  page: state.clientsPage,
  perPage: state.clientsPerPage,
})

export const selectNotifications = (state: DashboardStore) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
})

export const selectUI = (state: DashboardStore) => ({
  sidebarCollapsed: state.sidebarCollapsed,
  isDarkMode: state.isDarkMode,
  isConnected: state.isConnected,
  lastUpdate: state.lastUpdate,
})

// Helper hooks for common use cases
export const useMetrics = () => useDashboardStore(selectMetrics)
export const useClients = () => useDashboardStore(selectClients)
export const useNotifications = () => useDashboardStore(selectNotifications)
export const useUI = () => useDashboardStore(selectUI)