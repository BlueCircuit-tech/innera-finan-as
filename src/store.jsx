import { createContext, useContext, useReducer, useState, useCallback, useEffect } from 'react'
import {
  user, initialCats, initialTxs, sobras, renda, saldoInicial,
  initialLots, initialMyBids, initialFavs, bidHistory as bh,
  articles as initialArticles, metodoInnera, tracks as initialTracks,
} from './data.js'
import { fetchAll, persist } from './api.js'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
// 'YYYY-MM-DD' -> '16 jul' (mesmo formato do resto do app)
const fmtDia = iso => {
  const d = new Date((iso || '') + 'T00:00:00')
  return isNaN(d) ? '16 jul' : `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`
}

export const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const fmt0 = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
export const discount = l => Math.round((1 - l.lance / l.aval) * 100)

const initial = {
  user,
  renda,
  saldo: saldoInicial,
  cats: initialCats,
  txs: initialTxs,
  sobras,
  lots: initialLots,
  myBids: initialMyBids,
  favs: initialFavs,
  bidHistory: bh,
  articles: initialArticles,
  methodo: metodoInnera,
  tracks: initialTracks,
  media: [],
}

function reducer(s, a) {
  switch (a.type) {
    case 'HYDRATE':
      return { ...s, ...a.data }
    case 'ADD_TX': {
      const { tipo, val, cat, desc, date } = a
      const tx = { tipo, val, cat: tipo === 'in' ? 'renda' : cat, desc, data: fmtDia(date) }
      let saldo = s.saldo, cats = s.cats
      if (tipo === 'in') saldo += val
      else {
        saldo -= val
        cats = cats.map(c => (c.id === cat ? { ...c, gasto: c.gasto + val } : c))
      }
      return { ...s, txs: [tx, ...s.txs], saldo, cats }
    }
    case 'BUMP_CAT':
      return { ...s, cats: s.cats.map((c, i) => (i === a.i ? { ...c, plan: Math.max(0, c.plan + a.delta) } : c)) }
    case 'ADD_CAT':
      return { ...s, cats: [...s.cats, { id: a.id, nome: a.nome, ico: '🏷️', plan: a.val, gasto: 0, em_transacoes: true }] }
    case 'TOGGLE_FAV': {
      const has = s.favs.includes(a.id)
      return { ...s, favs: has ? s.favs.filter(x => x !== a.id) : [...s.favs, a.id] }
    }
    case 'PLACE_BID': {
      const lots = s.lots.map(l => (l.id === a.id ? { ...l, lance: a.val, bids: l.bids + 1 } : l))
      const prev = s.bidHistory[a.id] || []
      const bidHistory = { ...s.bidHistory, [a.id]: [['Você', a.val.toLocaleString('pt-BR'), true], ...prev] }
      const exists = s.myBids.find(b => b.lot === a.id)
      const myBids = exists
        ? s.myBids.map(b => (b.lot === a.id ? { ...b, meu: a.val, status: 'vencendo' } : b))
        : [...s.myBids, { lot: a.id, meu: a.val, status: 'vencendo' }]
      return { ...s, lots, bidHistory, myBids }
    }
    default:
      return s
  }
}

const StoreCtx = createContext(null)
const ToastCtx = createContext(null)

let toastTimer
export function StoreProvider({ children }) {
  const [state, baseDispatch] = useReducer(reducer, initial)
  const [toastMsg, setToastMsg] = useState(null)

  // hidrata do Supabase (se configurado); em falha mantém o mock
  useEffect(() => {
    let alive = true
    fetchAll().then(data => { if (alive && data) baseDispatch({ type: 'HYDRATE', data }) })
    return () => { alive = false }
  }, [])

  // dispatch com persistência best-effort no Supabase (usa o estado anterior)
  const dispatch = useCallback(action => {
    baseDispatch(action)
    persist(action, state)
  }, [state])

  const toast = useCallback(msg => {
    setToastMsg({ msg, id: Math.random() })
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => setToastMsg(null), 2600)
  }, [])

  return (
    <StoreCtx.Provider value={{ state, dispatch }}>
      <ToastCtx.Provider value={{ toast, toastMsg }}>
        {children}
      </ToastCtx.Provider>
    </StoreCtx.Provider>
  )
}

export const useStore = () => useContext(StoreCtx)
export const useToast = () => useContext(ToastCtx).toast
export const useToastMsg = () => useContext(ToastCtx).toastMsg
