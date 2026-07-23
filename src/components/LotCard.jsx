import { motion } from 'framer-motion'
import { Star, Clock, TrendingDown, Shield, CalendarDays, Sparkles, ExternalLink, Heart } from 'lucide-react'
import { useStore, useToast, fmt0, discount } from '../store.jsx'

function Fav({ id, className, children }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const has = state.favs.includes(id)
  return (
    <button
      className={className}
      onClick={e => {
        e.stopPropagation()
        dispatch({ type: 'TOGGLE_FAV', id })
        toast(has ? 'Removido dos favoritos' : 'Salvo nos favoritos ♥')
      }}
    >
      {children(has)}
    </button>
  )
}

export default function LotCard({ lot, compact, onOpen, index = 0 }) {
  const disc = discount(lot)
  const img = (
    <div className={`lotimg ph ${lot.ph} ${lot.reco && !compact ? 'hasreco' : ''}`}>
      {lot.image_url
        ? <img className="lotimg-img" src={lot.image_url} alt={lot.nome} />
        : <span className="lotemoji">{lot.ico}</span>}
      <Fav id={lot.id} className="favbtn">{has => <Heart size={17} fill={has ? 'currentColor' : 'none'} />}</Fav>
      {lot.reco && !compact && (
        <span className="reco"><Star size={12} fill="currentColor" /> Oportunidade recomendada</span>
      )}
      <span className="timer"><Clock size={12} /> Encerra em {lot.fim}</span>
      <span className="below"><TrendingDown size={12} /> {disc}% abaixo do mercado</span>
    </div>
  )

  return (
    <motion.div
      className="lotcard"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpen(lot.id)}
    >
      {img}
      <div className="lotbody">
        <div className="cat">{lot.cat} · {lot.bids} lances</div>
        <h4>{lot.nome}</h4>
        <div className="specs">{lot.specs}</div>
        {compact ? (
          <div className="lotfoot">
            <div>
              <div className="k">Preço atual</div>
              <div className="v num">{fmt0(lot.lance)}</div>
            </div>
            <button className="btn sm" onClick={e => { e.stopPropagation(); onOpen(lot.id) }}>Ver lote</button>
          </div>
        ) : (
          <>
            <div className="status">{lot.status}</div>
            <div className="metgrid">
              <div className="metcell"><div className="k">Preço atual</div><div className="v num">{fmt0(lot.lance)}</div></div>
              <div className="metcell"><div className="k">Valor de mercado</div><div className="v num">{fmt0(lot.aval)}</div></div>
              <div className="metcell"><div className="k">Economia potencial</div><div className="v num leafc">{fmt0(lot.aval - lot.lance)}</div></div>
              <div className="metcell"><div className="k">Rentabilidade est.</div><div className="v num leafc">{lot.rentab}</div></div>
            </div>
            <div className="riskrow">
              <div className="riskcell"><Shield size={17} className="goldc" /><div><div className="k">Nível de risco</div><div className="v">{lot.risco}</div></div></div>
              <div className="riskcell"><CalendarDays size={17} className="goldc" /><div><div className="k">Tempo de revenda</div><div className="v">{lot.revenda}</div></div></div>
            </div>
            <div className="iabox">
              <div className="iaico"><Sparkles size={16} /></div>
              <div>
                <div className="tt">Análise da IA</div>
                <p>{lot.ia}</p>
                <button className="more" onClick={e => { e.stopPropagation(); onOpen(lot.id) }}>Ver análise completa →</button>
              </div>
            </div>
            <div className="lotcta">
              <button className="btn" onClick={e => { e.stopPropagation(); onOpen(lot.id) }}>
                Ver no site e dar lance <ExternalLink size={16} />
              </button>
              <Fav id={lot.id} className="fav2">
                {has => <><Heart size={15} fill={has ? 'currentColor' : 'none'} /> {has ? 'Nos favoritos' : 'Adicionar aos favoritos'}</>}
              </Fav>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
