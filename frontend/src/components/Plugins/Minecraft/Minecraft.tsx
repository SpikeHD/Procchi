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
    description: '',
    players: 0,
    version: '',
    latency: 0,
    address: ''
  } as McData)

  useEffect(() => {
    const intv = setInterval(async () => {
      const data = await fetch('/api/minecraft').then((res) => res.json())
      setData(data)
    }, 5000)

    return () => clearInterval(intv)
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