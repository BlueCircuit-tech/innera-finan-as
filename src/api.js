import { supabase } from './supabase.js'

// Usuária demo (mesmo id do seed em supabase/init.sql)
const DEMO = '11111111-1111-1111-1111-111111111111'
const PH = ['ph-a', 'ph-b', 'ph-c', 'ph-d', 'ph-e']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function countdown(endsAt) {
  const ms = new Date(endsAt).getTime() - Date.now()
  if (ms <= 0) return 'Encerrado'
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (d > 0) return `${d}d ${String(h).padStart(2, '0')}h`
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`
  return `${m}min`
}

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`
}

/* ---- READ: busca tudo e mapeia para o formato do app ---- */
export async function fetchAll() {
  if (!supabase) return null
  try {
    const [profile, cats, txs, lots, photos, docs, bids, favs, arts, meth, tracks] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', DEMO).single(),
      supabase.from('categories').select('*').eq('user_id', DEMO).order('posicao'),
      supabase.from('transactions').select('*').eq('user_id', DEMO).order('data', { ascending: false }),
      supabase.from('lots').select('*').order('id'),
      supabase.from('lot_photos').select('*').order('posicao'),
      supabase.from('lot_documents').select('*').order('posicao'),
      supabase.from('lot_bids').select('*').order('valor', { ascending: false }),
      supabase.from('favorites').select('lot_id').eq('user_id', DEMO),
      supabase.from('articles').select('*').eq('publicado', true).order('posicao'),
      supabase.from('methodology_steps').select('*').order('passo'),
      supabase.from('learning_tracks').select('*').order('posicao'),
    ])
    if (lots.error || cats.error) return null

    const photosByLot = groupBy(photos.data || [], 'lot_id')
    const docsByLot = groupBy(docs.data || [], 'lot_id')
    const bidsByLot = groupBy(bids.data || [], 'lot_id')

    const mappedLots = (lots.data || []).map((l, i) => ({
      id: l.id,
      cat: l.categoria,
      ico: l.emoji,
      image_url: l.image_url,
      ph: PH[i % PH.length],
      reco: l.recomendado,
      nome: l.nome,
      specs: l.specs,
      status: l.status,
      desc: l.descricao,
      aval: Number(l.valor_mercado),
      lance: Number(l.preco_atual),
      inc: Number(l.incremento),
      fim: countdown(l.ends_at),
      bids: l.lances,
      rentab: l.rentabilidade,
      risco: l.risco,
      revenda: l.revenda,
      ia: l.analise_ia,
      fotos: (photosByLot[l.id] || []).map(p => ({ emoji: p.emoji, image_url: p.image_url })),
      docs: (docsByLot[l.id] || []).map(d => d.nome),
    }))

    const bidHistory = {}
    for (const [lotId, arr] of Object.entries(bidsByLot)) {
      bidHistory[lotId] = arr.map(b => [b.bidder_name, Number(b.valor).toLocaleString('pt-BR'), b.is_me])
    }

    // myBids: derivado dos lances "Você"
    const myBids = mappedLots
      .map(l => {
        const mine = (bidsByLot[l.id] || []).filter(b => b.is_me).map(b => Number(b.valor))
        if (!mine.length) return null
        const meu = Math.max(...mine)
        return { lot: l.id, meu, status: meu >= l.lance ? 'vencendo' : 'superada' }
      })
      .filter(Boolean)

    const mappedCats = (cats.data || []).map(c => ({
      id: c.id,
      nome: c.nome,
      ico: c.emoji,
      image_url: c.image_url,
      plan: Number(c.planejado),
      gasto: Number(c.gasto),
      em_transacoes: c.em_transacoes,
    }))

    const mappedTxs = (txs.data || []).map(t => ({
      tipo: t.tipo,
      val: Number(t.valor),
      cat: t.category_id || 'renda',
      desc: t.descricao,
      data: fmtDate(t.data),
    }))

    const data = {
      user: {
        nome: profile.data?.nome || 'Paula',
        email: profile.data?.email,
        avatar_url: profile.data?.avatar_url,
        avatar_emoji: profile.data?.avatar_emoji || '👩🏻',
      },
      renda: Number(profile.data?.renda ?? 6500),
      saldo: Number(profile.data?.saldo ?? 0),
      cats: mappedCats,
      txs: mappedTxs,
      lots: mappedLots,
      favs: (favs.data || []).map(f => f.lot_id),
      bidHistory,
      myBids,
    }
    if (arts.data?.length) data.articles = arts.data.map(a => ({
      ico: a.emoji, cover_url: a.cover_url, tag: a.tag, tempo: a.tempo_leitura, titulo: a.titulo, corpo: a.corpo_html,
    }))
    if (meth.data?.length) data.methodo = meth.data.map(m => [m.titulo, m.descricao])
    if (tracks.data?.length) data.tracks = tracks.data.map(t => ({
      titulo: t.titulo, subtitulo: t.subtitulo, emoji: t.emoji, cover_url: t.cover_url,
      total_aulas: t.total_aulas, aula_atual: t.aula_atual, progresso: t.progresso, destaque: t.destaque,
    }))
    return data
  } catch (e) {
    console.warn('[Innera] fetchAll falhou, usando mock:', e?.message)
    return null
  }
}

/* ---- WRITE: persiste as mutações (best-effort, silencioso) ---- */
export async function persist(action, prev) {
  if (!supabase) return
  try {
    switch (action.type) {
      case 'ADD_TX': {
        const { tipo, val, cat, desc } = action
        const today = new Date().toISOString().slice(0, 10)
        await supabase.from('transactions').insert({
          user_id: DEMO, tipo, valor: val,
          category_id: tipo === 'out' ? cat : null, descricao: desc, data: today,
        })
        const saldo = tipo === 'in' ? prev.saldo + val : prev.saldo - val
        await supabase.from('profiles').update({ saldo }).eq('id', DEMO)
        if (tipo === 'out') {
          const c = prev.cats.find(x => x.id === cat)
          if (c) await supabase.from('categories').update({ gasto: c.gasto + val }).eq('id', cat)
        }
        break
      }
      case 'TOGGLE_FAV': {
        if (prev.favs.includes(action.id))
          await supabase.from('favorites').delete().eq('user_id', DEMO).eq('lot_id', action.id)
        else
          await supabase.from('favorites').insert({ user_id: DEMO, lot_id: action.id })
        break
      }
      case 'PLACE_BID': {
        const l = prev.lots.find(x => x.id === action.id)
        await supabase.from('lot_bids').insert({ lot_id: action.id, user_id: DEMO, bidder_name: 'Você', valor: action.val, is_me: true })
        await supabase.from('lots').update({ preco_atual: action.val, lances: (l?.bids || 0) + 1 }).eq('id', action.id)
        break
      }
      case 'BUMP_CAT': {
        const c = prev.cats[action.i]
        if (c && !String(c.id).startsWith('c')) // ignora ids mock
          await supabase.from('categories').update({ planejado: Math.max(0, c.plan + action.delta) }).eq('id', c.id)
        break
      }
      case 'ADD_CAT': {
        await supabase.from('categories').insert({
          id: action.id, user_id: DEMO, nome: action.nome, emoji: '🏷️',
          planejado: action.val, gasto: 0, posicao: prev.cats.length, em_transacoes: true,
        })
        break
      }
    }
  } catch (e) {
    console.warn('[Innera] persist falhou:', e?.message)
  }
}

function groupBy(arr, key) {
  return arr.reduce((acc, x) => { (acc[x[key]] ||= []).push(x); return acc }, {})
}
