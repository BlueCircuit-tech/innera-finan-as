import { useState } from 'react'

/* Mostra a imagem (src) cobrindo o container; se não houver src OU falhar o
   carregamento, cai no emoji. Enquanto o upload não acontece, aparece o emoji. */
export default function Thumb({ src, emoji, alt = '', cover = true, emojiClass = '' }) {
  const [err, setErr] = useState(false)
  if (src && !err) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setErr(true)}
        style={{ width: '100%', height: '100%', objectFit: cover ? 'cover' : 'contain', display: 'block' }}
      />
    )
  }
  return <span className={emojiClass}>{emoji}</span>
}
