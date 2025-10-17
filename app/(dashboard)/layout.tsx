"use client"

import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClientOnly } from '@/components/client-only'
import { LogoBuck } from '@/components/logo-buck'

/**
 * Layout do Dashboard
 * Contém header com logo, navegação, toggle de tema e botão de logout
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-7xl">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
              <LogoBuck width={120} height={36} className="text-foreground" />
            </Link>
          </div>
                 <nav className="hidden md:flex items-center space-x-4 absolute left-1/2 transform -translate-x-1/2">
                   <ClientOnly fallback={<div className="text-sm font-medium px-4 py-2 rounded-md">Dashboard</div>}>
                     <Link
                       href="/dashboard"
                       className={`text-sm font-medium px-4 py-2 rounded-md transition-all duration-300 ${
                         pathname === "/dashboard"
                           ? "bg-white shadow-sm scale-105 text-black"
                           : "hover:bg-white hover:text-black"
                       }`}
                     >
                       Dashboard
                     </Link>
                   </ClientOnly>
                   <ClientOnly fallback={<div className="text-sm font-medium px-4 py-2 rounded-md">Adquirentes</div>}>
                     <Link
                       href="/adquirentes"
                       className={`text-sm font-medium px-4 py-2 rounded-md transition-all duration-300 ${
                         pathname === "/adquirentes"
                           ? "bg-white shadow-sm scale-105 text-black"
                           : "hover:bg-white hover:text-black"
                       }`}
                     >
                       Adquirentes
                     </Link>
                   </ClientOnly>
                  <ClientOnly fallback={<div className="text-sm font-medium px-4 py-2 rounded-md">Saques & Lucro</div>}>
                    <Link
                      href="/saques-lucro"
                      className={`text-sm font-medium px-4 py-2 rounded-md transition-all duration-300 ${
                        pathname === "/saques-lucro"
                          ? "bg-white shadow-sm scale-105 text-black"
                          : "hover:bg-white hover:text-black"
                      }`}
                    >
                      Saques & Lucro
                    </Link>
                  </ClientOnly>
                  <ClientOnly fallback={<div className="text-sm font-medium px-4 py-2 rounded-md">Histórico</div>}>
                    <Link
                      href="/historico"
                      className={`text-sm font-medium px-4 py-2 rounded-md transition-all duration-300 ${
                        pathname === "/historico"
                          ? "bg-white shadow-sm scale-105 text-black"
                          : "hover:bg-white hover:text-black"
                      }`}
                    >
                      Histórico
                    </Link>
                  </ClientOnly>
                 </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logout}>
              <Button variant="outline" type="submit">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  )
}

