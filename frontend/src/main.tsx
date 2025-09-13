import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Service Worker nur in Production registrieren, um Dev-404/Cache-Probleme zu vermeiden
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
      })
      .catch((registrationError) => {
      })
  })
}

createRoot(document.getElementById('root')!).render(
  // <StrictMode> - Temporär deaktiviert wegen Input-Lag Problem
    <App />
  // </StrictMode>
)
