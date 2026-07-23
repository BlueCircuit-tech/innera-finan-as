import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './screens.css'

// StrictMode intentionally omitted: its double-invoked effects (dev only) break
// framer-motion's AnimatePresence exit-completion callbacks, leaving stale screens.
createRoot(document.getElementById('root')).render(<App />)
