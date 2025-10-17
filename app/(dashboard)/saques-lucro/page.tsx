import { Suspense } from 'react'
import { CardSaqueRealizado } from '@/components/saques/card-saque-realizado'
import { CardLucroHoje } from '@/components/saques/card-lucro-hoje'
import { CardSaldoPixOut } from '@/components/saques/card-saldo-pix-out'
import { GraficoLucroHorarioWrapper } from '@/components/saques/grafico-lucro-horario-wrapper'
import { TabelaUltimosSaques } from '@/components/saques/tabela-ultimos-saques'
import { FormSaque } from '@/components/dashboard/form-saque'
import {
  obterResumoSaques,
  obterSaldoPixOut,
  obterHistoricoSaques,
} from '@/app/actions/saques'
import { buscarContas } from '@/app/actions/contas'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * Página: Saques e Lucro
 * Sistema de gestão de saques e visibilidade de lucro em tempo real
 */
export default async function SaquesLucroPage() {
  // Buscar dados do servidor
  const hoje = new Date().toISOString().split('T')[0]
  const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const [resumoGeralResult, resumoHojeResult, resumoOntemResult, saldoPixOutResult, historico, contas] =
    await Promise.all([
      obterResumoSaques(),
      obterResumoSaques({ data_inicio: `${hoje}T00:00:00`, data_fim: `${hoje}T23:59:59` }),
      obterResumoSaques({
        data_inicio: `${ontem}T00:00:00`,
        data_fim: `${ontem}T23:59:59`,
      }),
      obterSaldoPixOut(),
      obterHistoricoSaques({ limit: 20 }),
      buscarContas(),
    ])

  // Verificar autenticação
  if (resumoGeralResult.error === 'Usuário não autenticado') {
    redirect('/login')
  }

  const resumoGeral = resumoGeralResult.data || {
    total_sacado: 0,
    total_lucro: 0,
    total_transferencias: 0,
    total_garantias: 0,
    total_operacoes: 0,
    num_saques_lucro: 0,
    primeira_operacao: null,
    ultima_operacao: null,
  }

  const resumoHoje = resumoHojeResult.data || resumoGeral
  const resumoOntem = resumoOntemResult.data || resumoGeral

  const saldoPixOut = saldoPixOutResult.data || {
    id: '',
    user_id: '',
    saldo_total: 0,
    saldo_sellers: 0,
    saldo_disponivel: 0,
    updated_at: new Date().toISOString(),
  }

  const historicos = historico.data || []

  // Calcular variação de lucro hoje vs ontem
  const variacaoLucro =
    resumoOntem.total_lucro > 0
      ? ((resumoHoje.total_lucro - resumoOntem.total_lucro) / resumoOntem.total_lucro) * 100
      : 0

  // Calcular variação de total sacado
  const variacaoSacado =
    resumoOntem.total_sacado > 0
      ? ((resumoHoje.total_sacado - resumoOntem.total_sacado) / resumoOntem.total_sacado) * 100
      : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">💰 Saques e Lucro</h1>
            <p className="text-muted-foreground">
              Gerencie movimentações e acompanhe lucro em tempo real
            </p>
          </div>
        </div>
        <FormSaque contas={contas} />
      </div>

      {/* Cards Principais - KPIs */}
      <div className="grid gap-6 md:grid-cols-3">
        <CardSaqueRealizado
          totalSacado={resumoHoje.total_sacado}
          totalLucro={resumoHoje.total_lucro}
          variacao={variacaoSacado}
        />
        <CardLucroHoje lucroHoje={resumoHoje.total_lucro} variacao={variacaoLucro} />
        <CardSaldoPixOut saldo={saldoPixOut} />
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total de Operações</p>
          <p className="text-2xl font-bold">{resumoGeral.total_operacoes}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Transferências</p>
          <p className="text-2xl font-bold">
            R$ {resumoGeral.total_transferencias.toFixed(2)}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Garantias de Saldo</p>
          <p className="text-2xl font-bold">
            R$ {resumoGeral.total_garantias.toFixed(2)}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Saques de Lucro</p>
          <p className="text-2xl font-bold">{resumoGeral.num_saques_lucro}</p>
        </div>
      </div>

      {/* Gráfico de Lucro por Horário */}
      <Suspense
        fallback={
          <div className="h-[400px] flex items-center justify-center border rounded-lg">
            Carregando gráfico...
          </div>
        }
      >
        <GraficoLucroHorarioWrapper />
      </Suspense>

      {/* Tabela de Últimos Saques */}
      <TabelaUltimosSaques saques={historicos} limite={10} />
    </div>
  )
}


