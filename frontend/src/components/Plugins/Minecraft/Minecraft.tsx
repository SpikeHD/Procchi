import { useEffect, useState } from 'preact/hooks'
import { StatRow } from '../../Stats/StatRow'
import { Stat } from '../../Stats/Stat'

import './Minecraft.css'

interface McData {
  description: string
  players: number
  version: string
  latency: number
  address: string
}

export function Minecraft() {
  const [data, setData] = useState({
    
  } as McData)

  useEffect(() => {
    (async () => {
      const data = await fetch('/api/minecraft').then((res) => res.json())
      setData(data)
    })()
  }, [])

  return (
    <StatRow header={`Minecraft Server (${data.address})`}>
      <Stat
        big={data.players.toString()}
        small="Players Online"
      />

      <Stat
        big={data.version}
        small="Version"
      />

      <Stat
        big={data.latency + 'ms'}
        small="Latency"
      />

      <Stat
        big={data.description}
        small="Description"
      />
    </StatRow>
  )
}