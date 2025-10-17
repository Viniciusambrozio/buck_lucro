'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Conta, ContaInput, ContaUpdate } from '@/types'

/**
 * Busca todas as contas do usuário
 */
export async function buscarContas(): Promise<Conta[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Usuário não autenticado')
    throw new Error('Usuário não autenticado')
  }

  console.log('Buscando contas para user_id:', user.id)

  // Buscar adquirentes e converter para formato de contas
  const { data: adquirentes, error } = await supabase
    .from('adquirentes')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .order('tipo_pix', { ascending: true })
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar adquirentes:', error)
    throw new Error('Erro ao buscar adquirentes')
  }

  console.log('Adquirentes encontrados:', adquirentes?.length || 0)

  // Converter adquirentes para formato de contas
  const contas: Conta[] = []

  // Adicionar contas baseadas nas adquirentes
  adquirentes?.forEach(adquirente => {
    contas.push({
      id: adquirente.id,
      user_id: adquirente.user_id,
      nome: adquirente.nome,
      tipo: adquirente.tipo_pix === 'pix_in' ? 'pix_in' : 'pix_out',
      adquirente_id: adquirente.id,
      saldo_atual: 0, // Valor padrão, pode ser ajustado conforme necessário
      ativo: adquirente.ativo,
      created_at: adquirente.created_at,
      updated_at: adquirente.updated_at
    })
  })

  // Adicionar conta da empresa (se não existir)
  const temContaEmpresa = contas.some(c => c.tipo === 'empresa')
  if (!temContaEmpresa) {
    contas.push({
      id: 'empresa-' + user.id,
      user_id: user.id,
      nome: 'Conta Empresa',
      tipo: 'empresa',
      adquirente_id: null,
      saldo_atual: 0,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }

  console.log('Contas convertidas:', contas.length)
  console.log('Dados das contas:', contas)

  return contas
}

/**
 * Busca contas ativas por tipo
 */
export async function buscarContasPorTipo(tipo: 'empresa' | 'pix_in' | 'pix_out'): Promise<Conta[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('contas')
    .select('*')
    .eq('user_id', user.id)
    .eq('tipo', tipo)
    .eq('ativo', true)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar contas por tipo:', error)
    throw new Error('Erro ao buscar contas por tipo')
  }

  return data || []
}

/**
 * Busca uma conta específica por ID
 */
export async function buscarContaPorId(id: string): Promise<Conta | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('contas')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Erro ao buscar conta:', error)
    return null
  }

  return data
}

/**
 * Cria uma nova conta
 */
export async function criarConta(input: ContaInput): Promise<{ success: boolean; conta?: Conta; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  const { data, error } = await supabase
    .from('contas')
    .insert({
      user_id: user.id,
      nome: input.nome,
      tipo: input.tipo,
      adquirente_id: input.adquirente_id || null,
      saldo_atual: input.saldo_atual || 0,
      ativo: input.ativo !== false
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar conta:', error)
    return { success: false, error: 'Erro ao criar conta' }
  }

  revalidatePath('/dashboard')
  return { success: true, conta: data }
}

/**
 * Atualiza uma conta existente
 */
export async function atualizarConta(update: ContaUpdate): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  const updateData: Record<string, any> = {}
  if (update.nome !== undefined) updateData.nome = update.nome
  if (update.tipo !== undefined) updateData.tipo = update.tipo
  if (update.adquirente_id !== undefined) updateData.adquirente_id = update.adquirente_id
  if (update.saldo_atual !== undefined) updateData.saldo_atual = update.saldo_atual
  if (update.ativo !== undefined) updateData.ativo = update.ativo

  const { error } = await supabase
    .from('contas')
    .update(updateData)
    .eq('id', update.id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao atualizar conta:', error)
    return { success: false, error: 'Erro ao atualizar conta' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Deleta uma conta (soft delete - marca como inativa)
 */
export async function deletarConta(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // Soft delete - apenas marca como inativa
  const { error } = await supabase
    .from('contas')
    .update({ ativo: false })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao deletar conta:', error)
    return { success: false, error: 'Erro ao deletar conta' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Busca o saldo atual de uma conta
 */
export async function buscarSaldoConta(contaId: string): Promise<number> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('contas')
    .select('saldo_atual')
    .eq('id', contaId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    console.error('Erro ao buscar saldo:', error)
    return 0
  }

  return data.saldo_atual
}

/**
 * Busca saldos consolidados por tipo
 */
export async function buscarSaldosConsolidados() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('vw_saldos_consolidados')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao buscar saldos consolidados:', error)
    throw new Error('Erro ao buscar saldos consolidados')
  }

  return data || []
}


