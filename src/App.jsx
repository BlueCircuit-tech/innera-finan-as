import { useState } from 'react'
import { motion } from 'framer-motion'
import { Home as HomeIcon, Wallet, Plus, Gavel, GraduationCap, Signal, Wifi, BatteryFull } from 'lucide-react'
import { AuthProvider, useAuth } from './auth.jsx'
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
import Admin from './admin/Admin.jsx'

const NAV = [
  ['home', 'Início', HomeIcon],
  ['budget', 'Orçamento', Wallet],
  ['auctions', 'Leilões', Gavel],
  ['learn', 'Aprender', GraduationCap],
]
const APP_SCREENS = ['home', 'budget', 'auctions', 'learn', 'sobra', 'mybids', 'article', 'add']
const NAV_TAB = { home: 'home', budget: 'budget', auctions: 'auctions', mybids: 'auctions', learn: 'learn', article: 'learn' }

function Shell({ onAdmin }) {
  const { session, loading } = useAuth()
  const [route, setRoute] = useState({ id: 'home', prev: null })
  const toastMsg = useToastMsg()

  const go = (id, extra = {}) => setRoute(r => ({ id, prev: r.id, ...extra }))

  const loggedIn = !!session
  const showNav = loggedIn && APP_SCREENS.includes(route.id)
  const activeTab = NAV_TAB[route.id]

  const screens = {
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

  // deslogado → tela de login/onboarding DENTRO da moldura mobile (como antes)
  const key = loading ? 'loading' : loggedIn ? route.id : 'intro'
  const content = loading ? null : loggedIn ? (screens[route.id] || <Home go={go} />) : <Intro onAdmin={onAdmin} />

  return (
    <div className="stage">
      <div className="device">
        <div className="notch" />
        <div className="statusbar">
          <span>9:41</span>
          <span className="r"><Signal size={15} /><Wifi size={15} /><BatteryFull size={17} /></span>
        </div>

        <div className="viewport">
          <motion.div
            key={key}
            className="screen"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {content}
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
  const [admin, setAdmin] = useState(() =>
    new URLSearchParams(window.location.search).has('admin')
  )
  return (
    <AuthProvider>
      <StoreProvider>
        {admin
          ? <Admin onExit={() => setAdmin(false)} />
          : <Shell onAdmin={() => setAdmin(true)} />}
      </StoreProvider>
    </AuthProvider>
  )
}
