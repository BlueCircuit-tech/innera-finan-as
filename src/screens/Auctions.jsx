import { useState } from 'react'
import { Heart, SearchX } from 'lucide-react'
import { useStore } from '../store.jsx'
import { lotCats } from '../data.js'
import LotCard from '../components/LotCard.jsx'

export default function Auctions({ go }) {
  const { state } = useStore()
  const [filter, setFilter] = useState('Todos')
  const list = state.lots.filter(l => filter === 'Todos' || l.cat === filter)

  return (
    <div className="pb">
      <div className="topbar">
        <h2>Explorar leilões</h2>
        <button className="iconbtn" onClick={() => go('mybids')}><Heart size={18} /></button>
      </div>
      <div className="screen-sub">Oportunidades selecionadas para você construir patrimônio.</div>

      <div className="chiprow">
        {lotCats.map(c => (
          <button key={c} className={'chip' + (c === filter ? ' on' : '')} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="pad">
        {list.length ? (
          list.map((l, i) => <LotCard key={l.id} lot={l} index={i} onOpen={id => go('lot', { lotId: id })} />)
        ) : (
          <div className="empty">
            <SearchX size={40} className="muted" />
            <b className="serif">Nenhum lote nesta categoria</b>
            <p>Novos leilões entram toda semana. Favorite um lote para ser avisada.</p>
          </div>
        )}
      </div>
    </div>
  )
}
