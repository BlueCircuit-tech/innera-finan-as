import { useState } from 'react'
import { Plus, Minus, Flower2 } from 'lucide-react'
import { useStore, useToast, fmt0 } from '../store.jsx'
import { TopBar, Sheet } from '../components/ui.jsx'

export default function Budget({ go }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [sheet, setSheet] = useState(false)
  const [name, setName] = useState('')
  const [val, setVal] = useState('')

  const aloc = state.cats.reduce((a, c) => a + c.plan, 0)
  const livre = state.renda - aloc

  const addCat = () => {
    if (!name.trim()) { toast('Dê um nome para a categoria'); return }
    dispatch({ type: 'ADD_CAT', id: crypto.randomUUID(), nome: name.trim(), val: parseFloat((val || '0').replace(',', '.')) || 0 })
    setName(''); setVal(''); setSheet(false); toast(`Categoria "${name.trim()}" criada ✓`)
  }

  return (
    <div className="pb">
      <TopBar title="Meu orçamento" onBack={() => go('home')}
        right={<button className="iconbtn" onClick={() => setSheet(true)}><Plus size={18} /></button>} />
      <div className="pad">
        <div className="budget-sum">
          {[['Renda do mês', state.renda, ''], ['Alocado', aloc, ''],
            ['A alocar', livre, livre < 0 ? 'crit' : livre === 0 ? 'leaf' : 'gold']].map(([k, v, tone]) => (
            <div className="bcell" key={k}>
              <div className="k">{k}</div>
              <div className={'v num ' + (tone === 'crit' ? 'critc' : tone === 'leaf' ? 'leafc' : tone === 'gold' ? 'goldc' : '')}>{fmt0(v)}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '6px 18px' }}>
          {state.cats.map((c, i) => (
            <div className="alloc" key={c.id}>
              <div className="tile">{c.ico}</div>
              <div className="grow">
                <b>{c.nome}</b>
                <span className="muted">gasto até agora: {fmt0(c.gasto)}</span>
              </div>
              <div className="stepper">
                <button onClick={() => dispatch({ type: 'BUMP_CAT', i, delta: -50 })}><Minus size={15} /></button>
                <span className="sv num">{fmt0(c.plan)}</span>
                <button onClick={() => dispatch({ type: 'BUMP_CAT', i, delta: 50 })}><Plus size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="principio">
          <Flower2 size={19} className="goldc" />
          <span><b>Princípio Innera:</b> dê um trabalho para cada real. Quando todo o dinheiro tem destino — inclusive a reserva — fica espaço para sonhar sem culpa.</span>
        </div>

        <button className="btn" style={{ marginTop: 16 }} onClick={() => toast('Orçamento de julho salvo ✓')}>Salvar orçamento</button>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)}>
        <h3 className="serif sheet-title">Nova categoria</h3>
        <p className="sheet-sub">Crie uma categoria personalizada para o seu orçamento.</p>
        <div className="field"><label>Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Pets, Estudos, Presentes…" /></div>
        <div className="field"><label>Valor planejado (R$)</label>
          <input value={val} onChange={e => setVal(e.target.value)} inputMode="numeric" placeholder="0" /></div>
        <button className="btn" onClick={addCat}>Adicionar categoria</button>
      </Sheet>
    </div>
  )
}
