'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  Send,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Eye,
  RefreshCw,
  Target
} from 'lucide-react'
import { 
  getStatusColor, 
  getStatusLabel, 
  getIndustryLabel, 
  getCompanySizeLabel,
  formatDate,
  formatRelativeTime,
  calculateClientProgress,
  getProgressColor,
  formatCurrency
} from '@/lib/utils'
import type { Client, ClientAnalytics, Form, SOP, Proposal } from '@/types'
import { clientsApi, formsApi, sopsApi, proposalsApi } from '@/lib/api'

interface ClientDetailViewProps {
  client: Client
  onUpdate?: (client: Client) => void
  onEdit?: () => void
  onDelete?: () => void
}

export function ClientDetailView({ client, onUpdate, onEdit, onDelete }: ClientDetailViewProps) {
  const [analytics, setAnalytics] = useState<ClientAnalytics | null>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [sops, setSops] = useState<SOP[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'forms' | 'sops' | 'proposals'>('overview')

  useEffect(() => {
    loadClientData()
  }, [client.id])

  const loadClientData = async () => {
    setLoading(true)
    try {
      const [analyticsData, formsData, sopsData, proposalsData] = await Promise.allSettled([
        clientsApi.getAnalytics(client.id),
        formsApi.getByClientId(client.id),
        sopsApi.getByClientId(client.id),
        proposalsApi.getByClientId(client.id)
      ])

      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value)
      }
      if (formsData.status === 'fulfilled') {
        setForms(formsData.value)
      }
      if (sopsData.status === 'fulfilled') {
        setSops(sopsData.value)
      }
      if (proposalsData.status === 'fulfilled') {
        setProposals(proposalsData.value)
      }
    } catch (error) {
      console.error('Error loading client data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendForm = async () => {
    try {
      // Logic to send form to client
      console.log('Sending form to client:', client.email_contacto)
    } catch (error) {
      console.error('Error sending form:', error)
    }
  }

  const handleGenerateProposal = async () => {
    try {
      await proposalsApi.create(client.id)
      loadClientData() // Refresh data
    } catch (error) {
      console.error('Error generating proposal:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completado':
      case 'aprobado':
      case 'cerrado':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error_procesamiento':
      case 'rechazado':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'procesando_ia':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const progressPercentage = calculateClientProgress(client.estado)

  const tabs = [
    { id: 'overview', label: 'Resumen', count: null },
    { id: 'forms', label: 'Formularios', count: forms.length },
    { id: 'sops', label: 'SOPs', count: sops.length },
    { id: 'proposals', label: 'Propuestas', count: proposals.length }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{client.nombre}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getStatusColor(client.estado)}>
                    {getStatusLabel(client.estado)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getIndustryLabel(client.industria)} • {getCompanySizeLabel(client.tamano)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progreso del Proceso</span>
              <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progressPercentage)}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Client Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{client.email_contacto}</p>
              </div>
            </div>
            
            {client.telefono && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium">{client.telefono}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p className="text-sm font-medium">{client.ciudad}, {client.pais}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Empleados</p>
                <p className="text-sm font-medium">{client.empleados_count}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          onClick={handleSendForm}
          className="h-auto p-4 justify-start"
          disabled={client.estado !== 'cliente_creado'}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Send className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium">Enviar Formulario</div>
              <div className="text-xs text-muted-foreground">Iniciar diagnóstico</div>
            </div>
          </div>
        </Button>

        <Button 
          variant="outline"
          className="h-auto p-4 justify-start"
          disabled={sops.length === 0}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Eye className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium">Revisar SOPs</div>
              <div className="text-xs text-muted-foreground">{sops.length} generados</div>
            </div>
          </div>
        </Button>

        <Button 
          variant="outline"
          onClick={handleGenerateProposal}
          className="h-auto p-4 justify-start"
          disabled={sops.length === 0}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium">Generar Propuesta</div>
              <div className="text-xs text-muted-foreground">Crear propuesta comercial</div>
            </div>
          </div>
        </Button>

        <Button 
          variant="outline"
          className="h-auto p-4 justify-start"
          disabled={proposals.length === 0}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Download className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-left">
              <div className="font-medium">Descargar PDF</div>
              <div className="text-xs text-muted-foreground">Propuesta final</div>
            </div>
          </div>
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <Badge variant="secondary" className="ml-2">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab 
            client={client} 
            analytics={analytics} 
            forms={forms}
            sops={sops}
            proposals={proposals}
          />
        )}
        
        {activeTab === 'forms' && (
          <FormsTab forms={forms} clientId={client.id} />
        )}
        
        {activeTab === 'sops' && (
          <SOPsTab sops={sops} clientId={client.id} />
        )}
        
        {activeTab === 'proposals' && (
          <ProposalsTab proposals={proposals} clientId={client.id} />
        )}
      </div>
    </div>
  )
}

// Tab Components
function OverviewTab({ 
  client, 
  analytics, 
  forms, 
  sops, 
  proposals 
}: { 
  client: Client
  analytics: ClientAnalytics | null
  forms: Form[]
  sops: SOP[]
  proposals: Proposal[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Analytics Cards */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="dashboard-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo en Proceso</p>
                  <p className="text-2xl font-bold">
                    {analytics?.tiempo_en_proceso || 0} días
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ROI Estimado</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics?.roi_total_estimado ? formatCurrency(analytics.roi_total_estimado) : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Procesos Identificados</p>
                  <p className="text-2xl font-bold">
                    {analytics?.procesos_automatizables || sops.length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Timeline del Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Cliente Creado</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(client.fecha_creacion)}
                  </p>
                </div>
              </div>
              
              {forms.length > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Formulario Generado</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(forms[0].fecha_creacion)}
                    </p>
                  </div>
                </div>
              )}
              
              {sops.length > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">SOPs Generados</p>
                    <p className="text-xs text-muted-foreground">
                      {sops.length} procesos documentados
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Info */}
      <div className="space-y-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Años de Operación</p>
              <p className="font-medium">{client.anos_operacion} años</p>
            </div>
            
            {client.descripcion && (
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-sm">{client.descripcion}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground">Última Actualización</p>
              <p className="text-sm">{formatRelativeTime(client.fecha_actualizacion)}</p>
            </div>
          </CardContent>
        </Card>

        {analytics && (
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Prioridad Comercial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  analytics.prioridad_comercial === 'alta' ? 'bg-red-100 text-red-700' :
                  analytics.prioridad_comercial === 'media' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {analytics.prioridad_comercial.toUpperCase()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Probabilidad de cierre: {Math.round(analytics.probabilidad_cierre)}%
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function FormsTab({ forms, clientId }: { forms: Form[]; clientId: string }) {
  if (forms.length === 0) {
    return (
      <Card className="dashboard-card">
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay formularios</h3>
          <p className="text-muted-foreground mb-4">
            Genera un formulario para iniciar el proceso de diagnóstico
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generar Formulario
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {forms.map((form) => (
        <Card key={form.id} className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{form.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {form.preguntas_count} preguntas • Creado {formatRelativeTime(form.fecha_creacion)}
                </p>
                <Badge className={getStatusColor(form.estado as any)} size="sm" className="mt-2">
                  {form.estado}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
                {form.estado === 'completado' && (
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SOPsTab({ sops, clientId }: { sops: SOP[]; clientId: string }) {
  if (sops.length === 0) {
    return (
      <Card className="dashboard-card">
        <CardContent className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay SOPs generados</h3>
          <p className="text-muted-foreground">
            Los SOPs se generarán automáticamente después de completar el formulario
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sops.map((sop) => (
        <Card key={sop.id} className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{sop.nombre}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {sop.descripcion}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getStatusColor(sop.estado as any)} size="sm">
                    {sop.estado}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Score: {sop.automation_score}/100
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Revisar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ProposalsTab({ proposals, clientId }: { proposals: Proposal[]; clientId: string }) {
  if (proposals.length === 0) {
    return (
      <Card className="dashboard-card">
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay propuestas</h3>
          <p className="text-muted-foreground mb-4">
            Las propuestas se generan después de aprobar los SOPs
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generar Propuesta
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <Card key={proposal.id} className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{proposal.titulo}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {proposal.descripcion}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getStatusColor(proposal.estado as any)} size="sm">
                    {proposal.estado}
                  </Badge>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(proposal.valor_propuesta)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ROI: {proposal.roi_estimado}%
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}