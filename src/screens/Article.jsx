import { ArrowLeft } from 'lucide-react'
import { useStore } from '../store.jsx'
import { TopBar } from '../components/ui.jsx'

export default function Article({ go, route }) {
  const { state } = useStore()
  const a = (state.articles || [])[route.articleIdx ?? 0]
  if (!a) return null
  return (
    <div className="pb">
      <TopBar title="Conteúdo" onBack={() => go('learn')} />
      <div className="artbody pad" dangerouslySetInnerHTML={{ __html: a.corpo }} />
      <div className="pad">
        <button className="btn soft" onClick={() => go('learn')}><ArrowLeft size={16} /> Voltar para Aprender</button>
      </div>
    </div>
  )
}
