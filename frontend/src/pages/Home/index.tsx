import { useEffect, useState } from 'preact/hooks'
import { Loader } from '../../components/Loader'
import { QuickStats } from '../../components/QuickStats'
import './style.css'
import { randomRGBAColors } from '../../util/colors'
import { DataHome } from './data'

export function Home() {
  const [sysinfo, setSysinfo] = useState({} as SystemInfo)
  const [memoryData, setMemoryData] = useState([] as Memory[])
  const [swapData, setSwapData] = useState([] as Memory[])
  const [cpuData, setCpuData] = useState([] as CPU[])
  const [diskData, setDiskData] = useState([] as Disk[])
  const [networkData, setNetworkData] = useState([] as Network[])
  const [processList, setProcessList] = useState([] as Process[])
  const [diskColors, setDiskColors] = useState([] as { color: string, backgroundColor: string }[])
  const [networkColors, setNetworkColors] = useState([] as { color: string, backgroundColor: string }[])

  useEffect(() => {
    async function grabLatestData(firstTime = false) {
      const mres = await fetch('/api/memory')
      const mdata = await mres.json()
      setMemoryData(mdata)

      const sres = await fetch('/api/swap')
      const sdata = await sres.json()
      setSwapData(sdata)

      const cres = await fetch('/api/cpu')
      const cdata = await cres.json()
      setCpuData(cdata)

      const dres = await fetch('/api/disk')
      const ddata = await dres.json()
      setDiskData(ddata)

      if (firstTime) {
        // Also create colors
        setDiskColors(Object.keys(ddata).map(() => {
          return randomRGBAColors()
        }))

        setNetworkColors(Object.keys(ddata).map(() => {
          return randomRGBAColors()
        }))
      }

      const nres = await fetch('/api/network')
      const ndata = await nres.json()
      setNetworkData(ndata)

      const pres = await fetch('/api/processes')
      const pdata = await pres.json()
      setProcessList(pdata)
    }

    // This only needs to run once
    (async () => {
      await grabLatestData(true)

      const res = await fetch('/api/sysinfo')
      const data = await res.json()
      setSysinfo(data)
    })()
    
    setInterval(grabLatestData, 5000)
  }, [])

  return (
    <div className="home-root">
      {
        sysinfo?.os_name ? (
          <>
            <QuickStats
              sysinfo={sysinfo}
              memoryData={memoryData}
              swapData={swapData}
              cpuData={cpuData}
              diskData={diskData}
              networkData={networkData}
              processList={processList}
            />

            <div className="home-main">
              <DataHome
                sysinfo={sysinfo}
                memoryData={memoryData}
                swapData={swapData}
                cpuData={cpuData}
                diskData={diskData}
                networkData={networkData}
                processList={processList}
                diskColors={diskColors}
                networkColors={networkColors}
              />
            </div>
          </>
        ) : (
          <div className="loading">
            <Loader />
          </div>
        )
      }
    </div>
  )
}