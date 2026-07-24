import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, Clock, ExternalLink, Sparkles } from 'lucide-react'
import { useStore, useToast, fmt0, discount } from '../store.jsx'
import { LINKS, openExternal } from '../data.js'

export default function LotDetail({ go, route }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const lot = state.lots.find(l => l.id === route.lotId)
  const [gi, setGi] = useState(0)

  if (!lot) return null
  const fav = state.favs.includes(lot.id)
  const back = () => go(route.prev === 'lot' ? 'auctions' : route.prev || 'auctions')
  const move = d => setGi((gi + d + lot.fotos.length) % lot.fotos.length)

  return (
    <div className="pb lot-detail">
      <div className={`gal ph ${lot.ph}`}>
        <motion.div className="galimg" key={gi}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {(() => {
            const f = lot.fotos[gi]
            const image = typeof f === 'string' ? null : f?.image_url
            const emoji = typeof f === 'string' ? f : f?.emoji
            return image
              ? <img className="galimg-img" src={image} alt={lot.nome} />
              : <span>{emoji}</span>
          })()}
        </motion.div>
        <button className="gal-btn back" onClick={back}><ChevronLeft size={20} /></button>
        <button className="gal-btn fav" onClick={() => { dispatch({ type: 'TOGGLE_FAV', id: lot.id }); toast(fav ? 'Removido dos favoritos' : 'Salvo nos favoritos ♥') }}>
          <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
        </button>
        <button className="gal-btn l" onClick={() => move(-1)}><ChevronLeft size={18} /></button>
        <button className="gal-btn r" onClick={() => move(1)}><ChevronRight size={18} /></button>
        <div className="gal-dots">{lot.fotos.map((_, i) => <i key={i} className={i === gi ? 'on' : ''} />)}</div>
      </div>

      <div className="pad">
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', margin: '16px 0 6px' }}>
          <span className="pill gray">{lot.cat}</span>
          <span className="pill warn"><Clock size={12} /> encerra em {lot.fim}</span>
        </div>
        <h2 className="serif lot-title">{lot.nome}</h2>
        <p className="lot-desc">{lot.desc}</p>

        <div className="infogrid">
          <div className="icell"><div className="k">Valor de mercado</div><div className="v num">{fmt0(lot.aval)}</div></div>
          <div className="icell"><div className="k">Preço atual</div><div className="v num">{fmt0(lot.lance)}</div></div>
          <div className="icell"><div className="k">Economia</div><div className="v num leafc">{fmt0(lot.aval - lot.lance)}</div></div>
          <div className="icell"><div className="k">Abaixo do mercado</div><div className="v num leafc">−{discount(lot)}%</div></div>
        </div>

        <div className="riskrow" style={{ marginTop: 12 }}>
          <div className="riskcell"><span style={{ fontSize: 17 }} className="goldc">🛡️</span><div><div className="k">Nível de risco</div><div className="v">{lot.risco}</div></div></div>
          <div className="riskcell"><span style={{ fontSize: 17 }} className="goldc">📅</span><div><div className="k">Tempo de revenda</div><div className="v">{lot.revenda}</div></div></div>
        </div>

        <div className="iabox" style={{ marginTop: 14 }}>
          <div className="iaico"><Sparkles size={16} /></div>
          <p>Excelente oportunidade para investir e construir patrimônio.</p>
        </div>

        <p className="disclaimer">Todo o processo oficial de lances e documentação acontece no site do leiloeiro. Valores e lotes fictícios para demonstração.</p>
      </div>

      <div className="lot-cta">
        <button className="btn" onClick={() => openExternal(LINKS.leiloes)}>
          Ver no site e dar lance <ExternalLink size={17} />
        </button>
      </div>
    </div>
  )
}
