import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase.js'

const AuthCtx = createContext(null)

/**
 * Autenticação real via Supabase Auth.
 * - signUp grava nome e telefone no metadata do usuário (options.data);
 *   o perfil na tabela `profiles` é criado no primeiro login (ver store.jsx).
 * - Se o Supabase não estiver configurado (.env), a app funciona em modo
 *   somente-leitura sem sessão.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  const signUp = useCallback(async ({ nome, telefone, email, password }) => {
    if (!supabase) throw new Error('Supabase não configurado (.env).')
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nome: nome?.trim() || '', telefone: telefone?.trim() || '' } },
    })
    if (error) throw error
    // needsConfirm = usuário criado mas ainda sem sessão (confirmação por e-mail ligada)
    return { needsConfirm: !data.session, session: data.session }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) throw new Error('Supabase não configurado (.env).')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw error
  }, [])

  const resetPassword = useCallback(async email => {
    if (!supabase) throw new Error('Supabase não configurado (.env).')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setSession(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ session, user: session?.user || null, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
