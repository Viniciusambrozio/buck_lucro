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

  // Validar horários
  const validation = horariosSchema.safeParse(horarios)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Verificar se os horários estão em ordem crescente
  const horariosArray = [
    horarios.horario_1,
    horarios.horario_2,
    horarios.horario_3,
    horarios.horario_4,
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
      .update(horarios)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao atualizar horários:', error)
      return { error: 'Erro ao atualizar horários' }
    }
  } else {
    // Criar novo
    const { error } = await supabase.from('horarios_config').insert({
      user_id: user.id,
      ...horarios,
    })

    if (error) {
      console.error('Erro ao criar horários:', error)
      return { error: 'Erro ao criar horários' }
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

