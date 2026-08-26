import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MarketingSite from './MarketingSite'
import './styles.css'
import './marketing.css'
import { registerOfflineShell } from './offline'

registerOfflineShell()

const useLegacyProductShell = window.location.pathname.startsWith('/product-app/')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {useLegacyProductShell ? <App /> : <MarketingSite />}
  </React.StrictMode>,
)
