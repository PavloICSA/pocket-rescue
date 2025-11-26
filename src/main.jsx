import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for PWA offline caching
// Requirements: 9.1, 9.2 - Service worker caches static assets and serves them offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration)
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  })
}
