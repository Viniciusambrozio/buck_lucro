'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Movimentacao, MovimentacaoInput, MovimentacaoDetalhada, MetricasFluxoCaixa } from '@/types'
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

/**
 * Cria uma nova movimentação (saque/transferência)
 */
export async function criarMovimentacao(input: MovimentacaoInput): Promise<{ success: boolean; movimentacao?: Movimentacao; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // Valida se as contas existem e pertencem ao usuário
  const { data: contaOrigem } = await supabase
    .from('contas')
    .select('id, saldo_atual')
    .eq('id', input.conta_origem_id)
    .eq('user_id', user.id)
    .single()

  const { data: contaDestino } = await supabase
    .from('contas')
    .select('id')
    .eq('id', input.conta_destino_id)
    .eq('user_id', user.id)
    .single()

  if (!contaOrigem || !contaDestino) {
    return { success: false, error: 'Conta de origem ou destino inválida' }
  }

  // Valida se há saldo suficiente
  if (contaOrigem.saldo_atual < input.valor) {
    return { success: false, error: 'Saldo insuficiente na conta de origem' }
  }

  // Insere a movimentação (o trigger atualiza os saldos automaticamente)
  const { data, error } = await supabase
    .from('movimentacoes')
    .insert({
      user_id: user.id,
      data: input.data,
      horario: input.horario,
      conta_origem_id: input.conta_origem_id,
      conta_destino_id: input.conta_destino_id,
      valor: input.valor,
      tipo_movimentacao: input.tipo_movimentacao,
      observacao: input.observacao || null
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar movimentação:', error)
    return { success: false, error: 'Erro ao criar movimentação' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/historico')
  return { success: true, movimentacao: data }
}

/**
 * Busca movimentações do dia
 */
export async function buscarMovimentacoesDoDia(data?: string): Promise<MovimentacaoDetalhada[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const dataFiltro = data || format(new Date(), 'yyyy-MM-dd')

  const { data: movimentacoes, error } = await supabase
    .from('vw_movimentacoes_detalhadas')
    .select('*')
    .eq('user_id', user.id)
    .eq('data', dataFiltro)
    .order('horario', { ascending: false })

  if (error) {
    console.error('Erro ao buscar movimentações do dia:', error)
    throw new Error('Erro ao buscar movimentações do dia')
  }

  return movimentacoes || []
}

/**
 * Busca movimentações do mês
 */
export async function buscarMovimentacoesDoMes(ano: number, mes: number): Promise<MovimentacaoDetalhada[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const dataInicio = format(startOfMonth(new Date(ano, mes - 1)), 'yyyy-MM-dd')
  const dataFim = format(endOfMonth(new Date(ano, mes - 1)), 'yyyy-MM-dd')

  const { data: movimentacoes, error } = await supabase
    .from('vw_movimentacoes_detalhadas')
    .select('*')
    .eq('user_id', user.id)
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false })
    .order('horario', { ascending: false })

  if (error) {
    console.error('Erro ao buscar movimentações do mês:', error)
    throw new Error('Erro ao buscar movimentações do mês')
  }

  return movimentacoes || []
}

/**
 * Busca todas as movimentações com filtros
 */
export async function buscarMovimentacoes(filtros?: {
  dataInicio?: string
  dataFim?: string
  tipoMovimentacao?: string
  contaId?: string
}): Promise<MovimentacaoDetalhada[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  let query = supabase
    .from('vw_movimentacoes_detalhadas')
    .select('*')
    .eq('user_id', user.id)

  if (filtros?.dataInicio) {
    query = query.gte('data', filtros.dataInicio)
  }
  if (filtros?.dataFim) {
    query = query.lte('data', filtros.dataFim)
  }
  if (filtros?.tipoMovimentacao) {
    query = query.eq('tipo_movimentacao', filtros.tipoMovimentacao)
  }

  query = query
    .order('data', { ascending: false })
    .order('horario', { ascending: false })

  const { data: movimentacoes, error } = await query

  if (error) {
    console.error('Erro ao buscar movimentações:', error)
    throw new Error('Erro ao buscar movimentações')
  }

  return movimentacoes || []
}

/**
 * Calcula métricas de fluxo de caixa
 */
export async function calcularMetricasFluxoCaixa(data?: string): Promise<MetricasFluxoCaixa> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const dataHoje = data || format(new Date(), 'yyyy-MM-dd')
  const mesAtual = new Date(dataHoje)
  const dataInicioMes = format(startOfMonth(mesAtual), 'yyyy-MM-dd')

  // Total sacado no dia
  const { data: movimentacoesDia } = await supabase
    .from('movimentacoes')
    .select('valor')
    .eq('user_id', user.id)
    .eq('data', dataHoje)

  const totalSacadoDia = movimentacoesDia?.reduce((sum, m) => sum + Number(m.valor), 0) || 0

  // Total sacado no mês
  const { data: movimentacoesMes } = await supabase
    .from('movimentacoes')
    .select('valor')
    .eq('user_id', user.id)
    .gte('data', dataInicioMes)
    .lte('data', dataHoje)

  const totalSacadoMes = movimentacoesMes?.reduce((sum, m) => sum + Number(m.valor), 0) || 0

  // Saldo da conta Pix Out
  const { data: contaPixOut } = await supabase
    .from('contas')
    .select('saldo_atual')
    .eq('user_id', user.id)
    .eq('tipo', 'pix_out')
    .eq('ativo', true)
    .maybeSingle()

  const saldoPixout = contaPixOut?.saldo_atual || 0

  // Lucro disponível (saldo contas empresa)
  const { data: contasEmpresa } = await supabase
    .from('contas')
    .select('saldo_atual')
    .eq('user_id', user.id)
    .eq('tipo', 'empresa')
    .eq('ativo', true)

  const lucroDisponivel = contasEmpresa?.reduce((sum, c) => sum + Number(c.saldo_atual), 0) || 0

  // Total de movimentações
  const { count } = await supabase
    .from('movimentacoes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('data', dataHoje)

  return {
    total_sacado_dia: totalSacadoDia,
    total_sacado_mes: totalSacadoMes,
    saldo_pixout: saldoPixout,
    lucro_disponivel: lucroDisponivel,
    total_movimentacoes: count || 0
  }
}

/**
 * Deleta uma movimentação
 */
export async function deletarMovimentacao(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // Nota: Ao deletar a movimentação, seria necessário reverter os saldos manualmente
  // ou criar um trigger BEFORE DELETE similar
  const { error } = await supabase
    .from('movimentacoes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao deletar movimentação:', error)
    return { success: false, error: 'Erro ao deletar movimentação' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/historico')
  return { success: true }
}


