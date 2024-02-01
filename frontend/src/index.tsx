import { render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { LocationProvider, Router, Route } from 'preact-iso'

import { Home } from './pages/Home/index.jsx'
import { NotFound } from './pages/_404.jsx'

import './style.css'

import ProcchiIcon from './assets/procchi_icon.png'
import { ThemeSwitch } from './components/ThemeSwitch.js'
import { AlertList } from './components/alert/AlertList.js'

export function App() {
  const [alerts, setAlerts] = useState<string[]>([])

  useEffect(() => {
    // Watch for alert events
    window.addEventListener('procchi-alert', (e: CustomEvent) => {
      setAlerts([...alerts, e.detail])

      // Remove the alert after 5 seconds
      setTimeout(() => {
        setAlerts((alerts) => alerts.filter(a => a !== e.detail))
      }, 5000)
    })
  })

  return (
    <div id="root">
      <div id="header">
        <div className="header-title">
          <img src={ProcchiIcon} className="icon" />
          <span className="title">
            Procchi
          </span>
        </div>
        <div className="header-controls">
          <ThemeSwitch />
        </div>
      </div>

      <LocationProvider>
        <main>
          <Router>
            <Route path="/" component={Home} />
            <Route default component={NotFound} />
          </Router>
        </main>
      </LocationProvider>

      {
        alerts && (
          <AlertList alerts={alerts} />
        )
      }
    </div>
  )
}

render(<App />, document.getElementById('app'))
