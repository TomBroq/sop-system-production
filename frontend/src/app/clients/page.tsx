'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ClientsTable } from '@/components/dashboard/clients-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Users,
  Building2,
  FileText,
  TrendingUp
} from 'lucide-react'
import { useDashboardStore, useClients } from '@/store/dashboard-store'
import type { Client, IndustryType, CompanySize, ClientStatus } from '@/types'

export default function ClientsPage() {
  const router = useRouter()
  const { clients, loading, total } = useClients()
  const { filters } = useDashboardStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClients, setSelectedClients] = useState<string[]>([])

  const handleClientSelect = (client: Client) => {
    router.push(`/clients/${client.id}`)
  }

  const handleCreateClient = () => {
    router.push('/clients/new')
  }

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, selectedClients)
  }

  const getStatusCounts = () => {
    return clients.reduce((acc, client) => {
      acc[client.estado] = (acc[client.estado] || 0) + 1
      return acc
    }, {} as Record<ClientStatus, number>)
  }

  const getIndustryCounts = () => {
    return clients.reduce((acc, client) => {
      acc[client.industria] = (acc[client.industria] || 0) + 1
      return acc
    }, {} as Record<IndustryType, number>)
  }

  const statusCounts = getStatusCounts()
  const industryCounts = getIndustryCounts()

  const quickStats = [
    {
      title: 'Total Clientes',
      value: total,
      description: 'Clientes registrados',
      icon: Users,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Activos',
      value: statusCounts.procesando_ia + statusCounts.formulario_enviado + statusCounts.respuestas_recibidas || 0,
      description: 'En proceso activo',
      icon: Building2,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'SOPs Generados',
      value: statusCounts.sops_generados + statusCounts.propuesta_lista + statusCounts.propuesta_enviada || 0,
      description: 'Con documentación',
      icon: FileText,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Propuestas Enviadas',
      value: statusCounts.propuesta_enviada || 0,
      description: 'Esperando respuesta',
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-100'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Clientes</h1>
            <p className="text-muted-foreground">
              Administra y monitorea el progreso de todos tus clientes
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleCreateClient}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="dashboard-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Filters & Search */}
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
              <div className="flex items-center space-x-2">
                {selectedClients.length > 0 && (
                  <>
                    <Badge variant="secondary">
                      {selectedClients.length} seleccionados
                    </Badge>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Acciones
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <select className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                <option value="">Todas las industrias</option>
                {Object.entries(industryCounts).map(([industry, count]) => (
                  <option key={industry} value={industry}>
                    {industry} ({count})
                  </option>
                ))}
              </select>
              
              <select className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                <option value="">Todos los estados</option>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <option key={status} value={status}>
                    {status} ({count})
                  </option>
                ))}
              </select>
              
              <select className="px-3 py-2 border border-input rounded-md bg-background text-sm">
                <option value="">Todos los tamaños</option>
                <option value="micro">Micro (1-10)</option>
                <option value="pequena">Pequeña (11-50)</option>
                <option value="mediana">Mediana (51-200)</option>
                <option value="grande">Grande (200+)</option>
              </select>
            </div>
            
            {/* Active Filters Display */}
            {(filters.busqueda || filters.industria || filters.estado || filters.tamano) && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-muted-foreground">Filtros activos:</span>
                {filters.busqueda && (
                  <Badge variant="secondary">
                    Búsqueda: {filters.busqueda}
                  </Badge>
                )}
                {filters.industria && (
                  <Badge variant="secondary">
                    Industria: {filters.industria}
                  </Badge>
                )}
                {filters.estado && (
                  <Badge variant="secondary">
                    Estado: {filters.estado}
                  </Badge>
                )}
                {filters.tamano && (
                  <Badge variant="secondary">
                    Tamaño: {filters.tamano}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => useDashboardStore.getState().clearFilters()}
                  className="h-6 px-2 text-xs"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clients Table */}
        <ClientsTable 
          onClientSelect={handleClientSelect}
          onCreateClient={handleCreateClient}
          compact={false}
        />

        {/* Industry Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Industria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(industryCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([industry, count]) => (
                    <div key={industry} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{industry}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(count / total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[30px]">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg">Estados del Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statusCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(count / total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[30px]">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}