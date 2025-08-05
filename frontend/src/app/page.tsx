'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics'
import { ClientsTable } from '@/components/dashboard/clients-table'
import { NotificationsPanel } from '@/components/dashboard/notifications-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  FileText,
  Users,
  Activity,
  ArrowRight,
  Calendar,
  Target
} from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { formatRelativeTime } from '@/lib/utils'
import type { Client } from '@/types'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const { addNotification } = useDashboardStore()

  // Simular datos de actividad reciente para demo
  useEffect(() => {
    const mockActivity = [
      {
        id: '1',
        type: 'form_completed',
        description: 'Formulario completado por Cliente ABC S.A.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        client_name: 'Cliente ABC S.A.',
        client_id: '1'
      },
      {
        id: '2',
        type: 'sop_generated',
        description: '5 SOPs generados para Empresa XYZ',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        client_name: 'Empresa XYZ',
        client_id: '2'
      },
      {
        id: '3',
        type: 'proposal_sent',
        description: 'Propuesta enviada a Corporación 123',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        client_name: 'Corporación 123',
        client_id: '3'
      }
    ]
    setRecentActivity(mockActivity)

    // Simular notificaciones en tiempo real
    const timer = setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Nuevo Formulario Completado',
        message: 'El cliente "Innovación Tech S.A." ha completado su formulario de diagnóstico',
        action_url: '/clients/demo-client-id'
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [addNotification])

  const handleClientSelect = (client: Client) => {
    router.push(`/clients/${client.id}`)
  }

  const handleCreateClient = () => {
    router.push('/clients/new')
  }

  const quickActions = [
    {
      title: 'Nuevo Cliente',
      description: 'Crear un nuevo cliente y generar formulario',
      icon: Plus,
      href: '/clients/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Ver Formularios',
      description: 'Revisar formularios completados pendientes',
      icon: FileText,
      href: '/forms',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'SOPs Pendientes',
      description: 'Revisar SOPs generados para aprobación',
      icon: Target,
      href: '/sops/review',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Analytics',
      description: 'Ver métricas detalladas y reportes',
      icon: TrendingUp,
      href: '/analytics',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard Principal
            </h1>
            <p className="text-muted-foreground">
              Bienvenido al sistema de levantamiento automatizado de procesos
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={handleCreateClient}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <DashboardMetrics />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Clients Table */}
          <div className="lg:col-span-2">
            <ClientsTable 
              onClientSelect={handleClientSelect}
              onCreateClient={handleCreateClient}
              compact={false}
            />
          </div>

          {/* Right Column - Notifications & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="h-auto p-4 justify-start"
                      onClick={() => router.push(action.href)}
                    >
                      <div className={`p-2 rounded-lg text-white mr-3 ${action.color}`}>
                        <action.icon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-foreground">
                          {action.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Actividad Reciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No hay actividad reciente
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                        onClick={() => router.push(`/clients/${activity.client_id}`)}
                      >
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <NotificationsPanel maxHeight="max-h-80" />
          </div>
        </div>

        {/* Bottom Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="dashboard-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Proceso Promedio</h3>
                  <p className="text-2xl font-bold text-foreground">7.2 días</p>
                  <p className="text-xs text-green-600 mt-1">-2.1 días vs mes anterior</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Satisfacción Cliente</h3>
                  <p className="text-2xl font-bold text-foreground">4.8/5</p>
                  <p className="text-xs text-green-600 mt-1">+0.3 vs mes anterior</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ROI Promedio</h3>
                  <p className="text-2xl font-bold text-foreground">385%</p>
                  <p className="text-xs text-green-600 mt-1">+45% vs mes anterior</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}