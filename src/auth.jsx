import { createContext, useContext, useState, useCallback } from 'react'
import { supabase } from './supabase.js'

const AuthCtx = createContext(null)
const LS_KEY = 'innera_user'

/**
 * Autenticação simples (sem confirmação de e-mail).
 * Cadastro e login batem nas funções app_signup / app_login do banco
 * (ver supabase/auth.sql). A sessão é o usuário guardado no localStorage.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') } catch { return null }
  })

  const store = u => {
    if (u) localStorage.setItem(LS_KEY, JSON.stringify(u))
    else localStorage.removeItem(LS_KEY)
    setUser(u)
  }

  const signUp = useCallback(async ({ nome, telefone, email, password }) => {
    if (!supabase) throw new Error('Supabase não configurado (.env).')
    const { data, error } = await supabase.rpc('app_signup', {
      p_nome: nome, p_email: email, p_telefone: telefone || '', p_senha: password,
    })
    if (error) throw error
    store(data)
    return data
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) throw new Error('Supabase não configurado (.env).')
    const { data, error } = await supabase.rpc('app_login', { p_email: email, p_senha: password })
    if (error) throw error
    if (!data) throw new Error('INVALID_LOGIN')
    store(data)
    return data
  }, [])

  const signOut = useCallback(() => store(null), [])

  // atualiza campos do usuário logado (ex.: renda) mantendo o localStorage
  const patchUser = useCallback(patch => {
    setUser(u => {
      if (!u) return u
      const next = { ...u, ...patch }
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AuthCtx.Provider value={{ user, session: user, loading: false, signUp, signIn, signOut, patchUser }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
