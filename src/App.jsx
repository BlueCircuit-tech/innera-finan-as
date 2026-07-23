import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home as HomeIcon, Wallet, Plus, Gavel, GraduationCap, Signal, Wifi, BatteryFull } from 'lucide-react'
import { StoreProvider, useToastMsg } from './store.jsx'
import { Toast } from './components/ui.jsx'

import Intro from './screens/Intro.jsx'
import Home from './screens/Home.jsx'
import Budget from './screens/Budget.jsx'
import AddTx from './screens/AddTx.jsx'
import Sobra from './screens/Sobra.jsx'
import Auctions from './screens/Auctions.jsx'
import LotDetail from './screens/LotDetail.jsx'
import MyBids from './screens/MyBids.jsx'
import Learn from './screens/Learn.jsx'
import Article from './screens/Article.jsx'

const NAV = [
  ['home', 'Início', HomeIcon],
  ['budget', 'Orçamento', Wallet],
  ['auctions', 'Leilões', Gavel],
  ['learn', 'Aprender', GraduationCap],
]
const APP_SCREENS = ['home', 'budget', 'auctions', 'learn', 'sobra', 'mybids', 'article', 'add']
const NAV_TAB = { home: 'home', budget: 'budget', auctions: 'auctions', mybids: 'auctions', learn: 'learn', article: 'learn' }

function Shell() {
  const [route, setRoute] = useState({ id: 'intro', prev: null })
  const toastMsg = useToastMsg()

  const go = (id, extra = {}) => setRoute(r => ({ id, prev: r.id, ...extra }))

  const showNav = APP_SCREENS.includes(route.id)
  const activeTab = NAV_TAB[route.id]

  const screens = {
    intro: <Intro go={go} />,
    home: <Home go={go} />,
    budget: <Budget go={go} />,
    add: <AddTx go={go} route={route} />,
    sobra: <Sobra go={go} />,
    auctions: <Auctions go={go} />,
    lot: <LotDetail go={go} route={route} />,
    mybids: <MyBids go={go} />,
    learn: <Learn go={go} />,
    article: <Article go={go} route={route} />,
  }

  return (
    <div className="stage">
      <aside className="pitch">
        <div className="brand">
          <div className="mk"><img src="/logo.png" alt="Innera" /></div>
          <div>
            <div className="eyebrow">Innera</div>
            <div className="sub">Finanças & Leilões · protótipo</div>
          </div>
        </div>
        <h1>Organize, <em>sobre</em> e invista.</h1>
        <p className="lead">
          Finanças pessoais para mulheres: orçamento no método “cada real com um trabalho”,
          sobra mensal em destaque e uma ponte direta para investir em leilões.
        </p>
        <div className="feats">
          {[
            [Wallet, 'Orçamento consciente', 'Categorias vivas, gasto vs. disponível em tempo real.'],
            [GraduationCap, 'Educação financeira', 'Trilhas e a metodologia Innera, passo a passo.'],
            [Gavel, 'Leilões integrados', 'Lotes abaixo do mercado, com análise e favoritos.'],
          ].map(([I, t, d]) => (
            <div className="feat" key={t}>
              <div className="fi"><I size={18} /></div>
              <div><b>{t}</b><span>{d}</span></div>
            </div>
          ))}
        </div>
        <p className="disc">Protótipo navegável com dados fictícios. Nenhuma transação é real.</p>
      </aside>

      <div className="device">
        <div className="notch" />
        <div className="statusbar">
          <span>9:41</span>
          <span className="r"><Signal size={15} /><Wifi size={15} /><BatteryFull size={17} /></span>
        </div>

        <div className="viewport">
          {/* keyed remount: React unmounts the old screen instantly — enter-only
              animation, so we never depend on exit-completion callbacks */}
          <motion.div
            key={route.id}
            className="screen"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {screens[route.id]}
          </motion.div>
        </div>

        {showNav && (
          <motion.nav className="bottomnav"
            initial={{ y: 80 }} animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
            {NAV.slice(0, 2).map(([id, label, I]) => (
              <NavBtn key={id} active={activeTab === id} label={label} Icon={I} onClick={() => go(id)} />
            ))}
            <button className="nadd" onClick={() => go('add')} aria-label="Nova transação"><Plus size={26} /></button>
            {NAV.slice(2).map(([id, label, I]) => (
              <NavBtn key={id} active={activeTab === id} label={label} Icon={I} onClick={() => go(id)} />
            ))}
          </motion.nav>
        )}

        <Toast data={toastMsg} />
      </div>
    </div>
  )
}

function NavBtn({ active, label, Icon, onClick }) {
  return (
    <button className={'nitem' + (active ? ' active' : '')} onClick={onClick}>
      <span className="dot" />
      <Icon size={21} strokeWidth={active ? 2.4 : 2} />
      {label}
    </button>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
