import { render } from 'preact'
import { LocationProvider, Router, Route } from 'preact-iso'

import { Home } from './pages/Home/index.jsx'
import { NotFound } from './pages/_404.jsx'
import './style.css'
import { useEffect, useState } from 'preact/hooks'

export function App() {
  const [memoryData, setMemoryData] = useState([])
  const [swapData, setSwapData] = useState([])
  const [cpuData, setCpuData] = useState([])
  
  // TODO: Unused for now
  //const [diskData, setDiskData] = useState([])

  useEffect(() => {
    async function grabLatestData() {
      const mres = await fetch('/api/memory')
      const mdata = await mres.json()
      setMemoryData(mdata)

      const sres = await fetch('/api/swap')
      const sdata = await sres.json()
      setSwapData(sdata)

      const cres = await fetch('/api/cpu')
      const cdata = await cres.json()
      setCpuData(cdata)
    }
    
    setInterval(grabLatestData, 5000)
  }, [])

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
