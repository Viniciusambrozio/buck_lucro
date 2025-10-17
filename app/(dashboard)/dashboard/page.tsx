import { ResumoDiario } from '@/components/dashboard/resumo-diario'
import { FormCalculo } from '@/components/dashboard/form-calculo'
import { HistoricoCalculos } from '@/components/dashboard/historico-calculos'
import { ConfigHorarios } from '@/components/dashboard/config-horarios'
import { MetricasFluxoCaixaComponent } from '@/components/dashboard/metricas-fluxo-caixa'
import { FormSaque } from '@/components/dashboard/form-saque'
import { GraficoLucroWrapper } from '@/components/dashboard/grafico-lucro-wrapper'
import { HistoricoMovimentacoes } from '@/components/dashboard/historico-movimentacoes'
import { buscarCalculosDoDia, calcularResumoDiario } from '@/app/actions/calculos'
import { buscarHorarios } from '@/app/actions/horarios'
import { calcularMetricasGerais } from '@/app/actions/metricas'
import { calcularMetricasFluxoCaixa, buscarMovimentacoesDoDia } from '@/app/actions/movimentacoes'
import { buscarContas } from '@/app/actions/contas'
import { buscarDadosGraficoDia } from '@/app/actions/graficos'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Página Principal do Dashboard
 * Exibe resumo, formulário de lançamento, histórico de cálculos e fluxo de caixa
 */
export default async function DashboardPage() {
  const dataHoje = format(new Date(), 'yyyy-MM-dd')
  
  // Buscar dados do servidor
  const [
    calculosResult, 
    resumoResult, 
    horariosResult, 
    metricasResult,
    metricasFluxoCaixa,
    contas,
    movimentacoesDia,
    dadosGrafico
  ] = await Promise.all([
    buscarCalculosDoDia(),
    calcularResumoDiario(),
    buscarHorarios(),
    calcularMetricasGerais(),
    calcularMetricasFluxoCaixa(),
    buscarContas(),
    buscarMovimentacoesDoDia(),
    buscarDadosGraficoDia(dataHoje)
  ])

  // Verificar erros de autenticação
  if (
    calculosResult.error === 'Usuário não autenticado' ||
    resumoResult.error === 'Usuário não autenticado' ||
    horariosResult.error === 'Usuário não autenticado' ||
    metricasResult.error === 'Usuário não autenticado'
  ) {
    redirect('/login')
  }

  const calculos = calculosResult.calculos || []
  const adquirentes = calculosResult.adquirentes || []
  const resumo = resumoResult.resumo || {
    lucro_total: 0,
    media_por_horario: 0,
    numero_registros: 0,
  }
  const horarios = horariosResult.horarios || {
    horario_1: '09:00',
    horario_2: '13:00',
    horario_3: '18:00',
    horario_4: '22:00',
  }
  const metricas = metricasResult.metricas || {
    lucro_semanal: 0,
    lucro_mensal: 0,
    total_saque: 0,
    total_faturamento: 0,
    total_registros: 0,
  }

  return (
    <div className="space-y-8">
      {/* Header com ação de saque */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>
        <FormSaque contas={contas} />
      </div>

      {/* Métricas de Fluxo de Caixa */}
      <MetricasFluxoCaixaComponent metricas={metricasFluxoCaixa} />

      {/* Resumo Diário */}
      <ResumoDiario
        lucro_total={resumo.lucro_total}
        media_por_horario={resumo.media_por_horario}
        numero_registros={resumo.numero_registros}
        lucro_semanal={metricas.lucro_semanal}
        lucro_mensal={metricas.lucro_mensal}
        total_saque={metricas.total_saque}
        total_faturamento={metricas.total_faturamento}
      />

      {/* Gráfico de Lucro por Horário */}
      <GraficoLucroWrapper 
        dadosIniciais={dadosGrafico}
        dataInicial={new Date()}
      />

      {/* Configuração de Horários */}
      <ConfigHorarios horariosIniciais={horarios} />

      {/* Formulário de Lançamento */}
      <FormCalculo />

      {/* Histórico de Cálculos */}
      <HistoricoCalculos calculos={calculos} adquirentes={adquirentes} />

      {/* Últimas Movimentações */}
      {movimentacoesDia.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Movimentações de Hoje</h2>
            <Link href="/saques-lucro">
              <Button variant="outline">
                Ver Histórico Completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <HistoricoMovimentacoes 
            movimentacoes={movimentacoesDia}
            titulo="Últimas Movimentações"
            descricao="Saques e transferências realizados hoje"
          />
        </div>
      )}
    </div>
  )
}



