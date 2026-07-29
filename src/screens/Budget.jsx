import { useState } from 'react'
import { Plus, Minus, Flower2, Pencil } from 'lucide-react'
import { useStore, useToast, fmt0 } from '../store.jsx'
import { TopBar, Sheet } from '../components/ui.jsx'
import MoneyInput from '../components/MoneyInput.jsx'

export default function Budget({ go }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [sheet, setSheet] = useState(false)        // nova categoria
  const [name, setName] = useState('')
  const [val, setVal] = useState(0)
  const [rendaSheet, setRendaSheet] = useState(false)
  const [renda, setRenda] = useState(0)
  const [planEdit, setPlanEdit] = useState(null)   // { id, nome } | null
  const [planVal, setPlanVal] = useState(0)

  const aloc = state.cats.reduce((a, c) => a + c.plan, 0)
  const livre = state.renda - aloc

  const addCat = () => {
    if (!name.trim()) { toast('Dê um nome para a categoria'); return }
    dispatch({ type: 'ADD_CAT', id: crypto.randomUUID(), nome: name.trim(), val: Number(val) || 0 })
    setName(''); setVal(0); setSheet(false); toast(`Categoria "${name.trim()}" criada ✓`)
  }

  const openRenda = () => { setRenda(state.renda); setRendaSheet(true) }
  const saveRenda = () => { dispatch({ type: 'SET_RENDA', val: Number(renda) || 0 }); setRendaSheet(false); toast('Renda do mês atualizada ✓') }

  const openPlan = c => { setPlanEdit(c); setPlanVal(c.plan) }
  const savePlan = () => { dispatch({ type: 'SET_CAT_PLAN', id: planEdit.id, val: Number(planVal) || 0 }); setPlanEdit(null); toast(`"${planEdit.nome}" atualizado ✓`) }

  return (
    <div className="pb">
      <TopBar title="Meu orçamento" onBack={() => go('home')}
        right={<button className="iconbtn" onClick={() => setSheet(true)}><Plus size={18} /></button>} />
      <div className="pad">
        <div className="budget-sum">
          <button className="bcell as-btn" onClick={openRenda}>
            <div className="k">Renda do mês <Pencil size={11} /></div>
            <div className="v num">{fmt0(state.renda)}</div>
          </button>
          {[['Alocado', aloc, ''], ['A alocar', livre, livre < 0 ? 'crit' : livre === 0 ? 'leaf' : 'gold']].map(([k, v, tone]) => (
            <div className="bcell" key={k}>
              <div className="k">{k}</div>
              <div className={'v num ' + (tone === 'crit' ? 'critc' : tone === 'leaf' ? 'leafc' : tone === 'gold' ? 'goldc' : '')}>{fmt0(v)}</div>
            </div>
          ))}
        </div>

        {state.cats.length === 0 ? (
          <div className="empty"><Flower2 size={38} className="muted" /><b className="serif">Seu orçamento está pronto para começar</b><p>Toque em + para criar sua primeira categoria.</p></div>
        ) : (
          <div className="card" style={{ padding: '6px 18px' }}>
            {state.cats.map((c, i) => (
              <div className="alloc" key={c.id}>
                <div className="tile">{c.ico}</div>
                <div className="grow">
                  <b>{c.nome}</b>
                  <span className="muted">gasto até agora: {fmt0(c.gasto)}</span>
                </div>
                <div className="stepper">
                  <button onClick={() => dispatch({ type: 'BUMP_CAT', i, delta: -50 })} aria-label="Diminuir"><Minus size={15} /></button>
                  <button className="sv num as-btn" onClick={() => openPlan(c)} title="Editar valor">{fmt0(c.plan)}</button>
                  <button onClick={() => dispatch({ type: 'BUMP_CAT', i, delta: 50 })} aria-label="Aumentar"><Plus size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="principio">
          <Flower2 size={19} className="goldc" />
          <span><b>Princípio Innera:</b> dê um trabalho para cada real. Quando todo o dinheiro tem destino — inclusive a reserva — fica espaço para sonhar sem culpa.</span>
        </div>

        <button className="btn" style={{ marginTop: 16 }} onClick={() => toast('Orçamento salvo ✓')}>Salvar orçamento</button>
      </div>

      {/* nova categoria */}
      <Sheet open={sheet} onClose={() => setSheet(false)}>
        <h3 className="serif sheet-title">Nova categoria</h3>
        <p className="sheet-sub">Crie uma categoria personalizada para o seu orçamento.</p>
        <div className="field"><label>Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Pets, Estudos, Presentes…" /></div>
        <div className="field"><label>Valor planejado</label>
          <MoneyInput value={val} onChange={setVal} /></div>
        <button className="btn" onClick={addCat}>Adicionar categoria</button>
      </Sheet>

      {/* editar renda */}
      <Sheet open={rendaSheet} onClose={() => setRendaSheet(false)}>
        <h3 className="serif sheet-title">Renda do mês</h3>
        <p className="sheet-sub">Quanto você recebe por mês. É a base para distribuir seu orçamento.</p>
        <div className="field"><label>Valor</label>
          <MoneyInput value={renda} onChange={setRenda} autoFocus /></div>
        <button className="btn" onClick={saveRenda}>Salvar renda</button>
      </Sheet>

      {/* editar planejado da categoria */}
      <Sheet open={!!planEdit} onClose={() => setPlanEdit(null)}>
        <h3 className="serif sheet-title">{planEdit?.nome}</h3>
        <p className="sheet-sub">Quanto você quer destinar para esta categoria neste mês.</p>
        <div className="field"><label>Valor planejado</label>
          <MoneyInput value={planVal} onChange={setPlanVal} autoFocus /></div>
        <button className="btn" onClick={savePlan}>Salvar valor</button>
      </Sheet>
    </div>
  )
}
