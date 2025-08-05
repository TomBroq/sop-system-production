'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ClientDetailView } from '@/components/clients/client-detail-view'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { clientsApi } from '@/lib/api'
import type { Client } from '@/types'

interface ClientDetailPageProps {
  params: {
    id: string
  }
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadClient()
  }, [params.id])

  const loadClient = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const clientData = await clientsApi.getById(params.id)
      setClient(clientData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar cliente'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClientUpdate = (updatedClient: Client) => {
    setClient(updatedClient)
  }

  const handleEdit = () => {
    router.push(`/clients/${params.id}/edit`)
  }

  const handleDelete = () => {
    // Implement delete functionality
    console.log('Delete client:', params.id)
  }

  const handleBack = () => {
    router.push('/clients')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando información del cliente...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Error al cargar cliente</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex items-center justify-center space-x-3">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Clientes
              </Button>
              <Button onClick={loadClient}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-foreground mb-2">Cliente no encontrado</h2>
            <p className="text-muted-foreground mb-6">
              El cliente que buscas no existe o ha sido eliminado.
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Clientes
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <button 
            onClick={handleBack}
            className="hover:text-foreground transition-colors"
          >
            Clientes
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">{client.nombre}</span>
        </div>

        {/* Client Detail View */}
        <ClientDetailView
          client={client}
          onUpdate={handleClientUpdate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  )
}