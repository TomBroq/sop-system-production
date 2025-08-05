import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"
import type { ClientStatus, CompanySize, IndustryType, Priority } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export function formatDate(date: string | Date, formatStr: string = "dd/MM/yyyy"): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Fecha inválida'
    return format(dateObj, formatStr, { locale: es })
  } catch {
    return 'Fecha inválida'
  }
}

export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Fecha inválida'
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
  } catch {
    return 'Fecha inválida'
  }
}

// Status utilities
export function getStatusColor(status: ClientStatus): string {
  const statusColors: Record<ClientStatus, string> = {
    'cliente_creado': 'bg-blue-100 text-blue-700 border-blue-200',
    'formulario_enviado': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'respuestas_recibidas': 'bg-purple-100 text-purple-700 border-purple-200',
    'procesando_ia': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'sops_generados': 'bg-green-100 text-green-700 border-green-200',
    'propuesta_lista': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'propuesta_enviada': 'bg-teal-100 text-teal-700 border-teal-200',
    'cerrado': 'bg-gray-100 text-gray-700 border-gray-200',
    'cancelado': 'bg-red-100 text-red-700 border-red-200',
    'error_procesamiento': 'bg-red-100 text-red-700 border-red-200',
    'expirado': 'bg-orange-100 text-orange-700 border-orange-200',
  }
  return statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}

export function getStatusLabel(status: ClientStatus): string {
  const statusLabels: Record<ClientStatus, string> = {
    'cliente_creado': 'Cliente Creado',
    'formulario_enviado': 'Formulario Enviado',
    'respuestas_recibidas': 'Respuestas Recibidas',
    'procesando_ia': 'Procesando con IA',
    'sops_generados': 'SOPs Generados',
    'propuesta_lista': 'Propuesta Lista',
    'propuesta_enviada': 'Propuesta Enviada',
    'cerrado': 'Cerrado',
    'cancelado': 'Cancelado',
    'error_procesamiento': 'Error en Procesamiento',
    'expirado': 'Expirado',
  }
  return statusLabels[status] || status
}

export function getPriorityColor(priority: Priority): string {
  const priorityColors: Record<Priority, string> = {
    'baja': 'bg-gray-100 text-gray-700',
    'media': 'bg-yellow-100 text-yellow-700',
    'alta': 'bg-orange-100 text-orange-700',
    'critica': 'bg-red-100 text-red-700',
  }
  return priorityColors[priority] || 'bg-gray-100 text-gray-700'
}

export function getPriorityLabel(priority: Priority): string {
  const priorityLabels: Record<Priority, string> = {
    'baja': 'Baja',
    'media': 'Media',
    'alta': 'Alta',
    'critica': 'Crítica',
  }
  return priorityLabels[priority] || priority
}

// Industry utilities
export function getIndustryLabel(industry: IndustryType): string {
  const industryLabels: Record<IndustryType, string> = {
    'contabilidad': 'Contabilidad',
    'inmobiliaria': 'Gestión Inmobiliaria',
    'ventas': 'Prospección y Ventas',
    'agricola': 'Agrícola',
    'licitaciones': 'Licitaciones',
    'startups-ti': 'Startups TI',
    'consultas-medicas': 'Consultas Médicas',
    'telecomunicaciones': 'Telecomunicaciones',
    'energia-solar': 'Energía Solar',
    'hoteleria': 'Hotelería',
    'consultoria': 'Consultoría',
    'venta-masiva': 'Venta Masiva',
    'arquitectura': 'Arquitectura',
  }
  return industryLabels[industry] || industry
}

export function getCompanySizeLabel(size: CompanySize): string {
  const sizeLabels: Record<CompanySize, string> = {
    'micro': 'Micro (1-10 empleados)',
    'pequena': 'Pequeña (11-50 empleados)',
    'mediana': 'Mediana (51-200 empleados)',
    'grande': 'Grande (200+ empleados)',
  }
  return sizeLabels[size] || size
}

export function getCompanySizeRange(size: CompanySize): { min: number; max: number | null } {
  const ranges: Record<CompanySize, { min: number; max: number | null }> = {
    'micro': { min: 1, max: 10 },
    'pequena': { min: 11, max: 50 },
    'mediana': { min: 51, max: 200 },
    'grande': { min: 201, max: null },
  }
  return ranges[size] || { min: 0, max: null }
}

// Number formatting utilities
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value: number, maximumFractionDigits: number = 0): string {
  return new Intl.NumberFormat('es-ES', {
    maximumFractionDigits,
  }).format(value)
}

export function formatPercentage(value: number, maximumFractionDigits: number = 1): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    maximumFractionDigits,
  }).format(value / 100)
}

// Progress calculation utilities
export function calculateClientProgress(status: ClientStatus): number {
  const progressMap: Record<ClientStatus, number> = {
    'cliente_creado': 10,
    'formulario_enviado': 25,
    'respuestas_recibidas': 40,
    'procesando_ia': 60,
    'sops_generados': 80,
    'propuesta_lista': 90,
    'propuesta_enviada': 95,
    'cerrado': 100,
    'cancelado': 0,
    'error_procesamiento': 40,
    'expirado': 25,
  }
  return progressMap[status] || 0
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-blue-500'
  if (progress >= 40) return 'bg-yellow-500'
  if (progress >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

// Automation scoring utilities
export function calculateAutomationScore(
  volume: number,
  complexity: Priority,
  errorRate: number,
  timeSpent: number
): number {
  let score = 0
  
  // Volume score (0-30 points)
  if (volume >= 100) score += 30
  else if (volume >= 50) score += 20
  else if (volume >= 20) score += 10
  
  // Complexity score (0-25 points, inverted)
  const complexityScores = { 'baja': 25, 'media': 15, 'alta': 5, 'critica': 0 }
  score += complexityScores[complexity] || 0
  
  // Error rate score (0-25 points, inverted)
  if (errorRate >= 0.1) score += 25
  else if (errorRate >= 0.05) score += 15
  else if (errorRate >= 0.02) score += 10
  
  // Time spent score (0-20 points)
  if (timeSpent >= 60) score += 20 // 1+ hour
  else if (timeSpent >= 30) score += 15
  else if (timeSpent >= 15) score += 10
  
  return Math.min(100, score)
}

export function getAutomationRecommendation(score: number): {
  level: 'low' | 'medium' | 'high';
  label: string;
  description: string;
  color: string;
} {
  if (score >= 70) {
    return {
      level: 'high',
      label: 'Alta Prioridad',
      description: 'Excelente candidato para automatización inmediata',
      color: 'text-green-700 bg-green-100',
    }
  } else if (score >= 40) {
    return {
      level: 'medium',
      label: 'Media Prioridad',
      description: 'Buen candidato para automatización a medio plazo',
      color: 'text-yellow-700 bg-yellow-100',
    }
  } else {
    return {
      level: 'low',
      label: 'Baja Prioridad',
      description: 'Considerar automatización a largo plazo',
      color: 'text-gray-700 bg-gray-100',
    }
  }
}

// ROI calculation utilities  
export function calculateROI(
  currentCostMonthly: number,
  automationCostOneTime: number,
  automationSavingsMonthly: number,
  timeHorizonMonths: number = 12
): {
  roi: number;
  paybackMonths: number;
  totalSavings: number;
  netBenefit: number;
} {
  const totalSavings = automationSavingsMonthly * timeHorizonMonths
  const netBenefit = totalSavings - automationCostOneTime
  const roi = automationCostOneTime > 0 ? (netBenefit / automationCostOneTime) * 100 : 0
  const paybackMonths = automationSavingsMonthly > 0 ? automationCostOneTime / automationSavingsMonthly : Infinity
  
  return {
    roi,
    paybackMonths,
    totalSavings,
    netBenefit,
  }
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{8,20}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Text utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Array and object utilities
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Local storage utilities with error handling
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.warn(`Failed to save ${key} to localStorage`)
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    window.localStorage.removeItem(key)
  } catch {
    console.warn(`Failed to remove ${key} from localStorage`)
  }
}