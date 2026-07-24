import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Gavel, Instagram } from 'lucide-react'
import { useToast } from '../store.jsx'
import { LINKS, openExternal } from '../data.js'

const SLIDES = [
  { logo: true, h: 'Organize suas finanças do seu jeito', p: 'Crie um orçamento simples por categorias e dê um trabalho para cada real que entra.' },
  { art: '✨', h: 'Tenha reserva no fim do mês', p: 'Acompanhe sua reserva crescer mês a mês — sem culpa e sem aperto.' },
  { art: '🏛️', h: 'Invista em leilões e construa patrimônio', p: 'Use sua reserva para arrematar imóveis, veículos e bens abaixo do valor de mercado.' },
]

export default function Intro({ go }) {
  const [step, setStep] = useState('splash') // splash | onboard | auth
  const [slide, setSlide] = useState(0)
  const [tab, setTab] = useState('login')
  const toast = useToast()

  useEffect(() => {
    if (step === 'splash') {
      const t = setTimeout(() => setStep('onboard'), 1900)
      return () => clearTimeout(t)
    }
  }, [step])

  if (step === 'splash')
    return (
      <div className="splash">
        <motion.div className="splash-mark"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <img src="/logo.png" alt="Innera" />
        </motion.div>
        <motion.h1 className="serif"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          Innera
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Finanças · Reserva · Leilões
        </motion.p>
        <div className="splash-dots"><i /><i /><i /></div>
      </div>
    )

  if (step === 'onboard') {
    const s = SLIDES[slide]
    const last = slide === SLIDES.length - 1
    return (
      <div className="onboard">
        <div className="ob-body">
          <motion.div className="ob-slide" key={slide}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <div className="ob-art">
              {s.logo ? <img className="ob-logo" src="/logo.png" alt="Innera" /> : s.art}
            </div>
            <h2 className="serif">{s.h}</h2>
            <p>{s.p}</p>
          </motion.div>
        </div>
        <div className="ob-foot">
          <div className="ob-dots">{SLIDES.map((_, i) => <i key={i} className={i === slide ? 'on' : ''} />)}</div>
          <button className="btn" onClick={() => (last ? setStep('auth') : setSlide(slide + 1))}>
            {last ? 'Começar agora' : 'Continuar'} <ArrowRight size={18} />
          </button>
          <button className="ghostlink" onClick={() => setStep('auth')}>Pular introdução</button>
        </div>
      </div>
    )
  }

  // auth
  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="auth-mark"><img src="/logo.png" alt="Innera" /></div>
        <h1 className="serif">{tab === 'login' ? 'Que bom te ver!' : 'Vem construir com a gente'}</h1>
        <p>{tab === 'login' ? 'Entre para continuar cuidando do seu dinheiro.' : 'Crie sua conta em menos de um minuto.'}</p>
      </div>
      <div className="auth-tabs">
        <button className={tab === 'login' ? 'on' : ''} onClick={() => setTab('login')}>Entrar</button>
        <button className={tab === 'signup' ? 'on' : ''} onClick={() => setTab('signup')}>Criar conta</button>
      </div>
      <div className="auth-body">
        {tab === 'signup' && (
          <>
            <div className="field"><label>Nome completo</label><input placeholder="Seu nome" /></div>
            <div className="field"><label>Telefone</label><input type="tel" inputMode="tel" placeholder="(41) 99999-9999" /></div>
          </>
        )}
        <div className="field"><label>E-mail</label><input type="email" defaultValue={tab === 'login' ? 'paula@email.com' : ''} placeholder="voce@email.com" /></div>
        <div className="field"><label>Senha</label><input type="password" placeholder="••••••••" /></div>
        <button className="btn" onClick={() => { toast('Bem-vinda, Paula! 💛'); go('home') }}>
          {tab === 'login' ? 'Entrar' : 'Criar minha conta'}
        </button>
        <div className="auth-div">Conheça também</div>
        <div className="auth-social">
          <button className="btn ghost" onClick={() => openExternal(LINKS.leiloes)}><Gavel size={16} /> Leilões</button>
          <button className="btn ghost" onClick={() => openExternal(LINKS.instagram)}><Instagram size={16} /> Instagram</button>
        </div>
      </div>
    </div>
  )
}
