import { useState, useEffect } from 'react'

/* Formata número -> "1.234,56" (pt-BR, sempre 2 casas) */
const fmtStr = n =>
  (n === null || n === undefined || n === '' || isNaN(n))
    ? ''
    : Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* Converte a string exibida de volta para número */
const parseStr = s => {
  const digits = String(s || '').replace(/\D/g, '')
  return digits ? parseInt(digits, 10) / 100 : 0
}

/**
 * Campo de dinheiro com máscara de centavos.
 * Cada dígito entra pela direita e o campo sempre mostra o valor formatado
 * em pt-BR (ex.: 1.234,56) — sem ambiguidade de ponto/vírgula.
 *
 * props: value (número), onChange(número), placeholder, autoFocus, big, id
 */
export default function MoneyInput({ value, onChange, placeholder = '0,00', autoFocus, big, id }) {
  const [str, setStr] = useState(() => (value ? fmtStr(value) : ''))

  // Reflete mudanças externas do valor (ex.: reset após salvar) sem criar loop:
  // só reescreve quando o número de fora difere do que está no campo.
  useEffect(() => {
    if (parseStr(str) !== (Number(value) || 0)) setStr(value ? fmtStr(value) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handle = e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 12)
    const num = digits ? parseInt(digits, 10) / 100 : 0
    setStr(digits ? num.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '')
    onChange(num)
  }

  return (
    <div className={'moneyinput' + (big ? ' big' : '')}>
      <span className="cur">R$</span>
      <input
        id={id}
        value={str}
        onChange={handle}
        inputMode="numeric"
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
      />
    </div>
  )
}
