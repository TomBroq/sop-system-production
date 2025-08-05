'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Clock,
  MoreHorizontal,
  Check,
  X,
  ExternalLink,
  Trash2
} from 'lucide-react'
import { useDashboardStore, useNotifications } from '@/store/dashboard-store'
import { formatRelativeTime } from '@/lib/utils'
import type { NotificationItem } from '@/types'
import Link from 'next/link'

interface NotificationsPanelProps {
  maxHeight?: string
  showHeader?: boolean
  compact?: boolean
}

export function NotificationsPanel({ 
  maxHeight = 'max-h-96', 
  showHeader = true,
  compact = false 
}: NotificationsPanelProps) {
  const { notifications, unreadCount } = useNotifications()
  const { markNotificationRead, markAllNotificationsRead, clearNotifications } = useDashboardStore()
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' ? true : !notification.read
  )

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationBg = (type: NotificationItem['type'], read: boolean) => {
    const opacity = read ? '50' : '100'
    switch (type) {
      case 'success':
        return `bg-green-${opacity} border-green-200`
      case 'warning':
        return `bg-yellow-${opacity} border-yellow-200`
      case 'error':
        return `bg-red-${opacity} border-red-200`
      case 'info':
      default:
        return `bg-blue-${opacity} border-blue-200`
    }
  }

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      markNotificationRead(notification.id)
    }
  }

  if (notifications.length === 0) {
    return (
      <Card className="dashboard-card">
        {showHeader && (
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notificaciones</span>
              </div>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay notificaciones</h3>
            <p className="text-muted-foreground">
              Las notificaciones aparecerán aquí cuando ocurran eventos importantes
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="dashboard-card">
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notificaciones</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filter === 'all' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filter === 'unread' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sin leer ({unreadCount})
                </button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="pt-0">
        <div className={`space-y-3 overflow-y-auto scrollbar-thin ${maxHeight}`}>
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                getNotificationBg(notification.type, notification.read)
              } ${!notification.read ? 'shadow-sm' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              {!notification.read && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
              )}
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-medium ${
                      notification.read ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(notification.timestamp)}</span>
                    </div>
                  </div>
                  
                  <p className={`text-sm ${
                    notification.read ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {notification.message}
                  </p>
                  
                  {notification.action_url && (
                    <div className="mt-2">
                      <Link
                        href={notification.action_url}
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver detalles
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Aquí puedes agregar más acciones como eliminar notificación individual
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredNotifications.length === 0 && filter === 'unread' && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">¡Todo al día!</h3>
            <p className="text-muted-foreground">
              No tienes notificaciones sin leer
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente compacto para sidebar o header
export function NotificationsDropdown() {
  const { notifications, unreadCount } = useNotifications()
  const { markNotificationRead } = useDashboardStore()
  const [isOpen, setIsOpen] = useState(false)

  const recentNotifications = notifications.slice(0, 5)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 z-20">
            <NotificationsPanel 
              maxHeight="max-h-80" 
              showHeader={false}
              compact={true}
            />
          </div>
        </>
      )}
    </div>
  )
}