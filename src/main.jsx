import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Aplica el tema guardado antes del primer pintado para evitar un parpadeo
// claro->oscuro en quien eligió modo oscuro.
try {
  const raw = localStorage.getItem('rachas:data')
  const theme = raw ? JSON.parse(raw)?.settings?.theme : null
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
} catch {
  // si falla, se queda con el tema claro por defecto
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
