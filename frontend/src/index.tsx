import { render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { LocationProvider, Router, Route } from 'preact-iso'

import { Home } from './pages/Home/index.jsx'
import { NotFound } from './pages/_404.jsx'

import './style.css'

import ProcchiIcon from './assets/procchi_icon.png'
import { ThemeSwitch } from './components/ThemeSwitch.js'
import { AlertList } from './components/alert/AlertList.js'
import { ProcchiAlert } from './components/alert/Alert.js'

export function App() {
  const [alerts, setAlerts] = useState<string[]>([])

  useEffect(() => {
    // Watch for alert events
    window.addEventListener('procchi-alert', (e: CustomEvent) => {
      setAlerts((alerts) => [
        // If there are more than 6 alerts, start removing the oldest ones
        ...alerts.slice(alerts.length > 5 ? 1 : 0),
        e.detail
      ])

      // Remove the alert after 4 seconds
      setTimeout(() => {
        setAlerts((alerts) => alerts.filter(a => a !== e.detail))
      }, 6000)
    })

    ;(async () => {
      // Get version and alert it
      const res = await fetch('/api/version_info')
      const data = await res.json()
      window.dispatchEvent(ProcchiAlert(`${data.name} v${data.version} by ${data.author}`))

      // Also check for updates
      const updateRes = await fetch('https://api.github.com/repos/SpikeHD/procchi/releases/latest')
      const updateData = await updateRes.json()

      if (updateData.tag_name !== `v${data.version}`) {
        window.dispatchEvent(ProcchiAlert(`A new version of Procchi (${updateData.tag_name}) is available!`))
      }
    })()
  }, [])

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
