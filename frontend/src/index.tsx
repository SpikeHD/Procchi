import { render } from 'preact'
import { LocationProvider, Router, Route } from 'preact-iso'

import { Home } from './pages/Home/index.jsx'
import { NotFound } from './pages/_404.jsx'

import './style.css'

import ProcchiIcon from './assets/procchi_icon.png'
import { ThemeSwitch } from './components/ThemeSwitch.js'

export function App() {
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
    </div>
  )
}

render(<App />, document.getElementById('app'))
