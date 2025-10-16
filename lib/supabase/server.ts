import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente Supabase para uso no lado do servidor (Server Components e Server Actions)
 * Gerencia automaticamente os cookies de autenticação
 */
export async function createClient() {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas')
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // A função `setAll` foi chamada de um Server Component.
            // Isso pode ser ignorado se você tiver middleware refreshing
            // user sessions.
            console.warn('Erro ao definir cookies:', error)
          }
        },
      },
      auth: {
        persistSession: false, // No servidor não persistimos sessão
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'buckpay-server',
        },
      },
    }
  )
}




