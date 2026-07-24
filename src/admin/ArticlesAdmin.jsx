import { useEffect, useState } from 'react'
import { Plus, ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '../store.jsx'
import { adminArticles, createArticle, updateArticle, deleteArticle } from '../api.js'
import { Field, ImageUpload, DeleteButton } from './widgets.jsx'

const BLANK = { tag: '', emoji: '📄', cover_url: null, titulo: '', tempo_leitura: '', corpo_html: '', posicao: 0, publicado: true }

export default function ArticlesAdmin() {
  const toast = useToast()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setList(await adminArticles()) } catch (e) { toast('Erro: ' + e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const startNew = () => { setForm({ ...BLANK, posicao: list.length }); setEditing({ novo: true }) }
  const startEdit = a => { setForm({ ...BLANK, ...a }); setEditing(a) }

  const save = async () => {
    if (!form.titulo.trim()) { toast('Informe o título'); return }
    setSaving(true)
    const payload = {
      tag: form.tag || null, emoji: form.emoji || null, cover_url: form.cover_url || null,
      titulo: form.titulo.trim(), tempo_leitura: form.tempo_leitura || null,
      corpo_html: form.corpo_html || null, posicao: Number(form.posicao) || 0, publicado: !!form.publicado,
    }
    try {
      if (editing.novo) await createArticle(payload)
      else await updateArticle(editing.id, payload)
      toast('Artigo salvo ✓'); setEditing(null); await load()
    } catch (e) { toast('Erro ao salvar: ' + e.message) }
    setSaving(false)
  }
  const remove = async id => {
    try { await deleteArticle(id); toast('Artigo excluído'); if (editing?.id === id) setEditing(null); await load() }
    catch (e) { toast('Erro: ' + e.message) }
  }

  if (!editing) {
    return (
      <div>
        <div className="adm-head">
          <h2>Artigos <span className="adm-count">{list.length}</span></h2>
          <button className="adm-btn" onClick={startNew}><Plus size={16} /> Novo artigo</button>
        </div>
        {loading ? <div className="adm-loading"><Loader2 className="spin" size={22} /> Carregando…</div>
          : list.length === 0 ? <div className="adm-empty">Nenhum artigo ainda.</div>
          : list.map(a => (
            <div className="adm-row" key={a.id}>
              <div className="adm-thumb">{a.cover_url ? <img src={a.cover_url} alt="" /> : <span>{a.emoji}</span>}</div>
              <div className="adm-row-info">
                <b>{a.titulo}</b>
                <span>{a.tag || '—'} · {a.tempo_leitura || ''} {a.publicado ? '' : '· rascunho'}</span>
              </div>
              <div className="adm-row-actions">
                <button className="adm-btn sm ghost" onClick={() => startEdit(a)}>Editar</button>
                <DeleteButton onConfirm={() => remove(a.id)} />
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
        <h2>{editing.novo ? 'Novo artigo' : 'Editar artigo'}</h2>
      </div>
      <div className="adm-grid">
        <Field label="Categoria (tag)"><input value={form.tag || ''} onChange={e => set('tag', e.target.value)} placeholder="Reserva, Leilões…" /></Field>
        <Field label="Emoji"><input value={form.emoji || ''} onChange={e => set('emoji', e.target.value)} maxLength={4} /></Field>
        <Field label="Título" wide><input value={form.titulo} onChange={e => set('titulo', e.target.value)} /></Field>
        <Field label="Tempo de leitura"><input value={form.tempo_leitura || ''} onChange={e => set('tempo_leitura', e.target.value)} placeholder="5 min de leitura" /></Field>
        <Field label="Ordem"><input type="number" value={form.posicao} onChange={e => set('posicao', e.target.value)} /></Field>
        <Field label="Conteúdo (HTML)" wide>
          <textarea rows={8} value={form.corpo_html || ''} onChange={e => set('corpo_html', e.target.value)}
            placeholder="<h1>Título</h1><p>Texto…</p>" />
        </Field>
        <Field label="Publicado" wide>
          <label className="adm-check"><input type="checkbox" checked={!!form.publicado} onChange={e => set('publicado', e.target.checked)} /> Visível no app</label>
        </Field>
        <ImageUpload bucket="article-covers" label="Imagem de capa" value={form.cover_url} onChange={url => set('cover_url', url)} />
      </div>
      <div className="adm-actions-bar">
        <button className="adm-btn" onClick={save} disabled={saving}>{saving ? <><Loader2 className="spin" size={16} /> Salvando…</> : 'Salvar artigo'}</button>
        {!editing.novo && <DeleteButton onConfirm={() => remove(editing.id)} label="Excluir artigo" />}
      </div>
    </div>
  )
}
