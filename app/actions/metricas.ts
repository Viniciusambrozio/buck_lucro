'use server'

import { createClient } from '@/lib/supabase/server'
import { format, startOfWeek, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Calcula as métricas gerais para dashboard (semanal, mensal, totais)
 * @returns Objeto com as métricas calculadas
 */
export async function calcularMetricasGerais() {
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  const hoje = new Date()
  
  // Calcular datas de início da semana e do mês
  const inicioSemana = format(
    startOfWeek(hoje, { locale: ptBR }),
    'yyyy-MM-dd'
  )
  const inicioMes = format(startOfMonth(hoje), 'yyyy-MM-dd')

  try {
    // Buscando dados para métricas semanais (desde o início da semana)
    const { data: dadosSemanais, error: erroSemanal } = await supabase
      .from('calculos')
      .select('lucro, sellers, woovi_white, woovi_pixout, nomadfy, pluggou')
      .eq('user_id', user.id)
      .gte('data', inicioSemana)

    // Buscando dados para métricas mensais (desde o início do mês)
    const { data: dadosMensais, error: erroMensal } = await supabase
      .from('calculos')
      .select('lucro, sellers, woovi_white, woovi_pixout, nomadfy, pluggou')
      .eq('user_id', user.id)
      .gte('data', inicioMes)

    // Buscando todos os dados históricos (para totais gerais)
    const { data: dadosTotais, error: erroTotal } = await supabase
      .from('calculos')
      .select('lucro, sellers, woovi_white, woovi_pixout, nomadfy, pluggou')
      .eq('user_id', user.id)

    // Verificar erros
    if (erroSemanal || erroMensal || erroTotal) {
      console.error('Erro ao buscar dados para métricas:', {
        erroSemanal,
        erroMensal,
        erroTotal,
      })
      return { error: 'Erro ao calcular métricas' }
    }

    // Função auxiliar para calcular as métricas de um conjunto de dados
    const calcularMetricas = (dados: { lucro: number; sellers: number; woovi_white: number; woovi_pixout: number; nomadfy: number; pluggou: number }[] = []) => {
      const lucroTotal = dados.reduce((acc, item) => acc + Number(item.lucro), 0)
      const saqueTotal = dados.reduce((acc, item) => acc + Number(item.sellers), 0)
      const faturamentoTotal = dados.reduce(
        (acc, item) =>
          acc +
          Number(item.woovi_white) +
          Number(item.woovi_pixout) +
          Number(item.nomadfy) +
          Number(item.pluggou),
        0
      )

      return {
        lucro: Number(lucroTotal.toFixed(2)),
        saque: Number(saqueTotal.toFixed(2)),
        faturamento: Number(faturamentoTotal.toFixed(2)),
      }
    }

    // Calcular métricas para cada período
    const metricasSemanal = calcularMetricas(dadosSemanais || [])
    const metricasMensal = calcularMetricas(dadosMensais || [])
    const metricasTotais = calcularMetricas(dadosTotais || [])

    return {
      metricas: {
        lucro_semanal: metricasSemanal.lucro,
        lucro_mensal: metricasMensal.lucro,
        total_saque: metricasTotais.saque,
        total_faturamento: metricasTotais.faturamento,
        total_registros: dadosTotais?.length || 0,
      },
      error: null,
    }
  } catch (error) {
    console.error('Erro ao calcular métricas:', error)
    return { error: 'Erro interno ao calcular métricas' }
  }
}

