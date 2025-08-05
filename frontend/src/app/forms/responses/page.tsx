'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FormResponsesViewer } from '@/components/forms/form-responses-viewer'
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
  ArrowLeft,
  Search,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Brain,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'
import { formatRelativeTime, getStatusColor } from '@/lib/utils'
import type { Form, Client } from '@/types'

export default function FormResponsesPage() {
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [completedForms, setCompletedForms] = useState<Array<Form & { client: Client }>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCompletedForms()
  }, [])

  const loadCompletedForms = async () => {
    setLoading(true)
    try {
      // Mock data for completed forms
      const mockForms = [
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
            industria: 'startups-ti' as const,
            nombre_display: 'Startups TI',
            descripcion: 'Empresas de tecnología y startups',
            procesos_tipicos: [],
            pain_points_comunes: [],
            herramientas_estandar: [],
            benchmarks: [],
            preguntas_base: []
          },
          preguntas: [
            {
              id: 'q1',
              tipo: 'text' as const,
              pregunta: '¿Cuáles son los principales servicios que ofrece su empresa?',
              descripcion: 'Describe los servicios principales de tu empresa',
              opciones: [],
              requerida: true,
              orden: 1,
              categoria: 'servicios',
              peso_analisis: 3
            },
            {
              id: 'q2',
              tipo: 'number' as const,
              pregunta: '¿Cuántos clientes atienden mensualmente?',
              descripcion: 'Número aproximado de clientes por mes',
              opciones: [],
              requerida: true,
              orden: 2,
              categoria: 'volumen',
              peso_analisis: 2
            }
          ],
          client: {
            id: 'client-1',
            nombre: 'Innovación Tech S.A.',
            industria: 'startups-ti' as const,
            tamano: 'pequena' as const,
            anos_operacion: 3,
            empleados_count: 25,
            estado: 'respuestas_recibidas' as const,
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
          title: 'Diagnóstico Empresarial - Servicios Profesionales XYZ',
          description: 'Formulario de levantamiento de procesos para empresa de servicios',
          estado: 'completado',
          fecha_creacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          fecha_completado: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
          fecha_expiracion: new Date(Date.now() + 1000 * 60 * 60 * 24 * 23).toISOString(),
          link_publico: 'https://tally.so/r/mYvPq1',
          preguntas_count: 22,
          respuestas_count: 22,
          tiempo_completado: 38,
          industria_config: {
            industria: 'consultoria' as const,
            nombre_display: 'Consultoría',
            descripcion: 'Empresas de consultoría profesional',
            procesos_tipicos: [],
            pain_points_comunes: [],
            herramientas_estandar: [],
            benchmarks: [],
            preguntas_base: []
          },
          preguntas: [],
          client: {
            id: 'client-2',
            nombre: 'Servicios Profesionales XYZ',
            industria: 'consultoria' as const,
            tamano: 'mediana' as const,
            anos_operacion: 8,
            empleados_count: 45,
            estado: 'sops_generados' as const,
            fecha_creacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
            fecha_actualizacion: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
            email_contacto: 'info@serviciosxyz.com',
            pais: 'México',
            ciudad: 'Monterrey'
          }
        }
      ]
      
      setCompletedForms(mockForms as any)
    } catch (error) {
      console.error('Error loading completed forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewResponses = (form: Form & { client: Client }) => {
    setSelectedForm(form)
  }

  const handleBackToList = () => {
    setSelectedForm(null)
  }

  const filteredForms = completedForms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.client.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalResponses = completedForms.reduce((acc, form) => acc + (form.respuestas_count || 0), 0)
  const avgCompletionTime = completedForms.reduce((acc, form) => acc + (form.tiempo_completado || 0), 0) / completedForms.length
  const totalProcessed = completedForms.filter(form => form.client.estado === 'sops_generados').length

  if (selectedForm) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={handleBackToList} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
          
          <FormResponsesViewer 
            form={selectedForm}
            client={completedForms.find(f => f.id === selectedForm.id)?.client}
            onProcessResponses={() => {
              // Handle AI processing
              console.log('Processing responses with AI...')
            }}
            onGenerateSOPs={() => {
              // Navigate to SOPs
              console.log('Navigate to SOPs...')
            }}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Respuestas de Formularios</h1>
            <p className="text-muted-foreground">
              Revisa y procesa las respuestas completadas de tus clientes
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Todo
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="dashboard-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Formularios Completados</p>
                  <p className="text-2xl font-bold text-foreground">{completedForms.length}</p>
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
                  <p className="text-sm text-muted-foreground">Total Respuestas</p>
                  <p className="text-2xl font-bold text-blue-600">{totalResponses}</p>
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
                  <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(avgCompletionTime)}min</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Procesados con IA</p>
                  <p className="text-2xl font-bold text-orange-600">{totalProcessed}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Brain className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Formularios Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente o formulario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Forms Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente / Formulario</TableHead>
                    <TableHead>Industria</TableHead>
                    <TableHead>Completado</TableHead>
                    <TableHead>Respuestas</TableHead>
                    <TableHead>Estado Procesamiento</TableHead>
                    <TableHead className="w-[150px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded loading-skeleton" />
                            <div className="h-3 w-48 bg-muted rounded loading-skeleton" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-20 bg-muted rounded loading-skeleton" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 bg-muted rounded loading-skeleton" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-16 bg-muted rounded loading-skeleton" />
                        </TableCell>
                        <TableCell>
                          <div className="h-6 w-20 bg-muted rounded-full loading-skeleton" />
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-24 bg-muted rounded loading-skeleton" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredForms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        {searchTerm ? (
                          <>
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              No se encontraron formularios
                            </h3>
                            <p className="text-muted-foreground">
                              Intenta ajustar los términos de búsqueda
                            </p>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              No hay formularios completados
                            </h3>
                            <p className="text-muted-foreground">
                              Los formularios completados aparecerán aquí
                            </p>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredForms.map((form) => (
                      <TableRow key={form.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">
                              {form.client.nombre}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {form.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {form.client.email_contacto}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="secondary">
                            {form.industria_config.nombre_display}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {formatRelativeTime(form.fecha_completado!)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {form.tiempo_completado}min
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium text-green-600">
                              {form.respuestas_count}/{form.preguntas_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              100% completo
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge 
                            className={getStatusColor(form.client.estado)}
                          >
                            {form.client.estado === 'sops_generados' ? 'Procesado' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewResponses(form)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            
                            {form.client.estado !== 'sops_generados' && (
                              <Button
                                size="sm"
                                variant="secondary"
                              >
                                <Brain className="h-3 w-3 mr-1" />
                                Procesar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Processing Tips */}
        <Card className="dashboard-card bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Procesamiento IA</h3>
                <p className="text-sm text-muted-foreground">
                  Nuestro sistema analiza automáticamente las respuestas e identifica procesos clave
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Análisis Automático</h3>
                <p className="text-sm text-muted-foreground">
                  Genera insights sobre oportunidades de automatización y optimización
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-foreground mb-2">SOPs Automatizados</h3>
                <p className="text-sm text-muted-foreground">
                  Convierte respuestas en documentación estructurada de procesos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}