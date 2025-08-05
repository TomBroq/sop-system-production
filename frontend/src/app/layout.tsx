import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SOP Dashboard - Sistema de Levantamiento Automatizado de Procesos',
  description: 'Dashboard para gestión de clientes, formularios, SOPs y propuestas de automatización empresarial',
  keywords: ['SOP', 'automatización', 'procesos', 'consultoría', 'dashboard'],
  authors: [{ name: 'SOP Dashboard Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}