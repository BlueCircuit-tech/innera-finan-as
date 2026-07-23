import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { fmt0 } from '../store.jsx'

/* animated number — rAF ease-out counter, with a timeout fallback so the
   final value always lands even if rAF is paused (hidden/background tab) */
export function CountUp({ value, format = fmt0, dur = 1100 }) {
  const [n, setN] = useState(value)
  useEffect(() => {
    let raf, done = false, start = null
    const finish = () => { if (!done) { done = true; setN(value) } }
    const tick = t => {
      if (start === null) start = t
      const p = Math.min(1, (t - start) / dur)
      setN(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
      else finish()
    }
    setN(0)
    raf = requestAnimationFrame(tick)
    const fallback = setTimeout(finish, dur + 400)
    return () => { cancelAnimationFrame(raf); clearTimeout(fallback) }
  }, [value, dur])
  return <span>{format(n)}</span>
}

/* top bar */
export function TopBar({ title, onBack, right }) {
  return (
    <div className="topbar">
      {onBack && (
        <button className="iconbtn" onClick={onBack} aria-label="Voltar">
          <ChevronLeft size={20} />
        </button>
      )}
      <h2>{title}</h2>
      {right}
    </div>
  )
}

/* meter */
export function Meter({ pct, over, leaf }) {
  return (
    <div className={'meter' + (leaf ? ' leaf' : '')}>
      <motion.i
        className={over ? 'over' : ''}
        initial={{ width: 0 }}
        animate={{ width: Math.min(100, pct) + '%' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'block', height: '100%' }}
      />
    </div>
  )
}

/* progress ring */
export function Ring({ pct, size = 46, stroke = 4 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(236,232,214,.12)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gold)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (pct / 100) * c }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

/* bottom sheet — conditional render (enter-only; unmounts instantly on close) */
export function Sheet({ open, onClose, children }) {
  if (!open) return null
  return (
    <>
      <motion.div className="veil" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} />
      <motion.div className="sheet"
        initial={{ y: '100%' }} animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
        <div className="grab" />
        {children}
      </motion.div>
    </>
  )
}

/* toast — conditional render (unmounts instantly when message clears) */
export function Toast({ data }) {
  if (!data) return null
  return (
    <motion.div className="toast" key={data.id}
      initial={{ opacity: 0, y: 16, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 340 }}>
      {data.msg}
    </motion.div>
  )
}

/* staggered list container helpers */
export const listV = { show: { transition: { staggerChildren: 0.05 } } }
export const itemV = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}
