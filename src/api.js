import { supabase } from './supabase.js'
import { DEFAULT_CATS } from './data.js'

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

/* ---- Garante perfil + categorias padrão no primeiro acesso do usuário ----
   Roda no login. Assim funciona mesmo sem trigger no banco (confirmação por
   e-mail cria o usuário fora do navegador). Idempotente. */
export async function ensureUserSetup(user) {
  if (!supabase || !user) return
  const { data: prof } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
  if (prof) return
  const meta = user.user_metadata || {}
  const base = {
    id: user.id,
    nome: (meta.nome || '').trim() || (user.email || '').split('@')[0],
    email: user.email,
    renda: 0,
    saldo: 0,
    avatar_emoji: '👩🏻',
  }
  // tenta com telefone; se a coluna ainda não existir no banco, grava sem ela
  let ins = await supabase.from('profiles').insert({ ...base, telefone: (meta.telefone || '').trim() || null })
  if (ins.error && /telefone/i.test(ins.error.message || '')) {
    ins = await supabase.from('profiles').insert(base)
  }
  if (ins.error) { console.warn('[Innera] criar perfil falhou:', ins.error.message); return }

  const cats = DEFAULT_CATS.map(c => ({
    id: crypto.randomUUID(), user_id: user.id,
    nome: c.nome, emoji: c.emoji, planejado: 0, gasto: 0, posicao: c.posicao, em_transacoes: c.em_transacoes,
  }))
  const { error } = await supabase.from('categories').insert(cats)
  if (error) console.warn('[Innera] criar categorias falhou:', error.message)
}

/* ---- READ: busca tudo do usuário + conteúdo público, mapeia p/ o app ---- */
export async function fetchAll(userId) {
  if (!supabase || !userId) return null
  try {
    const [profile, cats, txs, lots, photos, docs, bids, favs, arts, meth, tracks, media] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('categories').select('*').eq('user_id', userId).order('posicao'),
      supabase.from('transactions').select('*').eq('user_id', userId).order('data', { ascending: false }),
      supabase.from('lots').select('*').order('id'),
      supabase.from('lot_photos').select('*').order('posicao'),
      supabase.from('lot_documents').select('*').order('posicao'),
      supabase.from('lot_bids').select('*').eq('user_id', userId).order('valor', { ascending: false }),
      supabase.from('favorites').select('lot_id').eq('user_id', userId),
      supabase.from('articles').select('*').eq('publicado', true).order('posicao'),
      supabase.from('methodology_steps').select('*').order('passo'),
      supabase.from('learning_tracks').select('*').order('posicao'),
      supabase.from('media_items').select('*').eq('publicado', true).order('posicao'),
    ])

    const photosByLot = groupBy(photos.data || [], 'lot_id')
    const docsByLot = groupBy(docs.data || [], 'lot_id')
    const bidsByLot = groupBy(bids.data || [], 'lot_id')

    const mappedLots = (lots.data || []).map((l, i) => ({
      id: l.id, cat: l.categoria, ico: l.emoji, image_url: l.image_url, ph: PH[i % PH.length],
      reco: l.recomendado, nome: l.nome, specs: l.specs, status: l.status, desc: l.descricao,
      aval: Number(l.valor_mercado), lance: Number(l.preco_atual), inc: Number(l.incremento),
      fim: countdown(l.ends_at), bids: l.lances, rentab: l.rentabilidade, risco: l.risco, revenda: l.revenda,
      ia: l.analise_ia,
      fotos: (photosByLot[l.id] || []).map(p => ({ emoji: p.emoji, image_url: p.image_url })),
      docs: (docsByLot[l.id] || []).map(d => d.nome),
    }))

    const bidHistory = {}
    for (const [lotId, arr] of Object.entries(bidsByLot))
      bidHistory[lotId] = arr.map(b => [b.bidder_name, Number(b.valor).toLocaleString('pt-BR'), b.is_me])

    const myBids = mappedLots.map(l => {
      const mine = (bidsByLot[l.id] || []).filter(b => b.is_me).map(b => Number(b.valor))
      if (!mine.length) return null
      const meu = Math.max(...mine)
      return { lot: l.id, meu, status: meu >= l.lance ? 'vencendo' : 'superada' }
    }).filter(Boolean)

    const mappedCats = (cats.data || []).map(c => ({
      id: c.id, nome: c.nome, ico: c.emoji, image_url: c.image_url,
      plan: Number(c.planejado), gasto: Number(c.gasto), em_transacoes: c.em_transacoes,
    }))

    // guardamos o ISO cru (iso) p/ derivar saldo/gasto por mês; `data` é só exibição
    const mappedTxs = (txs.data || []).map(t => ({
      id: t.id, tipo: t.tipo, val: Number(t.valor),
      cat: t.category_id || 'renda', desc: t.descricao, iso: t.data, data: fmtDate(t.data),
    }))

    const data = {
      user: {
        id: userId,
        nome: profile.data?.nome || 'Você',
        email: profile.data?.email,
        telefone: profile.data?.telefone,
        avatar_url: profile.data?.avatar_url,
        avatar_emoji: profile.data?.avatar_emoji || '👩🏻',
      },
      renda: Number(profile.data?.renda ?? 0),
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
    data.media = media.error ? [] : (media.data || [])
    if (tracks.data?.length) data.tracks = tracks.data.map(t => ({
      titulo: t.titulo, subtitulo: t.subtitulo, emoji: t.emoji, cover_url: t.cover_url,
      total_aulas: t.total_aulas, aula_atual: t.aula_atual, progresso: t.progresso, destaque: t.destaque,
    }))
    return data
  } catch (e) {
    console.warn('[Innera] fetchAll falhou:', e?.message)
    return null
  }
}

/* ---- WRITE: persiste as mutações do usuário logado ---- */
export async function persist(action, prev, userId) {
  if (!supabase || !userId) return
  try {
    switch (action.type) {
      case 'ADD_TX': {
        const { tipo, val, cat, desc, date } = action
        const dia = date || new Date().toISOString().slice(0, 10)
        // saldo e gasto são DERIVADOS das transações — só inserimos a transação.
        // Usa o mesmo id do estado local p/ manter consistência (id opcional).
        const row = {
          user_id: userId, tipo, valor: val,
          category_id: tipo === 'out' ? cat : null, descricao: desc, data: dia,
        }
        if (action.id) row.id = action.id
        await supabase.from('transactions').insert(row)
        break
      }
      case 'DELETE_TX': {
        if (action.id) await supabase.from('transactions').delete().eq('id', action.id).eq('user_id', userId)
        break
      }
      case 'SET_RENDA': {
        await supabase.from('profiles').update({ renda: action.val }).eq('id', userId)
        break
      }
      case 'TOGGLE_FAV': {
        if (prev.favs.includes(action.id))
          await supabase.from('favorites').delete().eq('user_id', userId).eq('lot_id', action.id)
        else
          await supabase.from('favorites').insert({ user_id: userId, lot_id: action.id })
        break
      }
      case 'BUMP_CAT': {
        const c = prev.cats[action.i]
        if (c) await supabase.from('categories').update({ planejado: Math.max(0, c.plan + action.delta) }).eq('id', c.id)
        break
      }
      case 'SET_CAT_PLAN': {
        await supabase.from('categories').update({ planejado: Math.max(0, action.val) }).eq('id', action.id)
        break
      }
      case 'ADD_CAT': {
        await supabase.from('categories').insert({
          id: action.id, user_id: userId, nome: action.nome, emoji: '🏷️',
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

/* =====================================================================
   ADMIN — CRUD + upload de imagens (Storage)
   ===================================================================== */
function req() { if (!supabase) throw new Error('Supabase não configurado (.env).') }
// PostgREST usa 'PGRST205'/'PGRST202'; Postgres cru usa '42P01'/'42883'
function isMissing(error) {
  return !!error && (['PGRST205', 'PGRST202', '42P01', '42883'].includes(error.code) ||
    /could not find|does not exist/i.test(error.message || ''))
}

export async function uploadImage(bucket, file) {
  req()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

/* ---- Usuários (admin) — via funções security-definer (ver supabase/auth.sql) ---- */
export async function adminListUsers() {
  req()
  const { data, error } = await supabase.rpc('admin_list_users')
  if (error) { if (isMissing(error)) return null; throw error }
  return data || []
}
export async function adminDeleteUser(id) {
  req()
  const { error } = await supabase.rpc('admin_delete_user', { uid: id })
  if (error) throw error
}
export async function adminUpdateUser(id, { nome, telefone }) {
  req()
  const { error } = await supabase.rpc('admin_update_user', { uid: id, novo_nome: nome, novo_telefone: telefone })
  if (error) throw error
}

/* ---- Leilões ---- */
export async function adminLots() {
  req()
  const [lots, photos, docs] = await Promise.all([
    supabase.from('lots').select('*').order('id', { ascending: false }),
    supabase.from('lot_photos').select('*').order('posicao'),
    supabase.from('lot_documents').select('*').order('posicao'),
  ])
  if (lots.error) throw lots.error
  const p = groupBy(photos.data || [], 'lot_id')
  const d = groupBy(docs.data || [], 'lot_id')
  return (lots.data || []).map(l => ({ ...l, photos: p[l.id] || [], documents: d[l.id] || [] }))
}
export async function createLot(row) { req(); const { data, error } = await supabase.from('lots').insert(row).select().single(); if (error) throw error; return data }
export async function updateLot(id, row) { req(); const { error } = await supabase.from('lots').update(row).eq('id', id); if (error) throw error }
export async function deleteLot(id) { req(); const { error } = await supabase.from('lots').delete().eq('id', id); if (error) throw error }
export async function addLotPhoto(lotId, row) { req(); const { error } = await supabase.from('lot_photos').insert({ lot_id: lotId, ...row }); if (error) throw error }
export async function deleteLotPhoto(id) { req(); const { error } = await supabase.from('lot_photos').delete().eq('id', id); if (error) throw error }

/* ---- Artigos ---- */
export async function adminArticles() { req(); const { data, error } = await supabase.from('articles').select('*').order('posicao'); if (error) throw error; return data || [] }
export async function createArticle(row) { req(); const { error } = await supabase.from('articles').insert(row); if (error) throw error }
export async function updateArticle(id, row) { req(); const { error } = await supabase.from('articles').update(row).eq('id', id); if (error) throw error }
export async function deleteArticle(id) { req(); const { error } = await supabase.from('articles').delete().eq('id', id); if (error) throw error }

/* ---- Mídia (podcasts / vídeos) ---- */
export async function fetchMedia(tipo) {
  req()
  let q = supabase.from('media_items').select('*').order('posicao')
  if (tipo) q = q.eq('tipo', tipo)
  const { data, error } = await q
  if (error) { if (isMissing(error)) return null; throw error }
  return data || []
}
export async function createMedia(row) { req(); const { error } = await supabase.from('media_items').insert(row); if (error) throw error }
export async function updateMedia(id, row) { req(); const { error } = await supabase.from('media_items').update(row).eq('id', id); if (error) throw error }
export async function deleteMedia(id) { req(); const { error } = await supabase.from('media_items').delete().eq('id', id); if (error) throw error }
