import { ResumoDiario } from '@/components/dashboard/resumo-diario'
import { FormCalculo } from '@/components/dashboard/form-calculo'
import { HistoricoCalculos } from '@/components/dashboard/historico-calculos'
import { ConfigHorarios } from '@/components/dashboard/config-horarios'
import { buscarCalculosDoDia, calcularResumoDiario } from '@/app/actions/calculos'
import { buscarHorarios } from '@/app/actions/horarios'
import { calcularMetricasGerais } from '@/app/actions/metricas'
import { redirect } from 'next/navigation'

/**
 * Página Principal do Dashboard
 * Exibe resumo, formulário de lançamento e histórico de cálculos
 */
export default async function DashboardPage() {
  // Buscar dados do servidor
  const [calculosResult, resumoResult, horariosResult, metricasResult] = await Promise.all([
    buscarCalculosDoDia(),
    calcularResumoDiario(),
    buscarHorarios(),
    calcularMetricasGerais(),
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

      {/* Configuração de Horários */}
      <ConfigHorarios horariosIniciais={horarios} />

      {/* Formulário de Lançamento */}
      <FormCalculo />

      {/* Histórico de Cálculos */}
      <HistoricoCalculos calculos={calculos} adquirentes={adquirentes} />
    </div>
  )
}



