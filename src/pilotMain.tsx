import React from 'react'
import ReactDOM from 'react-dom/client'
import PilotSimulator from './PilotSimulator'
import './pilot-v13.css'
import { registerOfflineShell } from './offline'

registerOfflineShell()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PilotSimulator />
  </React.StrictMode>,
)
