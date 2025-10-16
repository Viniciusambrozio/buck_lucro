'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Adquirente } from '@/types'

export interface HistoricoItem {
  id: string
  data: string
  horario: string
  woovi_white: number
  woovi_pixout: number
  nomadfy: number
  pluggou: number
  sellers: number
  lucro: number
  created_at: string
}

export interface ResumoDia {
  data: string
  total_lucro: number
  total_registros: number
  primeiro_horario: string
  ultimo_horario: string
  calculos: HistoricoItem[]
  adquirentes?: Adquirente[] // Adquirentes que tiveram atividade neste dia
}

/**
 * Buscar histórico completo de cálculos
 */
export async function buscarHistoricoCompleto() {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { historico: null, error: 'Usuário não autenticado' }
    }
    
    // Buscar todos os cálculos ordenados por data e horário
    const { data: calculos, error } = await supabase
      .from('calculos')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false })
      .order('horario', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar histórico:', error)
      return { historico: null, error: 'Falha ao buscar histórico' }
    }
    
    // Agrupar cálculos por dia
    const historicoPorDia: ResumoDia[] = []
    const calculosPorData: { [data: string]: HistoricoItem[] } = {}
    
    calculos.forEach(calculo => {
      const data = calculo.data
      if (!calculosPorData[data]) {
        calculosPorData[data] = []
      }
      calculosPorData[data].push(calculo)
    })
    
    // Criar resumos por dia
    for (const data of Object.keys(calculosPorData)) {
      const calculosDoDia = calculosPorData[data]
      const totalLucro = calculosDoDia.reduce((acc, calc) => acc + Number(calc.lucro), 0)
      const horarios = calculosDoDia.map(calc => calc.horario).sort()
      
      // Buscar adquirentes que tiveram atividade nesta data
      const { buscarAdquirentesComAtividadePorData } = await import('./adquirentes')
      const adquirentesResult = await buscarAdquirentesComAtividadePorData(data)
      
      historicoPorDia.push({
        data,
        total_lucro: totalLucro,
        total_registros: calculosDoDia.length,
        primeiro_horario: horarios[horarios.length - 1], // Último horário (mais recente)
        ultimo_horario: horarios[0], // Primeiro horário (mais antigo)
        calculos: calculosDoDia,
        adquirentes: adquirentesResult.adquirentes || []
      })
    }
    
    return { historico: historicoPorDia, error: null }
  } catch (error) {
    console.error('Erro na busca do histórico:', error)
    return { historico: null, error: 'Erro interno ao buscar histórico' }
  }
}

/**
 * Buscar histórico por período específico
 */
export async function buscarHistoricoPorPeriodo(dataInicio: string, dataFim: string) {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { historico: null, error: 'Usuário não autenticado' }
    }
    
    // Buscar cálculos no período
    const { data: calculos, error } = await supabase
      .from('calculos')
      .select('*')
      .eq('user_id', user.id)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: false })
      .order('horario', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar histórico por período:', error)
      return { historico: null, error: 'Falha ao buscar histórico por período' }
    }
    
    // Agrupar por dia (mesmo processo do método anterior)
    const historicoPorDia: ResumoDia[] = []
    const calculosPorData: { [data: string]: HistoricoItem[] } = {}
    
    calculos.forEach(calculo => {
      const data = calculo.data
      if (!calculosPorData[data]) {
        calculosPorData[data] = []
      }
      calculosPorData[data].push(calculo)
    })
    
    Object.keys(calculosPorData).forEach(data => {
      const calculosDoDia = calculosPorData[data]
      const totalLucro = calculosDoDia.reduce((acc, calc) => acc + Number(calc.lucro), 0)
      const horarios = calculosDoDia.map(calc => calc.horario).sort()
      
      historicoPorDia.push({
        data,
        total_lucro: totalLucro,
        total_registros: calculosDoDia.length,
        primeiro_horario: horarios[horarios.length - 1],
        ultimo_horario: horarios[0],
        calculos: calculosDoDia
      })
    })
    
    return { historico: historicoPorDia, error: null }
  } catch (error) {
    console.error('Erro na busca do histórico por período:', error)
    return { historico: null, error: 'Erro interno ao buscar histórico por período' }
  }
}

/**
 * Excluir um cálculo específico
 */
export async function excluirCalculo(id: string) {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }
    
    // Verificar se o cálculo pertence ao usuário
    const { data: calculoAtual } = await supabase
      .from('calculos')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (!calculoAtual || calculoAtual.user_id !== user.id) {
      return { success: false, error: 'Cálculo não encontrado ou permissão negada' }
    }
    
    // Excluir cálculo
    const { error } = await supabase
      .from('calculos')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao excluir cálculo:', error)
      return { success: false, error: 'Falha ao excluir cálculo' }
    }
    
    revalidatePath('/historico')
    revalidatePath('/dashboard')
    return { success: true, error: null }
  } catch (error) {
    console.error('Erro ao excluir cálculo:', error)
    return { success: false, error: 'Erro interno ao excluir cálculo' }
  }
}

/**
 * Buscar cálculos de uma adquirente específica
 */
export async function buscarCalculosPorAdquirente(adquirenteId: string) {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { calculos: null, error: 'Usuário não autenticado' }
    }
    
    // Buscar a adquirente primeiro para obter o nome
    const { data: adquirente } = await supabase
      .from('adquirentes')
      .select('nome')
      .eq('id', adquirenteId)
      .eq('user_id', user.id)
      .single()
    
    if (!adquirente) {
      return { calculos: null, error: 'Adquirente não encontrada' }
    }
    
    // Buscar todos os cálculos do usuário
    const { data: todosCalculos, error } = await supabase
      .from('calculos')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false })
      .order('horario', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar cálculos:', error)
      return { calculos: null, error: 'Falha ao buscar cálculos' }
    }
    
    // Filtrar cálculos que têm valores para esta adquirente
    const calculosDaAdquirente = todosCalculos.filter(calculo => {
      const nomeAdquirente = adquirente.nome.toLowerCase()
      
      // Mapear baseado no nome da adquirente
      if (nomeAdquirente.includes('woovi') && nomeAdquirente.includes('gnvn')) {
        return calculo.woovi_white > 0
      } else if (nomeAdquirente.includes('woovi') && (nomeAdquirente.includes('royalt') || nomeAdquirente.includes('tech'))) {
        return calculo.woovi_pixout > 0
      } else if (nomeAdquirente.includes('nomad')) {
        return calculo.nomadfy > 0
      } else if (nomeAdquirente.includes('pluggou')) {
        return calculo.pluggou > 0
      }
      
      return false
    })
    
    return { calculos: calculosDaAdquirente, error: null }
  } catch (error) {
    console.error('Erro na busca de cálculos por adquirente:', error)
    return { calculos: null, error: 'Erro interno ao buscar cálculos' }
  }
}

/**
 * Atualizar um cálculo existente
 */
export async function atualizarCalculo(id: string, data: {
  woovi_white: number
  woovi_pixout: number
  nomadfy: number
  pluggou: number
  sellers: number
  horario?: string
}) {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }
    
    // Verificar se o cálculo pertence ao usuário
    const { data: calculoAtual } = await supabase
      .from('calculos')
      .select('user_id, horario')
      .eq('id', id)
      .single()
    
    if (!calculoAtual || calculoAtual.user_id !== user.id) {
      return { success: false, error: 'Cálculo não encontrado ou permissão negada' }
    }
    
    // Calcular novo lucro
    const { calcularLucro } = await import('@/lib/calculos')
    const lucro = calcularLucro(data)
    
    // Atualizar cálculo
    const { error } = await supabase
      .from('calculos')
      .update({
        woovi_white: data.woovi_white,
        woovi_pixout: data.woovi_pixout,
        nomadfy: data.nomadfy,
        pluggou: data.pluggou,
        sellers: data.sellers,
        lucro: lucro,
        horario: data.horario || calculoAtual.horario
      })
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao atualizar cálculo:', error)
      return { success: false, error: 'Falha ao atualizar cálculo' }
    }
    
    revalidatePath('/historico')
    revalidatePath('/dashboard')
    return { success: true, error: null }
  } catch (error) {
    console.error('Erro ao atualizar cálculo:', error)
    return { success: false, error: 'Erro interno ao atualizar cálculo' }
  }
}
