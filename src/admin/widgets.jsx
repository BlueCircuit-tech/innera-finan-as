import { useState } from 'react'
import { X, Loader2, Trash2 } from 'lucide-react'
import { uploadImage } from '../api.js'
import { useToast } from '../store.jsx'

export function Field({ label, children, wide }) {
  return (
    <div className={'adm-field' + (wide ? ' wide' : '')}>
      {label && <label>{label}</label>}
      {children}
    </div>
  )
}

export function ImageUpload({ bucket, value, onChange, label = 'Imagem' }) {
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const pick = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const url = await uploadImage(bucket, file)
      onChange(url)
      toast('Imagem enviada ✓')
    } catch (err) {
      toast('Falha no upload: ' + (err.message || err))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="adm-field wide">
      <label>{label}</label>
      <div className="adm-upload">
        <div className="adm-upload-preview">
          {value
            ? <img src={value} alt="" />
            : <span className="ph">{busy ? <Loader2 className="spin" size={20} /> : 'sem imagem'}</span>}
        </div>
        <div className="adm-upload-actions">
          <label className="adm-btn sm">
            {busy ? 'Enviando…' : (value ? 'Trocar' : 'Enviar imagem')}
            <input type="file" accept="image/*" hidden onChange={pick} disabled={busy} />
          </label>
          {value && <button type="button" className="adm-btn sm ghost" onClick={() => onChange(null)}><X size={14} /> Remover</button>}
        </div>
      </div>
    </div>
  )
}

/* Botão de excluir com confirmação em 2 toques */
export function DeleteButton({ onConfirm, label = 'Excluir' }) {
  const [armed, setArmed] = useState(false)
  if (armed) {
    return (
      <span className="adm-confirm">
        <button className="adm-btn sm danger" onClick={onConfirm}>Confirmar</button>
        <button className="adm-btn sm ghost" onClick={() => setArmed(false)}>Cancelar</button>
      </span>
    )
  }
  return <button className="adm-btn sm ghost danger" onClick={() => setArmed(true)}><Trash2 size={14} /> {label}</button>
}
