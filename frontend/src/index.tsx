import { render } from 'preact'
import { LocationProvider, Router, Route } from 'preact-iso'

import { Home } from './pages/Home/index.jsx'
import { NotFound } from './pages/_404.jsx'
import './style.css'

export function App() {
  return (
    <div id="root">
      <div id="header">
        <img src="https://placeholder.com/200x200" className="icon" />
        <span className="title">
          Procchi
        </span>
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
