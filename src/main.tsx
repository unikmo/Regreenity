import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MarketingSite from './MarketingSite'
import './styles.css'
import './marketing.css'
import { registerOfflineShell } from './offline'

registerOfflineShell()

const path = window.location.pathname
const useLegacyProductShell = path.startsWith('/product-app/')
const useLegacyLegalShell = ['/imprint/', '/privacy/', '/terms/', '/cookies/'].some((route) => path.startsWith(route))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {useLegacyProductShell || useLegacyLegalShell ? <App /> : <MarketingSite />}
  </React.StrictMode>,
)
