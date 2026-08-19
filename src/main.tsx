import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Landing from './Landing.tsx'

/** Rota simples, sem router: /app é a demo do palco, o resto é a landing. */
const noApp = window.location.pathname.replace(/\/+$/, '') === '/app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>{noApp ? <App /> : <Landing />}</StrictMode>,
)
