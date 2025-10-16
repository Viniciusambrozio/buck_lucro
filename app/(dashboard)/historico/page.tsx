import { HistoricoCompleto } from '@/components/historico/historico-completo'
import { buscarHistoricoCompleto } from '@/app/actions/historico'
import { redirect } from 'next/navigation'

/**
 * Página de Histórico Completo
 * Exibe todo o histórico com filtros, resumos e funcionalidades de edição/exclusão
 */
export default async function HistoricoPage() {
  // Buscar dados do histórico
  const historicoResult = await buscarHistoricoCompleto()

  // Verificar erros de autenticação
  if (historicoResult.error === 'Usuário não autenticado') {
    redirect('/login')
  }

  const historico = historicoResult.historico || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico Completo</h1>
        <p className="text-muted-foreground">
          Visualize, filtre e gerencie todo o histórico de cálculos com KPIs detalhados
        </p>
      </div>

      <HistoricoCompleto historico={historico} />
    </div>
  )
}
