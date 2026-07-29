import { useEffect, useState } from 'react'
import { Loader2, Mail, Phone, RefreshCw, ArrowLeft } from 'lucide-react'
import { useToast } from '../store.jsx'
import { adminListUsers, adminDeleteUser, adminUpdateUser } from '../api.js'
import { Field, DeleteButton } from './widgets.jsx'

const fmtData = iso => {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d) ? '' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// máscara de telefone BR: (41) 99999-9999
function maskPhone(v) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function UsersAdmin() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [editing, setEditing] = useState(null) // null | usuário
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminListUsers()
      if (data === null) { setMissing(true); setUsers([]) }
      else { setMissing(false); setUsers(data) }
    } catch (e) { toast('Erro ao carregar: ' + e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const startEdit = u => { setEditing(u); setNome(u.nome || ''); setTelefone(maskPhone(u.telefone || '')) }

  const save = async () => {
    setSaving(true)
    try {
      await adminUpdateUser(editing.id, { nome: nome.trim(), telefone: telefone.trim() })
      toast('Usuário atualizado ✓')
      await load()
      setEditing(null)
    } catch (e) { toast('Erro ao salvar: ' + e.message) }
    setSaving(false)
  }

  const remove = async id => {
    try { await adminDeleteUser(id); toast('Usuário excluído'); if (editing?.id === id) setEditing(null); await load() }
    catch (e) { toast('Erro ao excluir: ' + e.message) }
  }

  /* ---------- FORM ---------- */
  if (editing) {
    return (
      <div>
        <div className="adm-head">
          <button className="adm-btn sm ghost" onClick={() => setEditing(null)}><ArrowLeft size={15} /> Voltar</button>
          <h2>Editar usuário</h2>
        </div>
        <div className="adm-grid">
          <Field label="Nome" wide><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" /></Field>
          <Field label="Telefone" wide><input type="tel" inputMode="tel" value={telefone} onChange={e => setTelefone(maskPhone(e.target.value))} placeholder="(41) 99999-9999" maxLength={16} /></Field>
          <Field label="E-mail (somente leitura)" wide><input value={editing.email || ''} disabled /></Field>
        </div>
        <div className="adm-actions-bar">
          <button className="adm-btn" onClick={save} disabled={saving}>{saving ? <><Loader2 className="spin" size={16} /> Salvando…</> : 'Salvar'}</button>
          <DeleteButton onConfirm={() => remove(editing.id)} label="Excluir usuário" />
        </div>
      </div>
    )
  }

  /* ---------- LISTA ---------- */
  return (
    <div>
      <div className="adm-head">
        <h2>Usuários <span className="adm-count">{users.length}</span></h2>
        <button className="adm-btn sm ghost" onClick={load}><RefreshCw size={14} /> Atualizar</button>
      </div>

      {missing ? (
        <div className="adm-empty">
          As funções de usuários ainda não existem no banco.<br />
          Rode <b>supabase/auth.sql</b> no SQL Editor do Supabase para habilitar esta aba.
        </div>
      ) : loading ? (
        <div className="adm-loading"><Loader2 className="spin" size={22} /> Carregando…</div>
      ) : users.length === 0 ? (
        <div className="adm-empty">Nenhum usuário cadastrado ainda.</div>
      ) : (
        users.map(u => (
          <div className="adm-row" key={u.id}>
            <div className="adm-thumb"><span>{(u.nome || u.email || '?').slice(0, 1).toUpperCase()}</span></div>
            <div className="adm-row-info">
              <b>{u.nome || '(sem nome)'}</b>
              <span className="adm-user-meta">
                <span><Mail size={12} /> {u.email || '—'}</span>
                <span><Phone size={12} /> {maskPhone(u.telefone) || '—'}</span>
              </span>
              {u.created_at && <span className="adm-user-since">Desde {fmtData(u.created_at)}</span>}
            </div>
            <div className="adm-row-actions">
              <button className="adm-btn sm ghost" onClick={() => startEdit(u)}>Editar</button>
              <DeleteButton onConfirm={() => remove(u.id)} label="Excluir" />
            </div>
          </div>
        ))
      )}
    </div>
  )
}
