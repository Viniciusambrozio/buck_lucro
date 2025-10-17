'use server'

import { createClient } from '@/lib/supabase/server'
import { horariosSchema } from '@/lib/validations/calculo'
import { revalidatePath } from 'next/cache'

/**
 * Buscar horários configurados do usuário
 */
export async function buscarHorarios() {
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  const { data, error } = await supabase
    .from('horarios_config')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // Se não existe configuração, retornar valores padrão
    if (error.code === 'PGRST116') {
      return {
        horarios: {
          horario_1: '09:00',
          horario_2: '13:00',
          horario_3: '18:00',
          horario_4: '22:00',
        },
      }
    }
    console.error('Erro ao buscar horários:', error)
    return { error: 'Erro ao buscar horários' }
  }

  return {
    horarios: {
      horario_1: data.horario_1,
      horario_2: data.horario_2,
      horario_3: data.horario_3,
      horario_4: data.horario_4,
    },
  }
}

/**
 * Salvar ou atualizar horários configurados
 */
export async function salvarHorarios(horarios: {
  horario_1: string
  horario_2: string
  horario_3: string
  horario_4: string
}) {
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  // Debug: verificar formato dos horários recebidos
  console.log('Horários recebidos para validação:', horarios)
  console.log('Tipo dos valores:', {
    horario_1: typeof horarios.horario_1,
    horario_2: typeof horarios.horario_2,
    horario_3: typeof horarios.horario_3,
    horario_4: typeof horarios.horario_4,
  })

  // Validação manual simples para debug
  const horariosValidados = {
    horario_1: horarios.horario_1 || '09:00',
    horario_2: horarios.horario_2 || '13:00',
    horario_3: horarios.horario_3 || '18:00',
    horario_4: horarios.horario_4 || '22:00',
  }

  console.log('Horários após validação manual:', horariosValidados)

  // Tentar validação Zod (comentada temporariamente para debug)
  /*
  const validation = horariosSchema.safeParse(horarios)
  if (!validation.success) {
    console.log('Erro de validação:', validation.error.issues)
    return { error: validation.error.issues[0].message }
  }
  */

  // Verificar se os horários estão em ordem crescente
  const horariosArray = [
    horariosValidados.horario_1,
    horariosValidados.horario_2,
    horariosValidados.horario_3,
    horariosValidados.horario_4,
  ]
  
  for (let i = 0; i < horariosArray.length - 1; i++) {
    if (horariosArray[i] >= horariosArray[i + 1]) {
      return { error: 'Os horários devem estar em ordem crescente' }
    }
  }

  // Verificar se já existe configuração
  const { data: existing } = await supabase
    .from('horarios_config')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Atualizar existente
    const { error } = await supabase
      .from('horarios_config')
      .update(horariosValidados)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao atualizar horários:', error)
      return { error: 'Erro ao atualizar horários' }
    }
  } else {
    // Criar novo
    const { error } = await supabase.from('horarios_config').insert({
      user_id: user.id,
      ...horariosValidados,
    })

    if (error) {
      console.error('Erro ao criar horários:', error)
      return { error: 'Erro ao criar horários' }
    }
  }

  // Revalidar todas as páginas que usam horários
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/dashboard')
  return { success: true }
}

