import { useState } from 'react'
import { motion } from 'framer-motion'
import { Landmark, TrendingUp, ArrowRight } from 'lucide-react'
import { useStore, fmt0 } from '../store.jsx'
import { TopBar, CountUp } from '../components/ui.jsx'

export default function Sobra({ go }) {
  const { state } = useStore()
  const s = state.sobras
  const cur = s[s.length - 1][1]
  const prev = s[s.length - 2][1]
  const diff = cur - prev
  const max = Math.max(...s.map(x => x[1]))
  const total = s.reduce((a, x) => a + x[1], 0)
  const [active, setActive] = useState(s.length - 1)

  return (
    <div className="pb">
      <TopBar title="Minha sobra" onBack={() => go('home')} />
      <div className="pad">
        <div className="sobra-hero card">
          <div className="eyebrow">Sobra de julho</div>
          <div className="big num"><CountUp value={cur} /></div>
          <div className="muted">
            {diff >= 0
              ? `${fmt0(diff)} a mais que em junho — você está evoluindo 💛`
              : `${fmt0(-diff)} a menos que em junho — todo mês é um recomeço`}
          </div>
        </div>

        <div className="card">
          <h4 className="serif">Evolução da sobra</h4>
          <div className="muted" style={{ fontSize: 12, marginBottom: 20 }}>Últimos 6 meses · valores livres após o orçamento</div>
          <div className="chart">
            {s.map(([label, v], i) => {
              const h = Math.round((v / max) * 100)
              const isCur = i === s.length - 1
              return (
                <button className={'barcol' + (isCur ? ' cur' : '')} key={label}
                  onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}>
                  {active === i && <span className="barval num">{fmt0(v)}</span>}
                  <motion.div className="bar"
                    initial={{ height: 0 }} animate={{ height: h + '%' }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }} />
                  <span className="barlab">{label}</span>
                </button>
              )
            })}
          </div>
          <div className="chart-foot">
            <span>Total acumulado: <b className="num goldc">{fmt0(total)}</b></span>
            <span className={diff >= 0 ? 'leafc' : 'critc'}>
              <TrendingUp size={13} /> {diff >= 0 ? '+' : '−'}{Math.round(Math.abs(diff) / prev * 100)}% vs. mês anterior
            </span>
          </div>
        </div>

        <div className="card invite">
          <div className="tile lg"><Landmark size={22} className="goldc" /></div>
          <div className="grow">
            <b className="serif">Faça sua sobra trabalhar</b>
            <span className="muted">Há leilões com lance mínimo dentro do seu valor disponível.</span>
          </div>
        </div>
        <button className="btn" style={{ marginTop: 14 }} onClick={() => go('auctions')}>
          Investir em leilões <ArrowRight size={17} />
        </button>
      </div>
    </div>
  )
}
