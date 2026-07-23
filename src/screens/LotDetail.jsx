import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, Clock, Check, AlertTriangle, FileText, Download, Gavel } from 'lucide-react'
import { useStore, useToast, fmt0, discount } from '../store.jsx'
import { Sheet } from '../components/ui.jsx'

export default function LotDetail({ go, route }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const lot = state.lots.find(l => l.id === route.lotId)
  const [gi, setGi] = useState(0)
  const [sheet, setSheet] = useState(false)
  const [bid, setBid] = useState('')

  if (!lot) return null
  const fav = state.favs.includes(lot.id)
  const my = state.myBids.find(b => b.lot === lot.id)
  const hist = state.bidHistory[lot.id] || [['Sem lances ainda', '—']]
  const back = () => go(route.prev === 'lot' ? 'auctions' : route.prev || 'auctions')
  const move = d => setGi((gi + d + lot.fotos.length) % lot.fotos.length)

  const openBid = () => { setBid(String(lot.lance + lot.inc)); setSheet(true) }
  const confirm = () => {
    const v = parseFloat((bid || '0').toString().replace(/\./g, '').replace(',', '.'))
    if (!v || v < lot.lance + lot.inc) { toast('O lance mínimo é ' + fmt0(lot.lance + lot.inc)); return }
    dispatch({ type: 'PLACE_BID', id: lot.id, val: v })
    setSheet(false); toast(`Lance de ${fmt0(v)} registrado! Você está vencendo 🎉`)
  }

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
          {my && (
            <span className={'pill ' + (my.status === 'vencendo' ? 'leaf' : 'crit')}>
              {my.status === 'vencendo' ? <><Check size={12} /> Você está vencendo</> : <><AlertTriangle size={12} /> Você foi superada</>}
            </span>
          )}
        </div>
        <h2 className="serif lot-title">{lot.nome}</h2>
        <p className="lot-desc">{lot.desc}</p>

        <div className="infogrid">
          <div className="icell"><div className="k">Valor de mercado</div><div className="v num">{fmt0(lot.aval)}</div></div>
          <div className="icell"><div className="k">Preço atual</div><div className="v num">{fmt0(lot.lance)}</div></div>
          <div className="icell"><div className="k">Incremento mínimo</div><div className="v num">{fmt0(lot.inc)}</div></div>
          <div className="icell"><div className="k">Abaixo do mercado</div><div className="v num leafc">−{discount(lot)}%</div></div>
        </div>

        <div className="sectiontitle"><h3>Histórico de lances</h3><span className="muted" style={{ fontSize: 12 }}>{lot.bids} no total</span></div>
        <div className="card" style={{ padding: '6px 16px' }}>
          {hist.map((b, i) => (
            <div className="bidrow" key={i}>
              <div className="bi num">{i + 1}º</div>
              <b className={b[2] ? 'goldc' : ''}>{b[0]}{b[2] && <span className="pill gray" style={{ marginLeft: 6 }}>você</span>}</b>
              <span className="bv num">R$ {b[1]}</span>
            </div>
          ))}
        </div>

        <div className="sectiontitle"><h3>Documentação</h3></div>
        <div className="card" style={{ padding: '6px 16px' }}>
          {lot.docs.map(d => (
            <button className="docrow" key={d} onClick={() => toast('Download simulado: ' + d)}>
              <FileText size={17} className="muted" /><span className="grow">{d}</span><Download size={16} className="muted" />
            </button>
          ))}
        </div>

        <p className="disclaimer">Lote conduzido pelo inneraleiloes.com.br. Leia o edital antes de dar lances. Valores e lotes fictícios para demonstração.</p>
      </div>

      <div className="lot-cta">
        <button className="btn" onClick={openBid}><Gavel size={17} /> Dar lance</button>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)}>
        <h3 className="serif sheet-title">Dar lance</h3>
        <p className="sheet-sub">{lot.nome}</p>
        <div className="budget-sum" style={{ marginBottom: 14 }}>
          <div className="bcell"><div className="k">Lance atual</div><div className="v num">{fmt0(lot.lance)}</div></div>
          <div className="bcell"><div className="k">Incremento mín.</div><div className="v num">{fmt0(lot.inc)}</div></div>
        </div>
        <div className="field"><label>Seu lance (R$)</label>
          <input value={bid} onChange={e => setBid(e.target.value)} inputMode="numeric" /></div>
        <p className="disclaimer" style={{ margin: '-4px 0 14px' }}>O lance é enviado ao inneraleiloes.com.br. Neste protótipo, tudo é simulado.</p>
        <button className="btn" onClick={confirm}>Confirmar lance</button>
      </Sheet>
    </div>
  )
}
