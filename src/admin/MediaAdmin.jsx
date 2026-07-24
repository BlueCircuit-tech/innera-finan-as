import { useEffect, useState } from 'react'
import { Plus, ArrowLeft, Loader2, ExternalLink } from 'lucide-react'
import { useToast } from '../store.jsx'
import { fetchMedia, createMedia, updateMedia, deleteMedia } from '../api.js'
import { Field, ImageUpload, DeleteButton } from './widgets.jsx'

const TIPOS = [['podcast', 'Podcast'], ['video', 'Vídeo']]
const BLANK = { tipo: 'podcast', titulo: '', descricao: '', url: '', thumb_url: null, posicao: 0, publicado: true }

export default function MediaAdmin() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [missing, setMissing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchMedia()
      if (data === null) { setMissing(true); setItems([]) }
      else { setMissing(false); setItems(data) }
    } catch (e) { toast('Erro: ' + e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const startNew = () => { setForm({ ...BLANK, posicao: items.length }); setEditing({ novo: true }) }
  const startEdit = m => { setForm({ ...BLANK, ...m }); setEditing(m) }

  const save = async () => {
    if (!form.titulo.trim() || !form.url.trim()) { toast('Informe título e link'); return }
    setSaving(true)
    const payload = {
      tipo: form.tipo, titulo: form.titulo.trim(), descricao: form.descricao || null,
      url: form.url.trim(), thumb_url: form.thumb_url || null,
      posicao: Number(form.posicao) || 0, publicado: !!form.publicado,
    }
    try {
      if (editing.novo) await createMedia(payload)
      else await updateMedia(editing.id, payload)
      toast('Conteúdo salvo ✓'); setEditing(null); await load()
    } catch (e) { toast('Erro ao salvar: ' + e.message) }
    setSaving(false)
  }
  const remove = async id => {
    try { await deleteMedia(id); toast('Excluído'); if (editing?.id === id) setEditing(null); await load() }
    catch (e) { toast('Erro: ' + e.message) }
  }

  if (loading) return <div className="adm-loading"><Loader2 className="spin" size={22} /> Carregando…</div>

  if (missing) {
    return (
      <div className="adm-setup">
        <h2>Aprender — Podcasts & Vídeos</h2>
        <p>Para gerenciar podcasts e vídeos, crie a tabela uma única vez: abra o <b>SQL Editor do Supabase</b>, cole o arquivo <code>supabase/admin.sql</code> do projeto e clique em RUN. Depois recarregue esta página.</p>
        <button className="adm-btn sm ghost" onClick={load}>Recarregar</button>
      </div>
    )
  }

  if (!editing) {
    return (
      <div>
        <div className="adm-head">
          <h2>Podcasts & Vídeos <span className="adm-count">{items.length}</span></h2>
          <button className="adm-btn" onClick={startNew}><Plus size={16} /> Novo conteúdo</button>
        </div>
        {items.length === 0 ? <div className="adm-empty">Nenhum conteúdo ainda.</div>
          : items.map(m => (
            <div className="adm-row" key={m.id}>
              <div className="adm-thumb">{m.thumb_url ? <img src={m.thumb_url} alt="" /> : <span>{m.tipo === 'video' ? '▶️' : '🎙️'}</span>}</div>
              <div className="adm-row-info">
                <b>{m.titulo}</b>
                <span>{m.tipo === 'video' ? 'Vídeo' : 'Podcast'} · <a href={m.url} target="_blank" rel="noreferrer">abrir <ExternalLink size={11} /></a></span>
              </div>
              <div className="adm-row-actions">
                <button className="adm-btn sm ghost" onClick={() => startEdit(m)}>Editar</button>
                <DeleteButton onConfirm={() => remove(m.id)} />
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div>
      <div className="adm-head">
        <button className="adm-btn sm ghost" onClick={() => setEditing(null)}><ArrowLeft size={15} /> Voltar</button>
        <h2>{editing.novo ? 'Novo conteúdo' : 'Editar conteúdo'}</h2>
      </div>
      <div className="adm-grid">
        <Field label="Tipo">
          <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>{TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </Field>
        <Field label="Ordem"><input type="number" value={form.posicao} onChange={e => set('posicao', e.target.value)} /></Field>
        <Field label="Título" wide><input value={form.titulo} onChange={e => set('titulo', e.target.value)} /></Field>
        <Field label="Link (URL)" wide><input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://…" /></Field>
        <Field label="Descrição" wide><textarea rows={2} value={form.descricao || ''} onChange={e => set('descricao', e.target.value)} /></Field>
        <Field label="Publicado" wide>
          <label className="adm-check"><input type="checkbox" checked={!!form.publicado} onChange={e => set('publicado', e.target.checked)} /> Visível no app</label>
        </Field>
        <ImageUpload bucket="article-covers" label="Capa / thumbnail" value={form.thumb_url} onChange={url => set('thumb_url', url)} />
      </div>
      <div className="adm-actions-bar">
        <button className="adm-btn" onClick={save} disabled={saving}>{saving ? <><Loader2 className="spin" size={16} /> Salvando…</> : 'Salvar'}</button>
        {!editing.novo && <DeleteButton onConfirm={() => remove(editing.id)} label="Excluir" />}
      </div>
    </div>
  )
}
