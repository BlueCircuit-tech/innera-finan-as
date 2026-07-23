import { createClient } from '@supabase/supabase-js'

// Somente chaves públicas (protegidas por RLS). Nunca a senha do banco / S3.
const url = import.meta.env.VITE_SUPABASE_URL
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
export const hasSupabase = !!supabase

if (!hasSupabase) {
  // eslint-disable-next-line no-console
  console.info('[Innera] Supabase não configurado — usando dados mockados (data.js).')
}
