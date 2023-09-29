import { useEffect, useState } from 'preact/hooks'
import { Minecraft } from './Minecraft/Minecraft'

import './PluginsSection.css'

interface Plugin {
  name: string
  endpoints: string[]
}

export default function PluginsSection() {
  const [enabled, setEnabled] = useState([] as Plugin[])

  useEffect(() => {
    (async () => {
      const enabled = await fetch('/api/plugins').then((res) => res.json())
      setEnabled(enabled)
    })()
  }, [])

  if (enabled.length === 0) return (
    <></>
  )

  return (
    <div className="plugin-section">
      {
        enabled.map((plugin) => {
          switch (plugin.name) {
          case 'minecraft':
            return <Minecraft />
          }
        })
      }
    </div>
  )
}