'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CreateClientForm } from '@/components/clients/create-client-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Lightbulb, CheckCircle, Send } from 'lucide-react'
import type { Client } from '@/types'

export default function NewClientPage() {
  const router = useRouter()

  const handleSuccess = (client: Client) => {
    // Redirect to client detail page
    router.push(`/clients/${client.id}`)
  }

  const handleCancel = () => {
    router.back()
  }

  const processSteps = [
    {
      step: 1,
      title: 'Crear Cliente',
      description: 'Información básica y clasificación',
      icon: Users,
      status: 'current'
    },
    {
      step: 2,
      title: 'Generar Formulario',
      description: 'Formulario adaptativo por industria',
      icon: Send,
      status: 'upcoming'
    },
    {
      step: 3,
      title: 'Procesar Respuestas',
      description: 'IA genera SOPs automáticamente',
      icon: Lightbulb,
      status: 'upcoming'
    },
    {
      step: 4,
      title: 'Propuesta Comercial',
      description: 'Análisis y recomendaciones',
      icon: CheckCircle,
      status: 'upcoming'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Crear Nuevo Cliente</h1>
              <p className="text-muted-foreground">
                Completa la información para iniciar el proceso de levantamiento automatizado
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Process Steps - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-lg">Proceso Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processSteps.map((step, index) => (
                    <div key={step.step} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        step.status === 'current' 
                          ? 'bg-primary text-primary-foreground' 
                          : step.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <step.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium text-sm ${
                          step.status === 'current' ? 'text-primary' : 'text-foreground'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Tip</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Proporciona una descripción detallada de la empresa para que la IA 
                    pueda clasificar automáticamente la industria y generar preguntas más precisas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <CreateClientForm 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>

        {/* Help Section */}
        <Card className="dashboard-card bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Clasificación Inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  Nuestro sistema clasifica automáticamente la industria basándose en la descripción
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Send className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Formularios Adaptativos</h3>
                <p className="text-sm text-muted-foreground">
                  Genera formularios específicos según la industria y tamaño de la empresa
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Automatización Completa</h3>
                <p className="text-sm text-muted-foreground">
                  Desde la creación hasta la propuesta comercial, todo el proceso es automatizado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}