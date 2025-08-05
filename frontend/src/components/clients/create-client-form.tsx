'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Briefcase,
  Bot,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { clientsApi } from '@/lib/api'
import { getIndustryLabel, getCompanySizeLabel } from '@/lib/utils'
import type { CreateClientRequest, IndustryType, CompanySize } from '@/types'
import toast from 'react-hot-toast'

const createClientSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  industria: z.enum([
    'contabilidad',
    'inmobiliaria', 
    'ventas',
    'agricola',
    'licitaciones',
    'startups-ti',
    'consultas-medicas',
    'telecomunicaciones',
    'energia-solar',
    'hoteleria',
    'consultoria',
    'venta-masiva',
    'arquitectura'
  ], { required_error: 'Selecciona una industria' }),
  tamano: z.enum(['micro', 'pequena', 'mediana', 'grande'], { 
    required_error: 'Selecciona el tamaño de la empresa' 
  }),
  anos_operacion: z.number().min(0, 'Los años de operación no pueden ser negativos').max(200, 'Valor demasiado alto'),
  empleados_count: z.number().min(1, 'Debe tener al menos 1 empleado').max(100000, 'Valor demasiado alto'),
  email_contacto: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  descripcion: z.string().optional(),
  pais: z.string().min(2, 'El país es requerido'),
  ciudad: z.string().min(2, 'La ciudad es requerida'),
})

type CreateClientForm = z.infer<typeof createClientSchema>

interface CreateClientFormProps {
  onSuccess?: (client: any) => void
  onCancel?: () => void
  initialData?: Partial<CreateClientForm>
}

export function CreateClientForm({ onSuccess, onCancel, initialData }: CreateClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<{
    industria?: IndustryType
    confidence?: number
    reasoning?: string
  }>({})

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateClientForm>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      pais: 'México',
      ...initialData
    }
  })

  const watchedDescription = watch('descripcion')
  const watchedIndustria = watch('industria')
  const watchedTamano = watch('tamano')

  // Auto-clasificación por IA basada en descripción
  const handleAIClassification = async () => {
    if (!watchedDescription || watchedDescription.length < 10) {
      toast.error('Agrega una descripción más detallada para usar la clasificación automática')
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await clientsApi.classifyIndustry(watchedDescription)
      setAiSuggestions({
        industria: result.industria as IndustryType,
        confidence: result.confidence,
        reasoning: `IA detectó palabras clave relacionadas con ${getIndustryLabel(result.industria as IndustryType)}`
      })
      
      if (result.confidence > 0.7) {
        setValue('industria', result.industria as IndustryType)
        toast.success(`Industria clasificada automáticamente: ${getIndustryLabel(result.industria as IndustryType)}`)
      }
    } catch (error) {
      toast.error('Error al clasificar industria automáticamente')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Auto-ajuste de empleados basado en tamaño
  const handleSizeChange = (size: CompanySize) => {
    setValue('tamano', size)
    
    // Sugerir rango de empleados basado en tamaño
    const ranges = {
      'micro': { min: 1, suggested: 5 },
      'pequena': { min: 11, suggested: 25 },
      'mediana': { min: 51, suggested: 100 },
      'grande': { min: 201, suggested: 500 }
    }
    
    const range = ranges[size]
    const currentEmployees = watch('empleados_count')
    
    if (!currentEmployees || currentEmployees < range.min) {
      setValue('empleados_count', range.suggested)
    }
  }

  const onSubmit = async (data: CreateClientForm) => {
    setIsSubmitting(true)
    try {
      const client = await clientsApi.create(data)
      toast.success('Cliente creado exitosamente')
      onSuccess?.(client)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear cliente'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const industryOptions: { value: IndustryType; label: string }[] = [
    { value: 'contabilidad', label: 'Contabilidad' },
    { value: 'inmobiliaria', label: 'Gestión Inmobiliaria' },
    { value: 'ventas', label: 'Prospección y Ventas' },
    { value: 'consultoria', label: 'Consultoría' },
    { value: 'startups-ti', label: 'Startups TI' },
    { value: 'agricola', label: 'Agrícola' },
    { value: 'licitaciones', label: 'Licitaciones' },
    { value: 'consultas-medicas', label: 'Consultas Médicas' },
    { value: 'telecomunicaciones', label: 'Telecomunicaciones' },
    { value: 'energia-solar', label: 'Energía Solar' },
    { value: 'hoteleria', label: 'Hotelería' },
    { value: 'venta-masiva', label: 'Venta Masiva' },
    { value: 'arquitectura', label: 'Arquitectura' },
  ]

  const sizeOptions: { value: CompanySize; label: string; description: string }[] = [
    { value: 'micro', label: 'Micro', description: '1-10 empleados' },
    { value: 'pequena', label: 'Pequeña', description: '11-50 empleados' },
    { value: 'mediana', label: 'Mediana', description: '51-200 empleados' },
    { value: 'grande', label: 'Grande', description: '200+ empleados' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información Básica */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Información Básica</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Empresa *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Innovación Tech S.A."
                {...register('nombre')}
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_contacto">Email de Contacto *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email_contacto"
                  type="email"
                  placeholder="contacto@empresa.com"
                  className={`pl-9 ${errors.email_contacto ? 'border-red-500' : ''}`}
                  {...register('email_contacto')}
                />
              </div>
              {errors.email_contacto && (
                <p className="text-sm text-red-600">{errors.email_contacto.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  placeholder="+52 55 1234 5678"
                  className="pl-9"
                  {...register('telefono')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pais">País *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pais"
                  placeholder="México"
                  className={`pl-9 ${errors.pais ? 'border-red-500' : ''}`}
                  {...register('pais')}
                />
              </div>
              {errors.pais && (
                <p className="text-sm text-red-600">{errors.pais.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                id="ciudad"
                placeholder="Ciudad de México"
                className={errors.ciudad ? 'border-red-500' : ''}
                {...register('ciudad')}
              />
              {errors.ciudad && (
                <p className="text-sm text-red-600">{errors.ciudad.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clasificación Empresarial */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>Clasificación Empresarial</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción de la Empresa</Label>
            <textarea
              id="descripcion"
              placeholder="Describe brevemente la empresa, sus servicios principales, tipo de clientes, etc."
              className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('descripcion')}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Una descripción detallada ayuda a clasificar automáticamente la industria
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIClassification}
                disabled={isAnalyzing || !watchedDescription}
                className="ml-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 mr-1" />
                    Clasificar con IA
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.industria && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Sugerencia de IA</span>
                <Badge variant={aiSuggestions.confidence! > 0.8 ? 'success' : 'warning'}>
                  {Math.round(aiSuggestions.confidence! * 100)}% confianza
                </Badge>
              </div>
              <p className="text-sm text-blue-700">{aiSuggestions.reasoning}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industria">Industria *</Label>
              <select
                id="industria"
                className={`w-full px-3 py-2 border border-input rounded-md bg-background text-sm ${
                  errors.industria ? 'border-red-500' : ''
                }`}
                {...register('industria')}
              >
                <option value="">Selecciona una industria</option>
                {industryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.industria && (
                <p className="text-sm text-red-600">{errors.industria.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tamaño de Empresa *</Label>
              <div className="grid grid-cols-2 gap-2">
                {sizeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSizeChange(option.value)}
                    className={`p-3 border border-input rounded-lg text-left transition-colors ${
                      watchedTamano === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </button>
                ))}
              </div>
              {errors.tamano && (
                <p className="text-sm text-red-600">{errors.tamano.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empleados_count">Número de Empleados *</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="empleados_count"
                  type="number"
                  min="1"
                  placeholder="25"
                  className={`pl-9 ${errors.empleados_count ? 'border-red-500' : ''}`}
                  {...register('empleados_count', { valueAsNumber: true })}
                />
              </div>
              {errors.empleados_count && (
                <p className="text-sm text-red-600">{errors.empleados_count.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="anos_operacion">Años de Operación *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="anos_operacion"
                  type="number"
                  min="0"
                  placeholder="5"
                  className={`pl-9 ${errors.anos_operacion ? 'border-red-500' : ''}`}
                  {...register('anos_operacion', { valueAsNumber: true })}
                />
              </div>
              {errors.anos_operacion && (
                <p className="text-sm text-red-600">{errors.anos_operacion.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creando Cliente...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Crear Cliente
            </>
          )}
        </Button>
      </div>
    </form>
  )
}