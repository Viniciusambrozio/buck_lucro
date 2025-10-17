'use server'

import { createClient } from '@/lib/supabase/server'
import type { DadosGraficoLucro } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, eachHourOfInterval, startOfDay, endOfDay } from 'date-fns'

/**
 * Busca dados de lucro por horário para um dia específico
 */
export async function buscarDadosGraficoDia(data: string): Promise<DadosGraficoLucro[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data: calculos, error } = await supabase
    .from('calculos')
    .select('horario, lucro, data')
    .eq('user_id', user.id)
    .eq('data', data)
    .order('horario', { ascending: true })

  if (error) {
    console.error('Erro ao buscar dados do gráfico:', error)
    throw new Error('Erro ao buscar dados do gráfico')
  }

  return (calculos || []).map(c => ({
    data: c.data,
    horario: c.horario,
    lucro: Number(c.lucro),
    label: `${format(new Date(`${c.data}T${c.horario}`), 'dd/MM HH:mm')}`
  }))
}

/**
 * Busca dados de lucro agregados por dia para um mês específico
 */
export async function buscarDadosGraficoMes(ano: number, mes: number): Promise<DadosGraficoLucro[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const dataInicio = format(startOfMonth(new Date(ano, mes - 1)), 'yyyy-MM-dd')
  const dataFim = format(endOfMonth(new Date(ano, mes - 1)), 'yyyy-MM-dd')

  const { data: calculos, error } = await supabase
    .from('calculos')
    .select('data, lucro')
    .eq('user_id', user.id)
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: true })

  if (error) {
    console.error('Erro ao buscar dados do gráfico mensal:', error)
    throw new Error('Erro ao buscar dados do gráfico mensal')
  }

  // Agrupa por dia e soma os lucros
  const lucroPorDia = new Map<string, number>()
  
  calculos?.forEach(c => {
    const dataKey = c.data
    const lucroAtual = lucroPorDia.get(dataKey) || 0
    lucroPorDia.set(dataKey, lucroAtual + Number(c.lucro))
  })

  // Gera todos os dias do mês, mesmo os sem dados
  const diasDoMes = eachDayOfInterval({
    start: startOfMonth(new Date(ano, mes - 1)),
    end: endOfMonth(new Date(ano, mes - 1))
  })

  return diasDoMes.map(dia => {
    const dataKey = format(dia, 'yyyy-MM-dd')
    const lucro = lucroPorDia.get(dataKey) || 0

    return {
      data: dataKey,
      horario: '00:00:00',
      lucro,
      label: format(dia, 'dd/MM')
    }
  })
}


