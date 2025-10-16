'use server'

import { createClient } from '@/lib/supabase/server'
import { calculoSchema } from '@/lib/validations/calculo'
import { calcularLucro } from '@/lib/calculos'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

/**
 * Salvar um novo cálculo de lucro
 */
export async function salvarCalculo(data: {
  woovi_white: number
  woovi_pixout: number
  nomadfy: number
  pluggou: number
  sellers: number
  horario?: string // Horário personalizado opcional
}) {
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  // Validar dados
  const validation = calculoSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Calcular lucro
  const lucro = calcularLucro(data)

  // Obter data atual (timezone Brasil)
  const agora = new Date()
  // Converter para timezone do Brasil (UTC-3)
  const brasilTime = new Date(agora.getTime() - (3 * 60 * 60 * 1000))
  const dataAtual = format(brasilTime, 'yyyy-MM-dd')
  
  // Debug: verificar a data que está sendo salva
  console.log('Data sendo salva:', dataAtual, 'Timestamp atual:', agora.toISOString())
  
  // Usar o horário fornecido ou o atual
  const horarioAtual = data.horario || format(brasilTime, 'HH:mm:ss')

  // Inserir no banco
  const { error } = await supabase.from('calculos').insert({
    user_id: user.id,
    data: dataAtual,
    horario: horarioAtual,
    woovi_white: data.woovi_white,
    woovi_pixout: data.woovi_pixout,
    nomadfy: data.nomadfy,
    pluggou: data.pluggou,
    sellers: data.sellers,
    lucro: lucro,
  })

  if (error) {
    console.error('Erro ao salvar cálculo:', error)
    return { error: 'Erro ao salvar cálculo' }
  }

  revalidatePath('/dashboard')
  return { success: true, lucro }
}

/**
 * Buscar cálculos de uma data específica
 */
export async function buscarCalculosDoDia(data?: string) {
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  // Se não foi fornecida data, usar hoje (timezone Brasil)
  const agora = new Date()
  // Converter para timezone do Brasil (UTC-3)
  const brasilTime = new Date(agora.getTime() - (3 * 60 * 60 * 1000))
  const dataConsulta = data || format(brasilTime, 'yyyy-MM-dd')

  // Debug: verificar a data que está sendo consultada
  console.log('Data sendo consultada:', dataConsulta, 'Timestamp atual:', agora.toISOString())

  const { data: calculos, error } = await supabase
    .from('calculos')
    .select('*')
    .eq('user_id', user.id)
    .eq('data', dataConsulta)
    .order('horario', { ascending: false })

  if (error) {
    console.error('Erro ao buscar cálculos:', error)
    return { error: 'Erro ao buscar cálculos' }
  }

  // Buscar adquirentes que tiveram atividade nesta data específica
  const { buscarAdquirentesComAtividadePorData } = await import('./adquirentes')
  const adquirentesResult = await buscarAdquirentesComAtividadePorData(dataConsulta)
  
  return { 
    calculos, 
    adquirentes: adquirentesResult.adquirentes || [],
    error: adquirentesResult.error
  }
}

/**
 * Calcular resumo diário
 */
export async function calcularResumoDiario(data?: string) {
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  // Se não foi fornecida data, usar hoje (timezone Brasil)
  const agora = new Date()
  // Converter para timezone do Brasil (UTC-3)
  const brasilTime = new Date(agora.getTime() - (3 * 60 * 60 * 1000))
  const dataConsulta = data || format(brasilTime, 'yyyy-MM-dd')

  const { data: calculos, error } = await supabase
    .from('calculos')
    .select('lucro')
    .eq('user_id', user.id)
    .eq('data', dataConsulta)

  if (error) {
    console.error('Erro ao calcular resumo:', error)
    return { error: 'Erro ao calcular resumo' }
  }

  const lucro_total = calculos.reduce((acc, calc) => acc + Number(calc.lucro), 0)
  const numero_registros = calculos.length
  const media_por_horario = numero_registros > 0 ? lucro_total / numero_registros : 0

  return {
    resumo: {
      lucro_total: Number(lucro_total.toFixed(2)),
      media_por_horario: Number(media_por_horario.toFixed(2)),
      numero_registros,
    },
  }
}

