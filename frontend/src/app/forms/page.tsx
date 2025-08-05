'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FormsDashboard } from '@/components/forms/forms-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react'

export default function FormsPage() {
  const quickActions = [
    {
      title: 'Formularios Pendientes',
      description: 'Revisar formularios enviados esperando respuesta',
      icon: Clock,
      count: 5,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      href: '/forms?status=enviado'
    },
    {
      title: 'Respuestas Recientes',
      description: 'Formularios completados en las últimas 24h',
      icon: CheckCircle,
      count: 3,
      color: 'bg-green-500 hover:bg-green-600',
      href: '/forms?status=completado'
    },
    {
      title: 'Próximos a Vencer',
      description: 'Formularios que expiran en los próximos 7 días',
      icon: AlertTriangle,
      count: 2,
      color: 'bg-orange-500 hover:bg-orange-600',
      href: '/forms?expiring=true'
    },
    {
      title: 'Analytics de Formularios',
      description: 'Ver métricas detalladas y tendencias',
      icon: BarChart3,
      count: null,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/forms/analytics'
    }
  ]

  const recentActivity = [
    {
      type: 'completed',
      message: 'Formulario completado por Innovación Tech S.A.',
      timestamp: '2 horas',
      client: 'Innovación Tech S.A.'
    },
    {
      type: 'sent',
      message: 'Formulario enviado a Constructora ABC',
      timestamp: '6 horas',
      client: 'Constructora ABC'
    },
    {
      type: 'reminder',
      message: 'Recordatorio enviado a Servicios XYZ',
      timestamp: '1 día',
      client: 'Servicios XYZ'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Formularios</h1>
            <p className="text-muted-foreground">
              Administra formularios, monitorea respuestas y procesa datos de clientes
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Analytics
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Formulario
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="dashboard-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg text-white ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  {action.count && (
                    <div className="text-2xl font-bold text-foreground">
                      {action.count}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard */}
        <FormsDashboard />

        {/* Sidebar with Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Tips and Best Practices */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Mejores Prácticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Optimización de Respuestas</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Envía recordatorios después de 3 días sin respuesta</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Personaliza el mensaje de introducción por industria</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Configura formularios de máximo 25 preguntas</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Métricas Clave</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <BarChart3 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Tasa de finalización objetivo: &gt;85%</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Tiempo de finalización óptimo: 30-45 min</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Users className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>Respuesta típica en 3-5 días hábiles</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            {/* Recent Activity */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-lg">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'completed' ? 'bg-green-500' :
                        activity.type === 'sent' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            hace {activity.timestamp}
                          </span>
                          <span className="text-xs text-primary">
                            {activity.client}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  Ver todo el historial
                </Button>
              </CardContent>
            </Card>

            {/* Form Templates */}
            <Card className="dashboard-card mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Templates Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm">Startups TI</h4>
                    <p className="text-xs text-muted-foreground">22 preguntas • ~35min</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm">Consultoría</h4>
                    <p className="text-xs text-muted-foreground">18 preguntas • ~25min</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm">Contabilidad</h4>
                    <p className="text-xs text-muted-foreground">28 preguntas • ~40min</p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver todos los templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}