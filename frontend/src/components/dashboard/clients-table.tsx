'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  Filter,
  Plus,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react'
import { useDashboardStore, useClients } from '@/store/dashboard-store'
import { 
  getStatusColor, 
  getStatusLabel, 
  getIndustryLabel, 
  getCompanySizeLabel,
  formatDate,
  formatRelativeTime,
  calculateClientProgress,
  getProgressColor
} from '@/lib/utils'
import type { Client, ClientStatus, IndustryType, CompanySize } from '@/types'

interface ClientsTableProps {
  onClientSelect?: (client: Client) => void
  onCreateClient?: () => void
  compact?: boolean
}

export function ClientsTable({ onClientSelect, onCreateClient, compact = false }: ClientsTableProps) {
  const { clients, loading, error, total, page, perPage } = useClients()
  const { fetchClients, setFilters, filters } = useDashboardStore()
  
  const [searchTerm, setSearchTerm] = useState(filters.busqueda || '')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | ''>('')
  const [industryFilter, setIndustryFilter] = useState<IndustryType | ''>('')

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ busqueda: searchTerm })
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, setFilters])

  const handleStatusFilter = (status: ClientStatus | '') => {
    setStatusFilter(status)
    setFilters({ estado: status || undefined })
  }

  const handleIndustryFilter = (industry: IndustryType | '') => {
    setIndustryFilter(industry)
    setFilters({ industria: industry || undefined })
  }

  const handlePageChange = (newPage: number) => {
    fetchClients(newPage)
  }

  const getProgressPercentage = (client: Client) => {
    return calculateClientProgress(client.estado)
  }

  const getPriorityIndicator = (client: Client) => {
    // Lógica simple de prioridad basada en valor potencial y tiempo
    const daysInProcess = Math.floor(
      (new Date().getTime() - new Date(client.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (client.propuesta_valor && client.propuesta_valor > 50000) return 'alta'
    if (daysInProcess > 14) return 'alta'
    if (client.estado === 'error_procesamiento') return 'critica'
    return 'media'
  }

  if (loading && clients.length === 0) {
    return <ClientsTableLoading compact={compact} />
  }

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">
              Lista de Clientes
              {total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {total} total
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona y monitorea el progreso de tus clientes
            </p>
          </div>
          
          {onCreateClient && (
            <Button onClick={onCreateClient} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as ClientStatus | '')}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="cliente_creado">Cliente Creado</option>
            <option value="formulario_enviado">Formulario Enviado</option>
            <option value="respuestas_recibidas">Respuestas Recibidas</option>
            <option value="procesando_ia">Procesando IA</option>
            <option value="sops_generados">SOPs Generados</option>
            <option value="propuesta_lista">Propuesta Lista</option>
            <option value="propuesta_enviada">Propuesta Enviada</option>
            <option value="cerrado">Cerrado</option>
          </select>

          <select
            value={industryFilter}
            onChange={(e) => handleIndustryFilter(e.target.value as IndustryType | '')}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="">Todas las industrias</option>
            <option value="contabilidad">Contabilidad</option>
            <option value="inmobiliaria">Inmobiliaria</option>
            <option value="ventas">Ventas</option>
            <option value="consultoria">Consultoría</option>
            <option value="startups-ti">Startups TI</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-8">
            <p className="text-error-600 mb-4">{error}</p>
            <Button onClick={() => fetchClients()}>Reintentar</Button>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay clientes</h3>
            <p className="text-muted-foreground mb-4">
              {filters.busqueda || filters.estado || filters.industria
                ? 'No se encontraron clientes con los filtros aplicados'
                : 'Comienza creando tu primer cliente'}
            </p>
            {onCreateClient && (
              <Button onClick={onCreateClient}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Cliente
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Industria</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Progreso</TableHead>
                    {!compact && <TableHead>Creación</TableHead>}
                    {!compact && <TableHead>Valor Est.</TableHead>}
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow 
                      key={client.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onClientSelect?.(client)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            getPriorityIndicator(client) === 'critica' ? 'bg-red-500' :
                            getPriorityIndicator(client) === 'alta' ? 'bg-orange-500' :
                            'bg-green-500'
                          }`} />
                          <div>
                            <div className="font-medium text-foreground">
                              {client.nombre}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getCompanySizeLabel(client.tamano)} • {client.empleados_count} empleados
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {getIndustryLabel(client.industria)}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusColor(client.estado)}>
                          {getStatusLabel(client.estado)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${getProgressColor(getProgressPercentage(client))}`}
                              style={{ width: `${getProgressPercentage(client)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground min-w-[40px]">
                            {getProgressPercentage(client)}%
                          </span>
                        </div>
                      </TableCell>
                      
                      {!compact && (
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatRelativeTime(client.fecha_creacion)}</span>
                          </div>
                        </TableCell>
                      )}
                      
                      {!compact && (
                        <TableCell>
                          {client.propuesta_valor ? (
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-600">
                                ${client.propuesta_valor.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              onClientSelect?.(client)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {total > perPage && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, total)} de {total} clientes
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= Math.ceil(total / perPage)}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function ClientsTableLoading({ compact }: { compact: boolean }) {
  return (
    <Card className="dashboard-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <div className="h-6 w-32 bg-muted rounded loading-skeleton mb-2" />
            <div className="h-4 w-48 bg-muted rounded loading-skeleton" />
          </div>
          <div className="h-9 w-32 bg-muted rounded loading-skeleton" />
        </div>
        <div className="flex gap-3 mt-4">
          <div className="h-10 flex-1 bg-muted rounded loading-skeleton" />
          <div className="h-10 w-32 bg-muted rounded loading-skeleton" />
          <div className="h-10 w-32 bg-muted rounded loading-skeleton" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-3 h-3 bg-muted rounded-full loading-skeleton" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-muted rounded loading-skeleton mb-2" />
                <div className="h-3 w-24 bg-muted rounded loading-skeleton" />
              </div>
              <div className="h-6 w-16 bg-muted rounded-full loading-skeleton" />
              <div className="h-6 w-20 bg-muted rounded-full loading-skeleton" />
              {!compact && (
                <>
                  <div className="h-4 w-16 bg-muted rounded loading-skeleton" />
                  <div className="h-4 w-20 bg-muted rounded loading-skeleton" />
                </>
              )}
              <div className="h-8 w-16 bg-muted rounded loading-skeleton" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}