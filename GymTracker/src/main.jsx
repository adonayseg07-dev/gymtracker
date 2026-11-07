import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
createRoot(document.getElementById('root')).render(<App />)

// El service worker solo se activa en la versión compilada (npm run build), no en npm run dev.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(reg => {
        const urls = performance.getEntriesByType('resource').map(r => r.name).filter(n => n.startsWith(location.origin))
        reg.active && reg.active.postMessage({ cache: urls })
      }).catch(() => {})
  })
}
