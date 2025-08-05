'use client'

import { useState, useEffect } from 'react'
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
  FileText,
  Search,
  Filter,
  Eye,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Download,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  Users,
  TrendingUp,
  Copy
} from 'lucide-react'
import { formatDate, formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils'
import type { Form, Client } from '@/types'
import { formsApi, clientsApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface FormWithClient extends Form {
  client?: Client
}

export function FormsDashboard() {
  const [forms, setForms] = useState<FormWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'creado' | 'enviado' | 'completado' | 'expirado'>('all')
  const [selectedForms, setSelectedForms] = useState<string[]>([])

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would be a proper API call to get all forms
      const mockForms: FormWithClient[] = [
        {
          id: '1',
          client_id: 'client-1',
          tally_form_id: 'tally-123',
          title: 'Diagnóstico Empresarial - Innovación Tech S.A.',
          description: 'Formulario de levantamiento de procesos para empresa de tecnología',
          estado: 'completado',
          fecha_creacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          fecha_envio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          fecha_completado: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          fecha_expiracion: new Date(Date.now() + 1000 * 60 * 60 * 24 * 27).toISOString(),
          link_publico: 'https://tally.so/r/3xyWAa',
          preguntas_count: 25,
          respuestas_count: 25,
          tiempo_completado: 45,
          industria_config: {
            industria: 'startups-ti',
            nombre_display: 'Startups TI',
            descripcion: 'Empresas de tecnología y startups',
            procesos_tipicos: [],
            pain_points_comunes: [],
            herramientas_estandar: [],
            benchmarks: [],
            preguntas_base: []
          },
          preguntas: [],
          client: {
            id: 'client-1',
            nombre: 'Innovación Tech S.A.',
            industria: 'startups-ti',
            tamano: 'pequena',
            anos_operacion: 3,
            empleados_count: 25,
            estado: 'respuestas_recibidas',
            fecha_creacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            fecha_actualizacion: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            email_contacto: 'contacto@innovaciontech.com',
            pais: 'México',
            ciudad: 'Ciudad de México'
          }
        },
        {
          id: '2',
          client_id: 'client-2',
          tally_form_id: 'tally-456',
          title: 'Diagnóstico Empresarial - Constructora ABC',
          description: 'Formulario de levantamiento de procesos para constructora',
          estado: 'enviado',
          fecha_creacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
          fecha_envio: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          fecha_expiracion: new Date(Date.now() + 1000 * 60 * 60 * 24 * 29).toISOString(),
          link_publico: 'https://tally.so/r/mYvPq1',
          preguntas_count: 30,
          industria_config: {
            industria: 'arquitectura',
            nombre_display: 'Arquitectura',
            descripcion: 'Empresas de construcción y arquitectura',
            procesos_tipicos: [],
            pain_points_comunes: [],
            herramientas_estandar: [],
            benchmarks: [],
            preguntas_base: []
          },
          preguntas: [],
          client: {
            id: 'client-2',
            nombre: 'Constructora ABC',
            industria: 'arquitectura',
            tamano: 'mediana',
            anos_operacion: 15,
            empleados_count: 85,
            estado: 'formulario_enviado',
            fecha_creacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            fecha_actualizacion: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
            email_contacto: 'info@constructoraabc.com',
            pais: 'México',
            ciudad: 'Guadalajara'
          }
        }
      ]
      
      setForms(mockForms)
    } catch (error) {
      console.error('Error loading forms:', error)
      toast.error('Error al cargar formularios')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async (form: FormWithClient) => {
    try {
      await navigator.clipboard.writeText(form.link_publico)
      toast.success('Link copiado al portapapeles')
    } catch (error) {
      toast.error('Error al copiar link')
    }
  }

  const handleSendReminder = async (formId: string) => {
    try {
      // In real implementation, this would send a reminder email
      toast.success('Recordatorio enviado')
    } catch (error) {
      toast.error('Error al enviar recordatorio')
    }
  }

  const handleViewResponses = (form: FormWithClient) => {
    // Navigate to responses view
    console.log('View responses for form:', form.id)
  }

  const getFormStatusIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'enviado':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'expirado':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-blue-600" />
    }
  }

  const getProgressPercentage = (form: FormWithClient) => {
    if (form.estado === 'completado') return 100
    if (form.estado === 'enviado') return 50
    if (form.estado === 'creado') return 25
    return 0
  }

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.client?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.client?.email_contacto.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || form.estado === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: forms.length,
    creado: forms.filter(f => f.estado === 'creado').length,
    enviado: forms.filter(f => f.estado === 'enviado').length,
    completado: forms.filter(f => f.estado === 'completado').length,
    expirado: forms.filter(f => f.estado === 'expirado').length,
  }

  const completionRate = forms.length > 0 
    ? Math.round((forms.filter(f => f.estado === 'completado').length / forms.length) * 100)
    : 0

  const averageCompletionTime = forms
    .filter(f => f.tiempo_completado)
    .reduce((acc, f) => acc + (f.tiempo_completado || 0), 0) / 
    forms.filter(f => f.tiempo_completado).length || 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Formularios</p>
                <p className="text-2xl font-bold text-foreground">{forms.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.completado}</p>
                <p className="text-xs text-muted-foreground">Tasa: {completionRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.enviado}</p>
                <p className="text-xs text-muted-foreground">Esperando respuesta</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(averageCompletionTime)}min
                </p>
                <p className="text-xs text-muted-foreground">Para completar</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Formularios Activos</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={loadForms}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              {selectedForms.length > 0 && (
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Acciones ({selectedForms.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, email o título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex bg-muted rounded-lg p-1">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    statusFilter === status 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {status === 'all' ? 'Todos' : status} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Forms Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input type="checkbox" className="rounded" />
                  </TableHead>
                  <TableHead>Cliente / Formulario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Respuestas</TableHead>
                  <TableHead className="w-[200px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={selectedForms.includes(form.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedForms([...selectedForms, form.id])
                          } else {
                            setSelectedForms(selectedForms.filter(id => id !== form.id))
                          }
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">
                          {form.client?.nombre}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {form.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {form.client?.email_contacto}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getFormStatusIcon(form.estado)}
                        <Badge className={getStatusColor(form.estado as any)}>
                          {form.estado}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${getProgressPercentage(form)}%` }}
                          />
                        </div>
                        <div className="text-xs text-center text-muted-foreground">
                          {getProgressPercentage(form)}%
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Creado: {formatRelativeTime(form.fecha_creacion)}</span>
                        </div>
                        {form.fecha_envio && (
                          <div className="flex items-center space-x-1">
                            <Send className="h-3 w-3 text-muted-foreground" />
                            <span>Enviado: {formatRelativeTime(form.fecha_envio)}</span>
                          </div>
                        )}
                        {form.fecha_completado && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>Completado: {formatRelativeTime(form.fecha_completado)}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-center">
                        {form.respuestas_count ? (
                          <div>
                            <div className="font-medium text-green-600">
                              {form.respuestas_count}/{form.preguntas_count}
                            </div>
                            {form.tiempo_completado && (
                              <div className="text-xs text-muted-foreground">
                                {form.tiempo_completado}min
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(form)}
                          title="Copiar link"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        
                        {form.estado === 'enviado' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendReminder(form.id)}
                            title="Enviar recordatorio"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {form.estado === 'completado' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResponses(form)}
                            title="Ver respuestas"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Más opciones"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredForms.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron formularios' 
                  : 'No hay formularios creados'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Los formularios aparecerán aquí cuando crees clientes'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}