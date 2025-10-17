'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// TIPOS
// ============================================

export type TipoConta = 'pix_in' | 'pix_out' | 'conta_empresa'
export type TipoOperacao = 'lucro' | 'transferencia' | 'garantia_saldo'
export type PeriodoFiltro = 'dia' | 'mes' | 'semana' | 'ano'

export interface Saque {
  id: string
  user_id: string
  valor: number
  origem: TipoConta
  destino: TipoConta
  tipo_operacao: TipoOperacao
  adquirente_origem_id?: string | null
  adquirente_destino_id?: string | null
  observacoes?: string | null
  created_at: string
  updated_at: string
}

export interface SaldoPixOut {
  id: string
  user_id: string
  saldo_total: number
  saldo_sellers: number
  saldo_disponivel: number
  updated_at: string
}

export interface LucroPorHorario {
  horario: string
  dia: string
  hora: number
  lucro_horario: number
  num_saques_lucro: number
  num_operacoes_total: number
}

export interface LucroPorDia {
  dia: string
  lucro_dia: number
  num_saques_lucro: number
  num_operacoes_total: number
  primeira_operacao: string
  ultima_operacao: string
}

export interface ResumoSaques {
  total_sacado: number
  total_lucro: number
  total_transferencias: number
  total_garantias: number
  total_operacoes: number
  num_saques_lucro: number
  primeira_operacao: string | null
  ultima_operacao: string | null
}

export interface RegistrarSaqueParams {
  valor: number
  origem: TipoConta
  destino: TipoConta
  tipo_operacao: TipoOperacao
  adquirente_origem_id?: string | null
  adquirente_destino_id?: string | null
  observacoes?: string
}

// ============================================
// VALIDAÇÕES
// ============================================

function validarSaque(params: RegistrarSaqueParams): { valido: boolean; erro?: string } {
  const { valor, origem, destino, adquirente_origem_id, adquirente_destino_id } = params

  // Validar valor
  if (valor <= 0) {
    return { valido: false, erro: 'O valor deve ser maior que zero' }
  }

  // Validar origem e destino diferentes
  if (origem === destino && adquirente_origem_id === adquirente_destino_id) {
    return { valido: false, erro: 'Origem e destino não podem ser iguais' }
  }

  // Validar se adquirente_origem_id é necessário
  if (origem === 'pix_in' && !adquirente_origem_id) {
    return { valido: false, erro: 'Adquirente de origem é obrigatória para Pix In' }
  }

  // Validar se adquirente_destino_id é necessário
  if (destino === 'pix_in' && !adquirente_destino_id) {
    return { valido: false, erro: 'Adquirente de destino é obrigatória para Pix In' }
  }

  return { valido: true }
}

// ============================================
// ACTIONS: SAQUES
// ============================================

/**
 * Registra um novo saque no sistema
 */
export async function registrarSaque(params: RegistrarSaqueParams) {
  try {
    const supabase = await createClient()

    // Obter usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Validar dados
    const validacao = validarSaque(params)
    if (!validacao.valido) {
      return { success: false, error: validacao.erro }
    }

    // Verificar saldo se origem for pix_out
    if (params.origem === 'pix_out') {
      const saldoResult = await obterSaldoPixOut()
      if (!saldoResult.success || !saldoResult.data) {
        return { success: false, error: 'Erro ao verificar saldo Pix Out' }
      }

      if (saldoResult.data.saldo_disponivel < params.valor) {
        return {
          success: false,
          error: `Saldo insuficiente na Pix Out. Disponível: R$ ${saldoResult.data.saldo_disponivel.toFixed(2)}`,
        }
      }
    }

    // Verificar saldo se origem for adquirente pix_in
    if (params.origem === 'pix_in' && params.adquirente_origem_id) {
      const { data: adquirente, error: adqError } = await supabase
        .from('adquirentes')
        .select('saldo_atual')
        .eq('id', params.adquirente_origem_id)
        .single()

      if (adqError || !adquirente) {
        return { success: false, error: 'Adquirente de origem não encontrada' }
      }

      if (adquirente.saldo_atual < params.valor) {
        return {
          success: false,
          error: `Saldo insuficiente na adquirente. Disponível: R$ ${adquirente.saldo_atual.toFixed(2)}`,
        }
      }
    }

    // Inserir saque
    const { data, error } = await supabase
      .from('saques')
      .insert({
        user_id: user.id,
        valor: params.valor,
        origem: params.origem,
        destino: params.destino,
        tipo_operacao: params.tipo_operacao,
        adquirente_origem_id: params.adquirente_origem_id || null,
        adquirente_destino_id: params.adquirente_destino_id || null,
        observacoes: params.observacoes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao registrar saque:', error)
      return { success: false, error: 'Erro ao registrar saque' }
    }

    // Atualizar saldo da adquirente de origem se for pix_in
    if (params.origem === 'pix_in' && params.adquirente_origem_id) {
      const { error: updateError } = await supabase.rpc('decrementar_saldo', {
        adquirente_id: params.adquirente_origem_id,
        valor: params.valor,
      })

      if (updateError) {
        console.error('Erro ao atualizar saldo da adquirente:', updateError)
      }
    }

    // Atualizar saldo da adquirente de destino se for pix_in
    if (params.destino === 'pix_in' && params.adquirente_destino_id) {
      const { error: updateError } = await supabase.rpc('incrementar_saldo', {
        adquirente_id: params.adquirente_destino_id,
        valor: params.valor,
      })

      if (updateError) {
        console.error('Erro ao atualizar saldo da adquirente:', updateError)
      }
    }

    // Revalidar páginas
    revalidatePath('/dashboard')
    revalidatePath('/historico')

    return { success: true, data }
  } catch (error) {
    console.error('Erro ao registrar saque:', error)
    return { success: false, error: 'Erro inesperado ao registrar saque' }
  }
}

/**
 * Obtém o histórico de saques com filtros opcionais
 */
export async function obterHistoricoSaques(options?: {
  limit?: number
  offset?: number
  tipo_operacao?: TipoOperacao
  data_inicio?: string
  data_fim?: string
}) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    let query = supabase
      .from('saques')
      .select(
        `
        *,
        adquirente_origem:adquirente_origem_id(id, nome, categoria),
        adquirente_destino:adquirente_destino_id(id, nome, categoria)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (options?.tipo_operacao) {
      query = query.eq('tipo_operacao', options.tipo_operacao)
    }

    if (options?.data_inicio) {
      query = query.gte('created_at', options.data_inicio)
    }

    if (options?.data_fim) {
      query = query.lte('created_at', options.data_fim)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao obter histórico de saques:', error)
      return { success: false, error: 'Erro ao obter histórico de saques' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Erro ao obter histórico de saques:', error)
    return { success: false, error: 'Erro inesperado ao obter histórico de saques' }
  }
}

/**
 * Obtém o lucro por horário para gráficos
 */
export async function obterLucroPorHorario(options?: {
  data?: string // YYYY-MM-DD
  periodo?: PeriodoFiltro
}) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    let query = supabase.from('lucro_por_horario').select('*').eq('user_id', user.id)

    // Filtrar por data específica
    if (options?.data) {
      query = query.eq('dia', options.data)
    }

    // Filtrar por período
    if (options?.periodo) {
      const hoje = new Date()
      let dataInicio: Date

      switch (options.periodo) {
        case 'dia':
          dataInicio = new Date(hoje.setHours(0, 0, 0, 0))
          break
        case 'semana':
          dataInicio = new Date(hoje.setDate(hoje.getDate() - 7))
          break
        case 'mes':
          dataInicio = new Date(hoje.setMonth(hoje.getMonth() - 1))
          break
        case 'ano':
          dataInicio = new Date(hoje.setFullYear(hoje.getFullYear() - 1))
          break
      }

      query = query.gte('horario', dataInicio.toISOString())
    }

    query = query.order('horario', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Erro ao obter lucro por horário:', error)
      return { success: false, error: 'Erro ao obter lucro por horário' }
    }

    return { success: true, data: data as LucroPorHorario[] }
  } catch (error) {
    console.error('Erro ao obter lucro por horário:', error)
    return { success: false, error: 'Erro inesperado ao obter lucro por horário' }
  }
}

/**
 * Obtém o lucro por dia para visão mensal
 */
export async function obterLucroPorDia(options?: {
  mes?: string // YYYY-MM
  ano?: string // YYYY
}) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    let query = supabase.from('lucro_por_dia').select('*').eq('user_id', user.id)

    // Filtrar por mês
    if (options?.mes) {
      const [ano, mes] = options.mes.split('-')
      const primeiroDia = `${ano}-${mes}-01`
      const ultimoDia = `${ano}-${mes}-31`
      query = query.gte('dia', primeiroDia).lte('dia', ultimoDia)
    }

    // Filtrar por ano
    if (options?.ano) {
      const primeiroDia = `${options.ano}-01-01`
      const ultimoDia = `${options.ano}-12-31`
      query = query.gte('dia', primeiroDia).lte('dia', ultimoDia)
    }

    query = query.order('dia', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Erro ao obter lucro por dia:', error)
      return { success: false, error: 'Erro ao obter lucro por dia' }
    }

    return { success: true, data: data as LucroPorDia[] }
  } catch (error) {
    console.error('Erro ao obter lucro por dia:', error)
    return { success: false, error: 'Erro inesperado ao obter lucro por dia' }
  }
}

/**
 * Obtém o resumo geral de saques
 */
export async function obterResumoSaques(options?: {
  data_inicio?: string
  data_fim?: string
}) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Se houver filtros de data, calcular manualmente
    if (options?.data_inicio || options?.data_fim) {
      let query = supabase.from('saques').select('*').eq('user_id', user.id)

      if (options.data_inicio) {
        query = query.gte('created_at', options.data_inicio)
      }

      if (options.data_fim) {
        query = query.lte('created_at', options.data_fim)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao obter resumo de saques:', error)
        return { success: false, error: 'Erro ao obter resumo de saques' }
      }

      // Calcular resumo manualmente
      const resumo: ResumoSaques = {
        total_sacado: data.reduce((acc, s) => acc + Number(s.valor), 0),
        total_lucro: data
          .filter((s) => s.tipo_operacao === 'lucro')
          .reduce((acc, s) => acc + Number(s.valor), 0),
        total_transferencias: data
          .filter((s) => s.tipo_operacao === 'transferencia')
          .reduce((acc, s) => acc + Number(s.valor), 0),
        total_garantias: data
          .filter((s) => s.tipo_operacao === 'garantia_saldo')
          .reduce((acc, s) => acc + Number(s.valor), 0),
        total_operacoes: data.length,
        num_saques_lucro: data.filter((s) => s.tipo_operacao === 'lucro').length,
        primeira_operacao: data.length > 0 ? data[data.length - 1].created_at : null,
        ultima_operacao: data.length > 0 ? data[0].created_at : null,
      }

      return { success: true, data: resumo }
    }

    // Usar view se não houver filtros
    const { data, error } = await supabase
      .from('resumo_saques')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Erro ao obter resumo de saques:', error)
      // Se não houver dados, retornar resumo vazio
      if (error.code === 'PGRST116') {
        return {
          success: true,
          data: {
            total_sacado: 0,
            total_lucro: 0,
            total_transferencias: 0,
            total_garantias: 0,
            total_operacoes: 0,
            num_saques_lucro: 0,
            primeira_operacao: null,
            ultima_operacao: null,
          },
        }
      }
      return { success: false, error: 'Erro ao obter resumo de saques' }
    }

    return { success: true, data: data as ResumoSaques }
  } catch (error) {
    console.error('Erro ao obter resumo de saques:', error)
    return { success: false, error: 'Erro inesperado ao obter resumo de saques' }
  }
}

// ============================================
// ACTIONS: SALDO PIX OUT
// ============================================

/**
 * Obtém o saldo atual da conta Pix Out
 */
export async function obterSaldoPixOut() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
      .from('saldo_pix_out')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // Se não existir, criar com saldo zerado
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('saldo_pix_out')
          .insert({
            user_id: user.id,
            saldo_total: 0,
            saldo_sellers: 0,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Erro ao criar saldo Pix Out:', insertError)
          return { success: false, error: 'Erro ao criar saldo Pix Out' }
        }

        return { success: true, data: newData as SaldoPixOut }
      }

      console.error('Erro ao obter saldo Pix Out:', error)
      return { success: false, error: 'Erro ao obter saldo Pix Out' }
    }

    return { success: true, data: data as SaldoPixOut }
  } catch (error) {
    console.error('Erro ao obter saldo Pix Out:', error)
    return { success: false, error: 'Erro inesperado ao obter saldo Pix Out' }
  }
}

/**
 * Atualiza o saldo dos sellers na conta Pix Out
 */
export async function atualizarSaldoSellers(saldo_sellers: number) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    if (saldo_sellers < 0) {
      return { success: false, error: 'Saldo dos sellers não pode ser negativo' }
    }

    const { data, error } = await supabase
      .from('saldo_pix_out')
      .update({ saldo_sellers })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar saldo dos sellers:', error)
      return { success: false, error: 'Erro ao atualizar saldo dos sellers' }
    }

    revalidatePath('/dashboard')

    return { success: true, data: data as SaldoPixOut }
  } catch (error) {
    console.error('Erro ao atualizar saldo dos sellers:', error)
    return { success: false, error: 'Erro inesperado ao atualizar saldo dos sellers' }
  }
}


