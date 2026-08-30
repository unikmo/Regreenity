import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MarketingSite from './MarketingSite'
import ExecutiveWalkthrough from './ExecutiveWalkthrough'
import Portal from './Portal'
import './styles.css'
import './marketing.css'
import './executive-walkthrough.css'
import { registerOfflineShell } from './offline'

registerOfflineShell()

const path = window.location.pathname
const useLegacyProductShell = path.startsWith('/product-app/')
const useLegacyLegalShell = ['/imprint/', '/privacy/', '/terms/', '/cookies/'].some((route) => path.startsWith(route))
const usePortal = path.startsWith('/portal/')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {usePortal ? <Portal /> : useLegacyProductShell ? <ExecutiveWalkthrough /> : useLegacyLegalShell ? <App /> : <MarketingSite />}
  </React.StrictMode>,
)
