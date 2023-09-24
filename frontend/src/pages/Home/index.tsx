import { useEffect, useState } from 'preact/hooks'
import { Loader } from '../../components/Loader'
import { QuickStats } from '../../components/QuickStats'
import './style.css'

export function Home() {
  const [sysinfo, setSysinfo] = useState({} as SystemInfo)
  const [memoryData, setMemoryData] = useState([] as Memory[])
  const [swapData, setSwapData] = useState([] as Memory[])
  const [cpuData, setCpuData] = useState([] as CPU[])
  const [processList, setProcessList] = useState([] as Process[])
  
  // TODO: Unused for now
  // const [diskData, setDiskData] = useState([])

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

      const pres = await fetch('/api/processes')
      const pdata = await pres.json()
      setProcessList(pdata)
    }

    // This only needs to run once
    (async () => {
      await grabLatestData()

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
              processList={processList}
            />
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