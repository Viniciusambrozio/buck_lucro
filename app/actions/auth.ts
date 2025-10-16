'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { loginSchema } from '@/lib/validations/calculo'

/**
 * Server Action para realizar login
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validar dados
  const validation = loginSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Email ou senha incorretos' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Server Action para realizar logout
 */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

/**
 * Obter usuário autenticado
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

