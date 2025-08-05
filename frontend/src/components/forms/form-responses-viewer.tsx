'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Share2, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  Eye,
  ArrowRight,
  BarChart3,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { Form, FormResponse, Question, Client } from '@/types'
import { formsApi } from '@/lib/api'

interface FormResponsesViewerProps {
  form: Form
  client?: Client
  onProcessResponses?: () => void
  onGenerateSOPs?: () => void
}

interface ProcessedResponse {
  question: Question
  response: FormResponse
  category: string
  weight: number
}

export function FormResponsesViewer({ 
  form, 
  client, 
  onProcessResponses, 
  onGenerateSOPs 
}: FormResponsesViewerProps) {
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [processedResponses, setProcessedResponses] = useState<ProcessedResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [analysisView, setAnalysisView] = useState<'responses' | 'analysis'>('responses')
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed'>('idle')

  useEffect(() => {
    loadResponses()
  }, [form.id])

  const loadResponses = async () => {
    setLoading(true)
    try {
      const responsesData = await formsApi.getResponses(form.id)
      setResponses(responsesData)
      processResponsesData(responsesData)
    } catch (error) {
      console.error('Error loading responses:', error)
    } finally {
      setLoading(false)
    }
  }

  const processResponsesData = (responsesData: FormResponse[]) => {
    // Group responses with questions for better visualization
    const processed = responsesData.map(response => {
      const question = form.preguntas.find(q => q.id === response.question_id)
      return {
        question: question!,
        response,
        category: question?.categoria || 'general',
        weight: question?.peso_analisis || 1
      }
    }).filter(item => item.question)

    setProcessedResponses(processed)
  }

  const handleProcessResponses = async () => {
    setProcessingStatus('processing')
    try {
      await formsApi.processResponses(form.id)
      setProcessingStatus('completed')
      onProcessResponses?.()
    } catch (error) {
      console.error('Error processing responses:', error)
      setProcessingStatus('idle')
    }
  }

  const handleExportResponses = () => {
    // Export responses to CSV/PDF
    console.log('Exporting responses...')
  }

  const getResponsesByCategory = () => {
    return processedResponses.reduce((acc, item) => {
      const category = item.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {} as Record<string, ProcessedResponse[]>)
  }

  const getCompletionStats = () => {
    return {
      totalQuestions: form.preguntas_count,
      answeredQuestions: responses.length,
      completionRate: Math.round((responses.length / form.preguntas_count) * 100),
      avgResponseLength: responses.reduce((acc, r) => 
        acc + (typeof r.respuesta === 'string' ? r.respuesta.length : 0), 0
      ) / responses.length
    }
  }

  const getCategoryStats = () => {
    const byCategory = getResponsesByCategory()
    return Object.entries(byCategory).map(([category, items]) => ({
      category,
      count: items.length,
      avgWeight: items.reduce((acc, item) => acc + item.weight, 0) / items.length,
      completionRate: Math.round((items.length / form.preguntas.filter(q => q.categoria === category).length) * 100)
    }))
  }

  const renderResponseValue = (response: FormResponse) => {
    if (Array.isArray(response.respuesta)) {
      return (
        <div className="flex flex-wrap gap-1">
          {response.respuesta.map((item, index) => (
            <Badge key={index} variant="secondary">{item}</Badge>
          ))}
        </div>
      )
    }
    
    if (typeof response.respuesta === 'boolean') {
      return (
        <Badge variant={response.respuesta ? 'success' : 'destructive'}>
          {response.respuesta ? 'Sí' : 'No'}
        </Badge>
      )
    }
    
    if (typeof response.respuesta === 'number') {
      return <span className="font-medium">{response.respuesta}</span>
    }
    
    return <span>{response.respuesta}</span>
  }

  const completionStats = getCompletionStats()
  const categoryStats = getCategoryStats()

  if (loading) {
    return (
      <Card className="dashboard-card">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando respuestas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl">{form.title}</CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="success">Completado</Badge>
                {client && (
                  <span className="text-sm text-muted-foreground">
                    Cliente: {client.nombre}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  Completado: {formatRelativeTime(form.fecha_completado!)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportResponses}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              {processingStatus === 'idle' && (
                <Button onClick={handleProcessResponses}>
                  <Brain className="h-4 w-4 mr-2" />
                  Procesar con IA
                </Button>
              )}
              {processingStatus === 'processing' && (
                <Button disabled>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Procesando...
                </Button>
              )}
              {processingStatus === 'completed' && (
                <Button onClick={onGenerateSOPs}>
                  <Target className="h-4 w-4 mr-2" />
                  Ver SOPs Generados
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preguntas Respondidas</p>
                <p className="text-2xl font-bold text-foreground">
                  {completionStats.answeredQuestions}/{completionStats.totalQuestions}
                </p>
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
                <p className="text-sm text-muted-foreground">Tasa de Finalización</p>
                <p className="text-2xl font-bold text-green-600">
                  {completionStats.completionRate}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Invertido</p>
                <p className="text-2xl font-bold text-purple-600">
                  {form.tiempo_completado}min
                </p>
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
                <p className="text-sm text-muted-foreground">Calidad de Respuestas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(completionStats.avgResponseLength)} chars
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex bg-muted rounded-lg p-1 w-fit">
        <button
          onClick={() => setAnalysisView('responses')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            analysisView === 'responses' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4 mr-2 inline" />
          Respuestas Detalladas
        </button>
        <button
          onClick={() => setAnalysisView('analysis')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            analysisView === 'analysis' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4 mr-2 inline" />
          Análisis por Categoría
        </button>
      </div>

      {/* Content */}
      {analysisView === 'responses' ? (
        <ResponsesDetailView processedResponses={processedResponses} />
      ) : (
        <CategoryAnalysisView categoryStats={categoryStats} responsesByCategory={getResponsesByCategory()} />
      )}
    </div>
  )
}

function ResponsesDetailView({ processedResponses }: { processedResponses: ProcessedResponse[] }) {
  const groupedResponses = processedResponses.reduce((acc, item) => {
    const category = item.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, ProcessedResponse[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedResponses).map(([category, items]) => (
        <Card key={category} className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg capitalize flex items-center space-x-2">
              <span>{category.replace('_', ' ')}</span>
              <Badge variant="secondary">{items.length} preguntas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border-l-4 border-primary/20 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground">{item.question.pregunta}</h4>
                    {item.question.peso_analisis > 1 && (
                      <Badge variant="outline" size="sm">
                        Peso: {item.question.peso_analisis}
                      </Badge>
                    )}
                  </div>
                  {item.question.descripcion && (
                    <p className="text-sm text-muted-foreground mb-2">{item.question.descripcion}</p>
                  )}
                  <div className="bg-muted/50 rounded-lg p-3">
                    {renderResponseValue(item.response)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Respondido: {formatRelativeTime(item.response.fecha_respuesta)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CategoryAnalysisView({ 
  categoryStats, 
  responsesByCategory 
}: { 
  categoryStats: any[]
  responsesByCategory: Record<string, ProcessedResponse[]>
}) {
  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((stat, index) => (
          <Card key={index} className="dashboard-card">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium capitalize">{stat.category.replace('_', ' ')}</h3>
                  <Badge variant="secondary">{stat.count}</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${stat.completionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Completado: {stat.completionRate}%</span>
                  <span>Peso promedio: {stat.avgWeight.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Análisis Detallado por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(responsesByCategory).map(([category, items]) => (
              <div key={category} className="border-l-4 border-primary/20 pl-4">
                <h3 className="font-semibold text-lg capitalize mb-3">
                  {category.replace('_', ' ')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.slice(0, 4).map((item, index) => (
                    <div key={index} className="bg-muted/30 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">{item.question.pregunta}</h4>
                      <div className="text-sm">
                        {renderResponseValue(item.response)}
                      </div>
                    </div>
                  ))}
                </div>
                {items.length > 4 && (
                  <Button variant="ghost" size="sm" className="mt-2">
                    Ver {items.length - 4} respuestas más
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function moved outside component
function renderResponseValue(response: FormResponse) {
  if (Array.isArray(response.respuesta)) {
    return (
      <div className="flex flex-wrap gap-1">
        {response.respuesta.map((item, index) => (
          <Badge key={index} variant="secondary">{item}</Badge>
        ))}
      </div>
    )
  }
  
  if (typeof response.respuesta === 'boolean') {
    return (
      <Badge variant={response.respuesta ? 'success' : 'destructive'}>
        {response.respuesta ? 'Sí' : 'No'}
      </Badge>
    )
  }
  
  if (typeof response.respuesta === 'number') {
    return <span className="font-medium">{response.respuesta}</span>
  }
  
  return <span>{response.respuesta}</span>
}