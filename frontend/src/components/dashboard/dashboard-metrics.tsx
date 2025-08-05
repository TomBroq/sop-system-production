'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  Send, 
  TrendingUp,
  DollarSign,
  Target,
  Activity
} from 'lucide-react'
import { useDashboardStore, useMetrics } from '@/store/dashboard-store'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

export function DashboardMetrics() {
  const { metrics, loading, error } = useMetrics()
  const fetchMetrics = useDashboardStore(state => state.fetchMetrics)

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  if (loading && !metrics) {
    return <MetricsLoading />
  }

  if (error) {
    return <MetricsError error={error} onRetry={fetchMetrics} />
  }

  if (!metrics) {
    return null
  }

  const metricsConfig = [
    {
      title: 'Clientes Activos',
      value: formatNumber(metrics.clientes_activos),
      description: 'En proceso actualmente',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Formularios Completados',
      value: formatNumber(metrics.formularios_completados),
      description: `${metrics.formularios_pendientes} pendientes`,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+18%',
      trendUp: true
    },
    {
      title: 'SOPs Generados',
      value: formatNumber(metrics.sops_generados),
      description: 'Documentos listos',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '+25%',
      trendUp: true
    },
    {
      title: 'Propuestas Enviadas',
      value: formatNumber(metrics.propuestas_enviadas),
      description: `${metrics.propuestas_aceptadas} aceptadas`,
      icon: Send,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: `${formatPercentage(metrics.conversion_rate)}`,
      trendUp: metrics.conversion_rate > 20
    },
    {
      title: 'Pipeline de Ventas',
      value: formatCurrency(metrics.valor_pipeline),
      description: 'Valor total potencial',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      trend: '+32%',
      trendUp: true
    },
    {
      title: 'Tasa de Conversión',
      value: formatPercentage(metrics.conversion_rate),
      description: 'Propuestas a contratos',
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      trend: metrics.conversion_rate > 25 ? 'Excelente' : 'Bueno',
      trendUp: metrics.conversion_rate > 25
    },
    {
      title: 'Tiempo Promedio',
      value: `${metrics.tiempo_promedio_proceso}d`,
      description: 'Proceso completo',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      trend: '-15%',
      trendUp: true // Reducir tiempo es positivo
    },
    {
      title: 'Satisfacción Cliente',
      value: `${metrics.satisfaccion_promedio}/5`,
      description: 'Calificación promedio',
      icon: Activity,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      trend: metrics.satisfaccion_promedio >= 4.5 ? 'Excelente' : 'Muy bueno',
      trendUp: metrics.satisfaccion_promedio >= 4.0
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricsConfig.map((metric, index) => (
        <Card key={index} className="dashboard-card hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {metric.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                <Badge 
                  variant={metric.trendUp ? "success" : "warning"}
                  className="text-xs"
                >
                  {metric.trendUp && <TrendingUp className="h-3 w-3 mr-1" />}
                  {metric.trend}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function MetricsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted rounded loading-skeleton" />
            <div className="h-8 w-8 bg-muted rounded-lg loading-skeleton" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="h-8 w-16 bg-muted rounded loading-skeleton" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-muted rounded loading-skeleton" />
                <div className="h-5 w-12 bg-muted rounded-full loading-skeleton" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function MetricsError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="mb-8">
      <Card className="border-error bg-error-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-error-100 rounded-lg">
                <Activity className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <h3 className="font-medium text-error-900">Error al cargar métricas</h3>
                <p className="text-sm text-error-700">{error}</p>
              </div>
            </div>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}