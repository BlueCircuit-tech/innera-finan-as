import { useState } from 'react'
import { Heart, Gavel, Clock } from 'lucide-react'
import { useStore, useToast, fmt0 } from '../store.jsx'
import { TopBar } from '../components/ui.jsx'

export default function MyBids({ go }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [tab, setTab] = useState('bids')

  const open = id => go('lot', { lotId: id })

  return (
    <div className="pb">
      <TopBar title="Meus lances & favoritos" onBack={() => go('auctions')} />
      <div className="segtabs">
        <button className={tab === 'bids' ? 'on' : ''} onClick={() => setTab('bids')}>Participando</button>
        <button className={tab === 'favs' ? 'on' : ''} onClick={() => setTab('favs')}>Favoritos</button>
      </div>

      <div className="pad">
        {tab === 'bids' ? (
          state.myBids.length ? state.myBids.map(b => {
            const l = state.lots.find(x => x.id === b.lot)
            const win = b.status === 'vencendo'
            return (
              <button className="bidcard" key={b.lot} onClick={() => open(l.id)}>
                <div className={`bimg ph ${l.ph}`}>{l.ico}</div>
                <div className="grow">
                  <h5 className="serif">{l.nome}</h5>
                  <div className="m">Seu lance: <b className="goldc num">{fmt0(b.meu)}</b> · atual: {fmt0(l.lance)}</div>
                  <div className="m"><Clock size={12} /> encerra em {l.fim}</div>
                </div>
                <span className={'pill ' + (win ? 'leaf' : 'crit')}>{win ? 'Vencendo' : 'Superada'}</span>
              </button>
            )
          }) : (
            <div className="empty"><Gavel size={38} className="muted" /><b className="serif">Você ainda não deu lances</b><p>Explore os leilões e use sua sobra para o primeiro lance.</p></div>
          )
        ) : (
          state.favs.length ? state.lots.filter(l => state.favs.includes(l.id)).map(l => (
            <button className="bidcard" key={l.id} onClick={() => open(l.id)}>
              <div className={`bimg ph ${l.ph}`}>{l.ico}</div>
              <div className="grow">
                <h5 className="serif">{l.nome}</h5>
                <div className="m">Preço atual: <b className="goldc num">{fmt0(l.lance)}</b> · {l.bids} lances</div>
                <div className="m"><Clock size={12} /> encerra em {l.fim}</div>
              </div>
              <span className="iconbtn" onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FAV', id: l.id }); toast('Removido dos favoritos') }}>
                <Heart size={17} fill="currentColor" className="goldc" />
              </span>
            </button>
          )) : (
            <div className="empty"><Heart size={38} className="muted" /><b className="serif">Nenhum favorito ainda</b><p>Toque no coração de um lote para acompanhá-lo por aqui.</p></div>
          )
        )}
      </div>
    </div>
  )
}
