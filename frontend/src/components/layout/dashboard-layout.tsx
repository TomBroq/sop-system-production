'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { NotificationsDropdown } from '@/components/dashboard/notifications-panel'
import { 
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  X,
  Home,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useDashboardStore, useUI } from '@/store/dashboard-store'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  submenu?: NavItem[]
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Clientes',
    href: '/clients',
    icon: Users,
    submenu: [
      { name: 'Lista de Clientes', href: '/clients', icon: Users },
      { name: 'Nuevo Cliente', href: '/clients/new', icon: Users },
    ]
  },
  {
    name: 'Formularios',
    href: '/forms',
    icon: FileText,
    submenu: [
      { name: 'Formularios Activos', href: '/forms', icon: FileText },
      { name: 'Respuestas', href: '/forms/responses', icon: FileText },
    ]
  },
  {
    name: 'SOPs',
    href: '/sops',
    icon: Briefcase,
    submenu: [
      { name: 'SOPs Generados', href: '/sops', icon: Briefcase },
      { name: 'Revisión Pendiente', href: '/sops/review', icon: Briefcase },
    ]
  },
  {
    name: 'Propuestas',
    href: '/proposals',
    icon: BookOpen,
    submenu: [
      { name: 'Propuestas Activas', href: '/proposals', icon: BookOpen },
      { name: 'Historial', href: '/proposals/history', icon: BookOpen },
    ]
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Base de Conocimiento',
    href: '/knowledge-base',
    icon: BookOpen,
    submenu: [
      { name: 'Industrias', href: '/knowledge-base/industries', icon: BookOpen },
      { name: 'Templates', href: '/knowledge-base/templates', icon: BookOpen },
      { name: 'Benchmarks', href: '/knowledge-base/benchmarks', icon: BookOpen },
    ]
  },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, isConnected, lastUpdate } = useUI()
  const { toggleSidebar, setSidebarCollapsed } = useDashboardStore()
  
  const [isMobile, setIsMobile] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
      }
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [setSidebarCollapsed])

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const hasActiveSubmenu = (submenu?: NavItem[]) => {
    return submenu?.some(item => isActiveRoute(item.href)) || false
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64",
        isMobile && sidebarCollapsed && "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">SOP Dashboard</h1>
                <p className="text-xs text-muted-foreground">Sistema de Automatización</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0"
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Connection Status */}
        <div className={cn(
          "px-4 py-2 border-b border-border",
          sidebarCollapsed && "px-2"
        )}>
          <div className={cn(
            "flex items-center space-x-2 text-xs",
            sidebarCollapsed && "justify-center"
          )}>
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                {!sidebarCollapsed && (
                  <span className="text-green-600">En línea</span>
                )}
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                {!sidebarCollapsed && (
                  <span className="text-red-600">Sin conexión</span>
                )}
              </>
            )}
          </div>
          {!sidebarCollapsed && lastUpdate && (
            <div className="text-xs text-muted-foreground mt-1">
              Actualizado: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto scrollbar-thin">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                        hasActiveSubmenu(item.submenu)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        sidebarCollapsed && "justify-center"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!sidebarCollapsed && <span>{item.name}</span>}
                      </div>
                      {!sidebarCollapsed && (
                        <ChevronDown className={cn(
                          "h-3 w-3 transition-transform",
                          expandedMenus.includes(item.name) && "rotate-180"
                        )} />
                      )}
                    </button>
                    
                    {!sidebarCollapsed && expandedMenus.includes(item.name) && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                "flex items-center space-x-3 px-3 py-2 text-xs rounded-lg transition-colors",
                                isActiveRoute(subItem.href)
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )}
                            >
                              <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                              <span>{subItem.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors",
                      isActiveRoute(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      sidebarCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className={cn(
            "flex items-center space-x-3",
            sidebarCollapsed && "justify-center"
          )}>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">
                      Admin User
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Consultor Principal
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-64"
      )}>
        {/* Top Header */}
        <header className="bg-background border-b border-border px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {(isMobile || sidebarCollapsed) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {navigation.find(item => isActiveRoute(item.href))?.name || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="h-4 w-4" />
              </Button>
              
              {/* Notifications */}
              <NotificationsDropdown />
              
              {/* Settings */}
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}