import { LoginForm } from '@/components/auth/login-form'
import { LogoBuck } from '@/components/logo-buck'
import Link from 'next/link'

/**
 * Página de Login
 * Interface minimalista para autenticação de usuários
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Logo no topo */}
      <div className="mb-8">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <LogoBuck width={160} height={48} className="text-foreground" />
        </Link>
      </div>
      
      {/* Formulário de login */}
      <LoginForm />
    </div>
  )
}

