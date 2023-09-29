import { useEffect, useState } from 'preact/hooks'
import './Minecraft.css'

interface McData {
  description: string
  players: number
  version: string
  latency: number
  address: string
}

export function Minecraft() {
  const [data, setData] = useState({} as McData)

  useEffect(() => {
    (async () => {
      const data = await fetch('/api/minecraft').then((res) => res.json())
      setData(data)
    })()
  }, [])

  return (
    <div className="quick-stats-outer">
      <div className="quick-stats-header">
        <span className="quick-stats-title">Minecraft Server ({data.address})</span>
      </div>

      <div className="quick-stats">
        <div className="stat">
          <span className="stat-big">{data.players}</span>
          <span className="stat-small">Players Online</span>
        </div>

        <div className="stat">
          <span className="stat-big">{data.version}</span>
          <span className="stat-small">Version</span>
        </div>

        <div className="stat">
          <span className="stat-big">{data.latency}ms</span>
          <span className="stat-small">Latency</span>
        </div>
      </div>
    </div>
  )
}