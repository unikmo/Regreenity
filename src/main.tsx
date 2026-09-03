import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerOfflineShell } from './offline'

registerOfflineShell()

const path = window.location.pathname
const useLegacyProductShell = path.startsWith('/product-app/')
const useLegacyLegalShell = ['/imprint/', '/privacy/', '/terms/', '/cookies/'].some((route) => path.startsWith(route))
const usePortal = path.startsWith('/portal/')
const useSandbox = path.startsWith('/sandbox/')
const useResort = path.startsWith('/all-inclusive-resorts/')

const loadRoute = async () => {
  if (useSandbox) return Promise.all([import('./Sandbox'), import('./sandbox.css')]).then(([module]) => module.default)
  if (usePortal) return import('./Portal').then(module => module.default)
  if (useLegacyProductShell) return Promise.all([import('./ExecutiveWalkthrough'), import('./executive-walkthrough.css')]).then(([module]) => module.default)
  if (useLegacyLegalShell) return Promise.all([import('./App'), import('./styles.css')]).then(([module]) => module.default)
  if (useResort) return Promise.all([import('./ResortSite'), import('./marketing.css'), import('./resort.css')]).then(([module]) => module.default)
  return Promise.all([import('./MarketingSite'), import('./marketing.css')]).then(([module]) => module.default)
}

const Route = await loadRoute()
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Route /></React.StrictMode>)

if (!useLegacyProductShell && !useLegacyLegalShell && !usePortal && !useSandbox) {
  requestAnimationFrame(() => {
    const footer = document.querySelector<HTMLElement>('.footer-links')
    if (!footer || footer.querySelector('a[href="/all-inclusive-resorts/"]')) return
    const link = document.createElement('a')
    link.href = '/all-inclusive-resorts/'
    link.textContent = 'All-Inclusive Hotels & Resorts'
    link.dataset.resortPreview = 'true'
    footer.prepend(link)
  })
}
