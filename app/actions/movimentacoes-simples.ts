'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

interface MovimentacaoSimplesInput {
  valor: number
  conta_origem_id: string
  conta_destino_id: string
  tipo_movimentacao: 'empresa_para_pixout' | 'pixin_para_pixout' | 'pixin_para_empresa'
  observacao?: string
}

/**
 * Cria uma movimentação simples usando a tabela de adquirentes
 */
export async function criarMovimentacaoSimples(input: MovimentacaoSimplesInput): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  try {
    // Verificar se as adquirentes existem
    const { data: origem } = await supabase
      .from('adquirentes')
      .select('id, nome, tipo_pix')
      .eq('id', input.conta_origem_id)
      .eq('user_id', user.id)
      .single()

    const { data: destino } = await supabase
      .from('adquirentes')
      .select('id, nome, tipo_pix')
      .eq('id', input.conta_destino_id)
      .eq('user_id', user.id)
      .single()

    if (!origem || !destino) {
      return { success: false, error: 'Conta de origem ou destino inválida' }
    }

    // Para contas da empresa, usar um ID especial
    const origemId = input.conta_origem_id.includes('empresa-') ? 'empresa' : input.conta_origem_id
    const destinoId = input.conta_destino_id.includes('empresa-') ? 'empresa' : input.conta_destino_id

    // Criar registro de movimentação na tabela de saques (se existir)
    // ou criar uma tabela simples de movimentações
    const agora = new Date()
    
    const { error } = await supabase
      .from('movimentacoes')
      .insert({
        user_id: user.id,
        data: format(agora, 'yyyy-MM-dd'),
        horario: format(agora, 'HH:mm:ss'),
        conta_origem_id: origemId,
        conta_destino_id: destinoId,
        valor: input.valor,
        tipo_movimentacao: input.tipo_movimentacao,
        observacao: input.observacao
      })

    if (error) {
      console.error('Erro ao criar movimentação:', error)
      return { success: false, error: 'Erro ao registrar movimentação' }
    }

    revalidatePath('/saques-lucro')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Erro inesperado:', error)
    return { success: false, error: 'Erro inesperado ao registrar movimentação' }
  }
}
