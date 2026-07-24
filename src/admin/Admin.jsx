import { useState } from 'react'
import { LogOut, Gavel, FileText, GraduationCap, Lock } from 'lucide-react'
import { useToast, useToastMsg } from '../store.jsx'
import { Toast } from '../components/ui.jsx'
import { hasSupabase } from '../supabase.js'
import LotsAdmin from './LotsAdmin.jsx'
import ArticlesAdmin from './ArticlesAdmin.jsx'
import MediaAdmin from './MediaAdmin.jsx'
import './admin.css'

const PW = import.meta.env.VITE_ADMIN_PASSWORD || 'innera2026'
const TABS = [['lots', 'Leilões', Gavel], ['articles', 'Artigos', FileText], ['media', 'Aprender', GraduationCap]]

export default function Admin({ onExit }) {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [tab, setTab] = useState('lots')
  const toast = useToast()
  const toastMsg = useToastMsg()

  const tryLogin = () => (pw === PW ? setAuthed(true) : toast('Senha incorreta'))

  if (!authed) {
    return (
      <div className="adm-login">
        <div className="adm-login-card">
          <div className="adm-lock"><Lock size={22} /></div>
          <h1 className="serif">Área administrativa</h1>
          <p>Gerencie leilões, artigos e conteúdos do app.</p>
          <input type="password" placeholder="Senha" value={pw}
            onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && tryLogin()} autoFocus />
          <button className="adm-btn" onClick={tryLogin}>Entrar</button>
          <button className="adm-link" onClick={onExit}>← Voltar ao app</button>
        </div>
        <Toast data={toastMsg} />
      </div>
    )
  }

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-brand">
          <img src="/logo.png" alt="Innera" />
          <div><b>Innera</b><span>Painel administrativo</span></div>
        </div>
        <button className="adm-btn sm ghost" onClick={onExit}><LogOut size={15} /> Sair</button>
      </header>

      {!hasSupabase && (
        <div className="adm-warn">⚠️ Supabase não configurado (.env). O CRUD precisa da conexão para salvar.</div>
      )}

      <nav className="adm-tabs">
        {TABS.map(([id, label, I]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}><I size={16} /> {label}</button>
        ))}
      </nav>

      <main className="adm-main">
        {tab === 'lots' && <LotsAdmin />}
        {tab === 'articles' && <ArticlesAdmin />}
        {tab === 'media' && <MediaAdmin />}
      </main>

      <Toast data={toastMsg} />
    </div>
  )
}
