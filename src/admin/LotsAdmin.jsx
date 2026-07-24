import { useEffect, useState } from 'react'
import { Plus, ArrowLeft, Star, Loader2, ImagePlus } from 'lucide-react'
import { useToast, fmt0 } from '../store.jsx'
import { adminLots, createLot, updateLot, deleteLot, addLotPhoto, deleteLotPhoto } from '../api.js'
import { Field, ImageUpload, DeleteButton } from './widgets.jsx'

const CATEGORIAS = ['Imóveis', 'Veículos', 'Eletrônicos', 'Joias', 'Máquinas']
const RISCOS = ['Baixo', 'Médio', 'Alto']
const BLANK = {
  categoria: 'Imóveis', emoji: '🏢', image_url: null, nome: '', specs: '', status: '', descricao: '',
  valor_mercado: '', preco_atual: '', incremento: '100', ends_at: '', lances: 0,
  rentabilidade: '', risco: 'Baixo', revenda: '', recomendado: false,
}

const toInput = iso => {
  if (!iso) return ''
  const d = new Date(iso)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function LotsAdmin() {
  const toast = useToast()
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null=lista | objeto=form
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setLots(await adminLots()) } catch (e) { toast('Erro ao carregar: ' + e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const startNew = () => { setForm({ ...BLANK }); setEditing({ novo: true }) }
  const startEdit = l => {
    setForm({ ...BLANK, ...l, ends_at: toInput(l.ends_at), image_url: l.image_url || null })
    setEditing(l)
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.nome.trim()) { toast('Informe o nome do lote'); return }
    setSaving(true)
    const payload = {
      categoria: form.categoria, emoji: form.emoji || null, image_url: form.image_url || null,
      nome: form.nome.trim(), specs: form.specs || null, status: form.status || null, descricao: form.descricao || null,
      valor_mercado: Number(form.valor_mercado) || 0, preco_atual: Number(form.preco_atual) || 0,
      incremento: Number(form.incremento) || 100,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : new Date(Date.now() + 3 * 86400000).toISOString(),
      lances: Number(form.lances) || 0, rentabilidade: form.rentabilidade || null, risco: form.risco,
      revenda: form.revenda || null, recomendado: !!form.recomendado,
    }
    try {
      if (editing.novo) {
        const created = await createLot(payload)
        toast('Lote criado ✓')
        const fresh = await adminLots(); setLots(fresh)
        const full = fresh.find(x => x.id === created.id) || { ...created, photos: [] }
        setForm({ ...BLANK, ...full, ends_at: toInput(full.ends_at) })
        setEditing(full) // continua no form para adicionar fotos
      } else {
        await updateLot(editing.id, payload)
        toast('Lote atualizado ✓')
        const fresh = await adminLots(); setLots(fresh)
        setEditing(fresh.find(x => x.id === editing.id) || editing)
      }
    } catch (e) { toast('Erro ao salvar: ' + e.message) }
    setSaving(false)
  }

  const remove = async id => {
    try { await deleteLot(id); toast('Lote excluído'); if (editing?.id === id) setEditing(null); await load() }
    catch (e) { toast('Erro ao excluir: ' + e.message) }
  }

  const addPhoto = async url => {
    if (!editing?.id) return
    try {
      await addLotPhoto(editing.id, { image_url: url, posicao: (editing.photos?.length || 0) })
      const fresh = await adminLots(); setLots(fresh)
      setEditing(fresh.find(x => x.id === editing.id))
    } catch (e) { toast('Erro na foto: ' + e.message) }
  }
  const removePhoto = async pid => {
    try {
      await deleteLotPhoto(pid)
      const fresh = await adminLots(); setLots(fresh)
      setEditing(fresh.find(x => x.id === editing.id))
    } catch (e) { toast('Erro: ' + e.message) }
  }

  /* ---------- LISTA ---------- */
  if (!editing) {
    return (
      <div>
        <div className="adm-head">
          <h2>Leilões <span className="adm-count">{lots.length}</span></h2>
          <button className="adm-btn" onClick={startNew}><Plus size={16} /> Novo lote</button>
        </div>
        {loading ? <div className="adm-loading"><Loader2 className="spin" size={22} /> Carregando…</div>
          : lots.length === 0 ? <div className="adm-empty">Nenhum lote. Clique em “Novo lote”.</div>
          : lots.map(l => (
            <div className="adm-row" key={l.id}>
              <div className="adm-thumb">{l.image_url ? <img src={l.image_url} alt="" /> : <span>{l.emoji}</span>}</div>
              <div className="adm-row-info">
                <b>{l.nome} {l.recomendado && <Star size={13} className="goldc" fill="currentColor" />}</b>
                <span>{l.categoria} · {fmt0(Number(l.preco_atual))} · {l.photos?.length || 0} foto(s)</span>
              </div>
              <div className="adm-row-actions">
                <button className="adm-btn sm ghost" onClick={() => startEdit(l)}>Editar</button>
                <DeleteButton onConfirm={() => remove(l.id)} />
              </div>
            </div>
          ))}
      </div>
    )
  }

  /* ---------- FORM ---------- */
  return (
    <div>
      <div className="adm-head">
        <button className="adm-btn sm ghost" onClick={() => setEditing(null)}><ArrowLeft size={15} /> Voltar</button>
        <h2>{editing.novo ? 'Novo lote' : 'Editar lote'}</h2>
      </div>

      <div className="adm-grid">
        <Field label="Categoria">
          <select value={form.categoria} onChange={e => set('categoria', e.target.value)}>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Emoji (placeholder)"><input value={form.emoji || ''} onChange={e => set('emoji', e.target.value)} maxLength={4} /></Field>
        <Field label="Nome do lote" wide><input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex.: Apartamento 2 dorms — Centro" /></Field>
        <Field label="Ficha (specs)" wide><input value={form.specs || ''} onChange={e => set('specs', e.target.value)} placeholder="64m² · 2 dormitórios · 1 vaga" /></Field>
        <Field label="Situação" wide><input value={form.status || ''} onChange={e => set('status', e.target.value)} placeholder="Ocupado · Venda direta" /></Field>
        <Field label="Descrição" wide><textarea rows={3} value={form.descricao || ''} onChange={e => set('descricao', e.target.value)} /></Field>

        <Field label="Valor de mercado (R$)"><input type="number" value={form.valor_mercado} onChange={e => set('valor_mercado', e.target.value)} /></Field>
        <Field label="Preço atual (R$)"><input type="number" value={form.preco_atual} onChange={e => set('preco_atual', e.target.value)} /></Field>
        <Field label="Incremento (R$)"><input type="number" value={form.incremento} onChange={e => set('incremento', e.target.value)} /></Field>
        <Field label="Nº de lances"><input type="number" value={form.lances} onChange={e => set('lances', e.target.value)} /></Field>
        <Field label="Rentabilidade est."><input value={form.rentabilidade || ''} onChange={e => set('rentabilidade', e.target.value)} placeholder="32%" /></Field>
        <Field label="Nível de risco">
          <select value={form.risco} onChange={e => set('risco', e.target.value)}>{RISCOS.map(r => <option key={r}>{r}</option>)}</select>
        </Field>
        <Field label="Tempo de revenda"><input value={form.revenda || ''} onChange={e => set('revenda', e.target.value)} placeholder="60 a 90 dias" /></Field>
        <Field label="Encerra em"><input type="datetime-local" value={form.ends_at} onChange={e => set('ends_at', e.target.value)} /></Field>
        <Field label="Recomendado" wide>
          <label className="adm-check"><input type="checkbox" checked={!!form.recomendado} onChange={e => set('recomendado', e.target.checked)} /> Marcar como “Oportunidade recomendada”</label>
        </Field>

        <ImageUpload bucket="lot-photos" label="Foto de capa" value={form.image_url} onChange={url => set('image_url', url)} />
      </div>

      <div className="adm-actions-bar">
        <button className="adm-btn" onClick={save} disabled={saving}>{saving ? <><Loader2 className="spin" size={16} /> Salvando…</> : 'Salvar lote'}</button>
        {!editing.novo && <DeleteButton onConfirm={() => remove(editing.id)} label="Excluir lote" />}
      </div>

      {/* galeria */}
      <div className="adm-gallery">
        <h3>Galeria de fotos</h3>
        {editing.novo
          ? <p className="adm-hint">Salve o lote primeiro para adicionar fotos à galeria.</p>
          : (
            <>
              <div className="adm-gallery-grid">
                {(editing.photos || []).map(p => (
                  <div className="adm-gphoto" key={p.id}>
                    {p.image_url ? <img src={p.image_url} alt="" /> : <span>{p.emoji}</span>}
                    <button className="adm-gphoto-del" onClick={() => removePhoto(p.id)}>×</button>
                  </div>
                ))}
              </div>
              <GalleryAdder onAdd={addPhoto} />
            </>
          )}
      </div>
    </div>
  )
}

function GalleryAdder({ onAdd }) {
  return (
    <div style={{ marginTop: 10 }}>
      <ImageUpload bucket="lot-photos" label={<span><ImagePlus size={14} /> Adicionar foto à galeria</span>} value={null} onChange={onAdd} />
    </div>
  )
}
