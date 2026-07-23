import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useStore, useToast } from '../store.jsx'
import { TopBar } from '../components/ui.jsx'

const receitas = [
  { id: 'renda', nome: 'Salário', ico: '💼' }, { id: 'renda', nome: 'Freela', ico: '🎨' },
  { id: 'renda', nome: 'Presente', ico: '🎁' }, { id: 'renda', nome: 'Outros', ico: '✨' },
]

export default function AddTx({ go, route }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [tipo, setTipo] = useState('out')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState('2026-07-16')

  const cats = tipo === 'in'
    ? receitas
    : state.cats.filter(c => c.em_transacoes !== false && c.id !== 'poupanca' && c.id !== 'leiloes')
  const [cat, setCat] = useState('alimento')
  const [inSel, setInSel] = useState('Salário')

  const save = () => {
    const val = parseFloat((amount || '').replace(/\./g, '').replace(',', '.'))
    if (!val || val <= 0) { toast('Informe um valor válido'); return }
    dispatch({ type: 'ADD_TX', tipo, val, cat, desc: desc.trim() || (tipo === 'in' ? inSel : 'Despesa') })
    toast(tipo === 'in' ? 'Receita registrada ✓ Que venha mais!' : 'Despesa registrada ✓')
    go('home')
  }

  return (
    <div className="pb">
      <TopBar title="Nova transação" onBack={() => go(route.prev && route.prev !== 'add' ? route.prev : 'home')} />
      <div className="pad">
        <div className="typetoggle">
          <button className={tipo === 'out' ? 'on out' : ''} onClick={() => setTipo('out')}><Minus size={15} /> Despesa</button>
          <button className={tipo === 'in' ? 'on in' : ''} onClick={() => setTipo('in')}><Plus size={15} /> Receita</button>
        </div>

        <div className="card">
          <div className="amount">
            <span className="cur">R$</span>
            <input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" autoComplete="off" />
          </div>

          <div className="label">Categoria</div>
          <div className="catgrid">
            {cats.map((c, i) => {
              const on = tipo === 'in' ? inSel === c.nome : cat === c.id
              return (
                <button key={c.nome + i} className={'catpick' + (on ? ' on' : '')}
                  onClick={() => (tipo === 'in' ? setInSel(c.nome) : setCat(c.id))}>
                  <i>{c.ico}</i>{c.nome.split(' ')[0]}
                </button>
              )
            })}
          </div>

          <div className="field" style={{ marginTop: 16 }}><label>Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div className="field"><label>Descrição (opcional)</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex.: mercado da semana" /></div>
        </div>

        <button className={'btn' + (tipo === 'in' ? ' leaf' : '')} style={{ marginTop: 16 }} onClick={save}>
          Registrar {tipo === 'in' ? 'receita' : 'despesa'}
        </button>
      </div>
    </div>
  )
}
