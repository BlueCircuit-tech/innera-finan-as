import { motion } from 'framer-motion'
import { Search, Lightbulb, GraduationCap, FileText, Play, Mic, Star, ArrowUpRight, ChevronRight } from 'lucide-react'
import { useStore, useToast } from '../store.jsx'
import { quickLinks } from '../data.js'
import { Ring } from '../components/ui.jsx'
import Thumb from '../components/Thumb.jsx'

const ICONS = { GraduationCap, FileText, Play, Mic, Star }

export default function Learn({ go }) {
  const { state } = useStore()
  const toast = useToast()
  const articles = state.articles || []
  const methodo = state.methodo || []
  const tracks = state.tracks || []
  const featured = tracks.find(t => t.destaque) || tracks[0]
  const cont = tracks.find(t => !t.destaque && t.progresso > 0) || tracks[1]

  return (
    <div className="pb">
      <div className="topbar">
        <h2>Aprender</h2>
        <button className="iconbtn" onClick={() => toast('Busca de conteúdos em breve')}><Search size={18} /></button>
      </div>
      <div className="screen-sub">Conhecimento que transforma sua vida financeira.</div>

      <div className="pad">
        {featured && (
          <motion.div className="featured"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="eyebrow" style={{ color: 'rgba(243,241,231,.6)' }}>Trilha em destaque</div>
            <h3 className="serif">{featured.titulo}</h3>
            <p>{featured.subtitulo}</p>
            <button className="fbtn" onClick={() => go('article', { articleIdx: 3 })}>Começar trilha →</button>
            <Lightbulb className="flit" size={80} />
          </motion.div>
        )}

        <div className="quickgrid">
          {quickLinks.map(([label, icon]) => {
            const I = ICONS[icon]
            return (
              <button className="quick" key={label} onClick={() => toast(`${label} em breve`)}>
                <span className="qi"><I size={21} /></span>{label}
              </button>
            )
          })}
        </div>

        {cont && (
          <>
            <div className="sectiontitle"><h3>Continue aprendendo</h3><button className="link" onClick={() => toast('Suas trilhas em breve')}>Ver tudo <ArrowUpRight size={14} /></button></div>
            <button className="contcard" onClick={() => go('article', { articleIdx: 0 })}>
              <div className="cring"><Ring pct={cont.progresso} size={58} /><span className="num">{cont.progresso}%</span></div>
              <div className="grow">
                <div className="tag">Trilha: {cont.titulo}</div>
                <h5 className="serif">{cont.subtitulo}</h5>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{cont.progresso}% concluído</div>
              </div>
              <span className="cta">Continuar</span>
            </button>
          </>
        )}

        <div className="sectiontitle"><h3>Artigos em destaque</h3><button className="link" onClick={() => toast('Veja todos abaixo ↓')}>Ver todos <ArrowUpRight size={14} /></button></div>
        {articles.map((a, i) => (
          <motion.button className="artrow" key={i} onClick={() => go('article', { articleIdx: i })}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="aimg"><Thumb src={a.cover_url} emoji={a.ico} alt={a.titulo} /></div>
            <div className="grow">
              <div className="tag">{a.tag}</div>
              <h5 className="serif">{a.titulo}</h5>
              <div className="m">{a.tempo}</div>
            </div>
            <ChevronRight size={18} className="muted" />
          </motion.button>
        ))}

        <div className="sectiontitle"><h3>Metodologia Innera</h3><button className="link" onClick={() => toast('Metodologia completa em breve')}>Ver metodologia <ArrowUpRight size={14} /></button></div>
        <div className="metodo">
          {methodo.map(([t, d], i) => (
            <motion.div className="mstep" key={t}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="mnum serif">{i + 1}</div>
              <div><b className="serif">{t}</b><span>{d}</span></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
