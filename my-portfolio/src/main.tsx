import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.scss'
// That's it!
import App from './components/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
