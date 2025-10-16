'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { Adquirente, AdquirenteInput, AdquirenteUpdate } from '@/types'

// Schema de validação para nova adquirente
const adquirenteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  tipo_pix: z.enum(['pix_in', 'pix_out'], {
    message: 'Selecione um tipo válido (pix_in ou pix_out)'
  }),
  categoria_operacao: z.enum(['white', 'gray', 'black']).optional().default('white'),
  ativo: z.boolean().default(true),
})

/**
 * Busca todas as adquirentes do usuário logado
 * @returns Lista de adquirentes ou erro
 */
export async function buscarAdquirentes() {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { adquirentes: null, error: 'Usuário não autenticado' }
    }
    
    // Buscar adquirentes
    const { data: adquirentes, error } = await supabase
      .from('adquirentes')
      .select('*')
      .order('nome')
    
    if (error) {
      console.error('Erro ao buscar adquirentes:', error)
      return { adquirentes: null, error: 'Falha ao buscar adquirentes' }
    }
    
    return { adquirentes, error: null }
  } catch (error) {
    console.error('Erro na busca de adquirentes:', error)
    return { adquirentes: null, error: 'Erro interno ao buscar adquirentes' }
  }
}

/**
 * Busca apenas adquirentes ativas para cálculo
 * @returns Lista de adquirentes ativas ou erro
 */
export async function buscarAdquirentesAtivas() {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { adquirentes: null, error: 'Usuário não autenticado' }
    }
    
    // Buscar adquirentes ativas
    const { data: adquirentes, error } = await supabase
      .from('adquirentes')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    
    if (error) {
      console.error('Erro ao buscar adquirentes ativas:', error)
      return { adquirentes: null, error: 'Falha ao buscar adquirentes ativas' }
    }
    
    return { adquirentes, error: null }
  } catch (error) {
    console.error('Erro na busca de adquirentes ativas:', error)
    return { adquirentes: null, error: 'Erro interno ao buscar adquirentes ativas' }
  }
}

/**
 * Adiciona uma nova adquirente
 * @param input Dados da adquirente a ser adicionada
 * @returns Resultado da operação
 */
export async function adicionarAdquirente(input: AdquirenteInput) {
  try {
    // Validar input
    const dadosValidados = adquirenteSchema.safeParse(input)
    if (!dadosValidados.success) {
      return { 
        success: false, 
        error: dadosValidados.error.issues.map(e => e.message).join(', ') 
      }
    }
    
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }
    
    // Inserir adquirente
    const { data, error } = await supabase
      .from('adquirentes')
      .insert([
        { 
          ...dadosValidados.data,
          user_id: user.id,
        }
      ])
      .select()
    
    if (error) {
      console.error('Erro ao adicionar adquirente:', error)
      return { success: false, error: 'Falha ao adicionar adquirente' }
    }
    
    return { success: true, adquirente: data[0], error: null }
  } catch (error) {
    console.error('Erro ao adicionar adquirente:', error)
    return { success: false, error: 'Erro interno ao adicionar adquirente' }
  }
}

/**
 * Atualiza uma adquirente existente
 * @param input Dados da adquirente a ser atualizada
 * @returns Resultado da operação
 */
export async function atualizarAdquirente(input: AdquirenteUpdate) {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }
    
    // Verificar se a adquirente pertence ao usuário
    const { data: adquirenteAtual } = await supabase
      .from('adquirentes')
      .select('user_id')
      .eq('id', input.id)
      .single()
    
    if (!adquirenteAtual || adquirenteAtual.user_id !== user.id) {
      return { success: false, error: 'Adquirente não encontrada ou permissão negada' }
    }
    
    // Criar objeto com campos a atualizar
    const updateData: Partial<Adquirente> = {}
    if (input.nome !== undefined) updateData.nome = input.nome
    if (input.tipo_pix !== undefined) updateData.tipo_pix = input.tipo_pix
    if (input.categoria_operacao !== undefined) updateData.categoria_operacao = input.categoria_operacao
    if (input.ativo !== undefined) updateData.ativo = input.ativo
    
    // Atualizar adquirente
    const { data, error } = await supabase
      .from('adquirentes')
      .update(updateData)
      .eq('id', input.id)
      .select()
    
    if (error) {
      console.error('Erro ao atualizar adquirente:', error)
      return { success: false, error: 'Falha ao atualizar adquirente' }
    }
    
    return { success: true, adquirente: data[0], error: null }
  } catch (error) {
    console.error('Erro ao atualizar adquirente:', error)
    return { success: false, error: 'Erro interno ao atualizar adquirente' }
  }
}

/**
 * Busca uma adquirente específica por ID
 * @param id ID da adquirente
 * @returns Adquirente ou erro
 */
export async function buscarAdquirentePorId(id: string) {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { adquirente: null, error: 'Usuário não autenticado' }
    }
    
    // Buscar adquirente específica
    const { data: adquirente, error } = await supabase
      .from('adquirentes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Erro ao buscar adquirente:', error)
      return { adquirente: null, error: 'Adquirente não encontrada' }
    }
    
    return { adquirente, error: null }
  } catch (error) {
    console.error('Erro na busca da adquirente:', error)
    return { adquirente: null, error: 'Erro interno ao buscar adquirente' }
  }
}

/**
 * Exclui uma adquirente
 * @param id ID da adquirente a ser excluída
 * @returns Resultado da operação
 */
export async function excluirAdquirente(id: string) {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }
    
    // Verificar se a adquirente pertence ao usuário
    const { data: adquirenteAtual } = await supabase
      .from('adquirentes')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (!adquirenteAtual || adquirenteAtual.user_id !== user.id) {
      return { success: false, error: 'Adquirente não encontrada ou permissão negada' }
    }
    
    // Excluir adquirente
    const { error } = await supabase
      .from('adquirentes')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao excluir adquirente:', error)
      return { success: false, error: 'Falha ao excluir adquirente' }
    }
    
    return { success: true, error: null }
  } catch (error) {
    console.error('Erro ao excluir adquirente:', error)
    return { success: false, error: 'Erro interno ao excluir adquirente' }
  }
}

/**
 * Busca adquirentes que tiveram atividade em uma data específica
 * @param data Data no formato YYYY-MM-DD
 * @returns Lista de adquirentes que tiveram saldo na data especificada
 */
export async function buscarAdquirentesComAtividadePorData(data: string) {
  try {
    const supabase = await createClient()
    
    // Verificar se usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { adquirentes: null, error: 'Usuário não autenticado' }
    }
    
    // Buscar todos os cálculos da data específica
    const { data: calculos, error: calculosError } = await supabase
      .from('calculos')
      .select('*')
      .eq('user_id', user.id)
      .eq('data', data)
    
    if (calculosError) {
      console.error('Erro ao buscar cálculos:', calculosError)
      return { adquirentes: null, error: 'Erro ao buscar cálculos' }
    }
    
    if (!calculos || calculos.length === 0) {
      return { adquirentes: [], error: null }
    }
    
    // Buscar todas as adquirentes do usuário
    const { data: todasAdquirentes, error: adquirentesError } = await supabase
      .from('adquirentes')
      .select('*')
      .eq('user_id', user.id)
      .order('nome')
    
    if (adquirentesError) {
      console.error('Erro ao buscar adquirentes:', adquirentesError)
      return { adquirentes: null, error: 'Erro ao buscar adquirentes' }
    }
    
    // Filtrar adquirentes que tiveram saldo na data especificada
    const adquirentesComAtividade = todasAdquirentes.filter(adquirente => {
      const nomeAdquirente = adquirente.nome.toLowerCase()
      
      // Verificar se algum cálculo da data tem saldo para esta adquirente
      return calculos.some(calculo => {
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
    })
    
    return { adquirentes: adquirentesComAtividade, error: null }
  } catch (error) {
    console.error('Erro na busca de adquirentes com atividade:', error)
    return { adquirentes: null, error: 'Erro interno ao buscar adquirentes' }
  }
}
