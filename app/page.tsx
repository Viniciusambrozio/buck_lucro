import { LogoBuck } from '@/components/logo-buck'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Página inicial com logo e redirecionamento
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-8">
        {/* Logo centralizado */}
        <div className="flex justify-center">
          <LogoBuck width={200} height={60} className="text-foreground" />
        </div>
        
        {/* Descrição */}
        <div className="space-y-4 max-w-md">
          <h1 className="text-2xl font-semibold text-foreground">
            Sistema de Cálculo de Lucro Operacional
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas operações financeiras com precisão e eficiência.
          </p>
        </div>
        
        {/* Botão de acesso */}
        <div className="pt-4">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Acessar Sistema
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
