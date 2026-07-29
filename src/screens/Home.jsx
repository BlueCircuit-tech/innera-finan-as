import { motion } from 'framer-motion'
import { Bell, Sparkles, ArrowRight, ArrowUpRight, LogOut } from 'lucide-react'
import { useStore, useToast, fmt, fmt0 } from '../store.jsx'
import { useAuth } from '../auth.jsx'
import { CountUp, Meter } from '../components/ui.jsx'
import LotCard from '../components/LotCard.jsx'

export default function Home({ go }) {
  const { state } = useStore()
  const toast = useToast()
  const { signOut } = useAuth()
  const orcado = state.cats.reduce((a, c) => a + c.plan, 0)
  const gasto = state.cats.reduce((a, c) => a + c.gasto, 0)
  const disp = Math.max(0, orcado - gasto)
  const sobra = state.sobras.length ? state.sobras[state.sobras.length - 1][1] : 0

  return (
    <div className="pb">
      <div className="home-hero">
        <div className="home-top">
          <div className="avatar">
            {state.user.avatar_url
              ? <img src={state.user.avatar_url} alt={state.user.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              : (state.user.avatar_emoji || '👩🏻')}
          </div>
          <div className="grow">
            <span>Bom dia,</span>
            <b>{state.user.nome}</b>
          </div>
          <button className="hero-icon" onClick={() => toast('Central de notificações em breve')}>
            <Bell size={18} /><i className="badge" />
          </button>
          <button className="hero-icon" onClick={signOut} aria-label="Sair">
            <LogOut size={18} />
          </button>
        </div>

        <div className="saldo">
          <div className="k">Saldo atual</div>
          <div className="v num"><CountUp value={state.saldo} format={fmt} /></div>
          <div className="d">Julho de 2026 · conta principal</div>
        </div>

        <div className="hero-pills">
          {[['Orçado', orcado], ['Já gasto', gasto], ['Disponível', disp]].map(([k, v]) => (
            <div className="hpill" key={k}>
              <div className="k">{k}</div>
              <div className="v num">{fmt0(v)}</div>
            </div>
          ))}
        </div>
      </div>

      <motion.button className="sobra-card" onClick={() => go('sobra')}
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="sc-ico"><Sparkles size={20} /></div>
        <div className="grow" style={{ textAlign: 'left' }}>
          <b className="num">{fmt0(sobra)}</b>
          <span>Sua reserva deste mês, pronta para investir</span>
        </div>
        <span className="sc-go">Investir <ArrowRight size={15} /></span>
      </motion.button>

      <div className="pad">
        <div className="sectiontitle">
          <h3>Orçamento por categoria</h3>
          <button className="link" onClick={() => go('budget')}>Ajustar <ArrowUpRight size={14} /></button>
        </div>
        <div className="card" style={{ padding: '8px 18px' }}>
          {state.cats.length === 0 && <div className="home-empty">Crie categorias no seu orçamento para acompanhar aqui.</div>}
          {state.cats.slice(0, 5).map(c => {
            const pct = c.plan > 0 ? Math.round((c.gasto / c.plan) * 100) : (c.gasto > 0 ? 100 : 0)
            const over = c.gasto > c.plan && c.plan > 0
            return (
              <div className="catrow" key={c.id}>
                <div className="tile">{c.ico}</div>
                <div className="grow">
                  <div className="catrow-t">
                    <span>{c.nome}</span>
                    <span className="muted num">{fmt0(c.gasto)} / {fmt0(c.plan)}</span>
                  </div>
                  <Meter pct={pct} over={over} />
                </div>
                {over && <span className="pill crit num">+{fmt0(c.gasto - c.plan)}</span>}
              </div>
            )
          })}
        </div>

        <div className="sectiontitle">
          <h3>Últimas transações</h3>
          <button className="link" onClick={() => go('add')}>Registrar <ArrowUpRight size={14} /></button>
        </div>
        <div className="card" style={{ padding: '8px 18px' }}>
          {state.txs.length === 0 && <div className="home-empty">Nenhuma transação ainda. Toque no + para registrar.</div>}
          {state.txs.slice(0, 4).map((t, i) => {
            const c = state.cats.find(x => x.id === t.cat)
            return (
              <div className="txrow" key={i}>
                <div className="tile">{t.tipo === 'in' ? '💵' : c ? c.ico : '🧾'}</div>
                <div className="grow">
                  <b>{t.desc}</b>
                  <span className="muted">{t.data} · {c ? c.nome : 'Receita'}</span>
                </div>
                <span className={'txval num' + (t.tipo === 'in' ? ' in' : '')}>
                  {t.tipo === 'in' ? '+' : '−'} {fmt(t.val)}
                </span>
              </div>
            )
          })}
        </div>

        <div className="sectiontitle">
          <h3>Leilões em destaque</h3>
          <button className="link" onClick={() => go('auctions')}>Explorar <ArrowUpRight size={14} /></button>
        </div>
        {state.lots.slice(0, 2).map((l, i) => (
          <LotCard key={l.id} lot={l} compact index={i} onOpen={id => go('lot', { lotId: id })} />
        ))}
      </div>
    </div>
  )
}
