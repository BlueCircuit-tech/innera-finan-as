import { createContext, useContext, useReducer, useState, useCallback, useEffect, useMemo } from 'react'
import { fetchAll, persist, describeError } from './api.js'
import { useAuth } from './auth.jsx'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MESES_CAP = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
// 'YYYY-MM-DD' -> '16 jul'
const fmtDia = iso => {
  const d = new Date((iso || '') + 'T00:00:00')
  return isNaN(d) ? '' : `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`
}

export const fmt = v => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const fmt0 = v => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
export const discount = l => Math.round((1 - l.lance / l.aval) * 100)

const EMPTY = {
  user: { nome: '', avatar_emoji: '👩🏻' },
  renda: 0, cats: [], txs: [], lots: [], myBids: [], favs: [],
  bidHistory: {}, articles: [], methodo: [], tracks: [], media: [],
}

/* ---- derivações: saldo e gasto SEMPRE vêm das transações (não há valor "guardado") ---- */
function computeSobras(txs) {
  if (!txs.length) return []
  const byMonth = {}
  for (const t of txs) {
    const m = (t.iso || '').slice(0, 7)
    if (!m) continue
    byMonth[m] = (byMonth[m] || 0) + (t.tipo === 'in' ? t.val : -t.val)
  }
  const now = new Date()
  const out = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    out.push([MESES_CAP[d.getMonth()], Math.max(0, byMonth[key] || 0)])
  }
  return out.some(([, v]) => v > 0) ? out : []
}

function withDerived(s) {
  const txs = s.txs || []
  const saldo = txs.reduce((a, t) => a + (t.tipo === 'in' ? t.val : -t.val), 0)
  const ym = new Date().toISOString().slice(0, 7)
  const gastoByCat = {}
  for (const t of txs) {
    if (t.tipo !== 'out') continue
    if ((t.iso || '').slice(0, 7) === ym) gastoByCat[t.cat] = (gastoByCat[t.cat] || 0) + t.val
  }
  const cats = (s.cats || []).map(c => ({ ...c, gasto: gastoByCat[c.id] || 0 }))
  return { ...s, saldo, cats, sobras: computeSobras(txs) }
}

function reducer(s, a) {
  switch (a.type) {
    case 'HYDRATE': return { ...s, ...a.data }
    case 'RESET': return EMPTY
    case 'SET_USER':
      return {
        ...s,
        user: {
          id: a.user.id, nome: a.user.nome, email: a.user.email,
          telefone: a.user.telefone, avatar_emoji: a.user.avatar_emoji || '👩🏻',
        },
        renda: Number(a.user.renda) || 0,
      }
    case 'ADD_TX': {
      const { tipo, val, cat, desc, date } = a
      const tx = { id: a.id, tipo, val, cat: tipo === 'in' ? 'renda' : cat, desc, iso: date, data: fmtDia(date) }
      return { ...s, txs: [tx, ...s.txs] }
    }
    case 'DELETE_TX':
      return { ...s, txs: s.txs.filter(t => t.id !== a.id) }
    case 'SET_RENDA':
      return { ...s, renda: Math.max(0, a.val) }
    case 'BUMP_CAT':
      return { ...s, cats: s.cats.map((c, i) => (i === a.i ? { ...c, plan: Math.max(0, c.plan + a.delta) } : c)) }
    case 'SET_CAT_PLAN':
      return { ...s, cats: s.cats.map(c => (c.id === a.id ? { ...c, plan: Math.max(0, a.val) } : c)) }
    case 'ADD_CAT':
      return { ...s, cats: [...s.cats, { id: a.id, nome: a.nome, ico: '🏷️', plan: a.val, gasto: 0, em_transacoes: true }] }
    case 'TOGGLE_FAV': {
      const has = s.favs.includes(a.id)
      return { ...s, favs: has ? s.favs.filter(x => x !== a.id) : [...s.favs, a.id] }
    }
    default:
      return s
  }
}

const StoreCtx = createContext(null)
const ToastCtx = createContext(null)

let toastTimer
export function StoreProvider({ children }) {
  const { user, patchUser } = useAuth()
  const userId = user?.id || null
  const [state, baseDispatch] = useReducer(reducer, EMPTY)
  const [toastMsg, setToastMsg] = useState(null)
  const [loadingData, setLoadingData] = useState(false)
  // erro de carregamento (ex.: banco fora do ar) — vira aviso na tela
  const [loadError, setLoadError] = useState(null)

  // dados de identidade/renda vêm do login
  useEffect(() => {
    if (user) baseDispatch({ type: 'SET_USER', user })
  }, [user])

  // (re)carrega as coleções quando o usuário logado muda
  useEffect(() => {
    let alive = true
    if (!userId) { baseDispatch({ type: 'RESET' }); setLoadError(null); return }
    setLoadingData(true)
    setLoadError(null)
    ;(async () => {
      try {
        const data = await fetchAll(userId)
        if (alive && data) baseDispatch({ type: 'HYDRATE', data })
      } catch (e) {
        // não silencia: sem isto o app aparece zerado como se os dados tivessem sumido
        if (alive) setLoadError(describeError(e))
      } finally {
        if (alive) setLoadingData(false)
      }
    })()
    return () => { alive = false }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const toast = useCallback(msg => {
    setToastMsg({ msg, id: Math.random() })
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => setToastMsg(null), 2600)
  }, [])

  // dispatch com persistência no Supabase (usa o estado anterior + usuário atual).
  // Se a gravação falhar a usuária é avisada — o dado só existiria na tela.
  const dispatch = useCallback(action => {
    baseDispatch(action)
    if (action.type === 'SET_RENDA') patchUser({ renda: action.val })
    persist(action, state, userId).then(err => { if (err) toast('Não foi possível salvar: ' + err) })
  }, [state, userId, patchUser, toast])

  const derived = useMemo(() => withDerived(state), [state])

  return (
    <StoreCtx.Provider value={{ state: derived, dispatch, loadingData, loadError }}>
      <ToastCtx.Provider value={{ toast, toastMsg }}>
        {children}
      </ToastCtx.Provider>
    </StoreCtx.Provider>
  )
}

export const useStore = () => useContext(StoreCtx)
export const useToast = () => useContext(ToastCtx).toast
export const useToastMsg = () => useContext(ToastCtx).toastMsg
