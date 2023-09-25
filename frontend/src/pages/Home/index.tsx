import { useEffect, useState } from 'preact/hooks'
import { Loader } from '../../components/Loader'
import { QuickStats } from '../../components/QuickStats'
import './style.css'
import { LineGraph } from '../../components/graph/LineGraph'

export function Home() {
  const [sysinfo, setSysinfo] = useState({} as SystemInfo)
  const [memoryData, setMemoryData] = useState([] as Memory[])
  const [swapData, setSwapData] = useState([] as Memory[])
  const [cpuData, setCpuData] = useState([] as CPU[])
  const [diskData, setDiskData] = useState([] as Disk[])
  const [networkData, setNetworkData] = useState([] as Network[])
  const [processList, setProcessList] = useState([] as Process[])

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

      const dres = await fetch('/api/disk')
      const ddata = await dres.json()
      setDiskData(ddata)

      const nres = await fetch('/api/network')
      const ndata = await nres.json()
      setNetworkData(ndata)

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
              diskData={diskData}
              networkData={networkData}
              processList={processList}
            />

            <div className="home-graphs">
              { /* Memory line */ }
              <LineGraph
                labels={ memoryData.map((v) => new Date(v.timestamp * 1000).toLocaleTimeString()) }
                xLabel='Time'
                yLabel='Memory Usage (MB)'
                datasets={[
                  {
                    data: memoryData.map((v) => {
                      // Convert to MB
                      return v.used / 1024 / 1024
                    }),
                    label: 'Memory Usage (MB)',
                    color: 'rgba(255, 99, 132, 0.6)',
                    backgroundColor: 'rgb(255, 99, 132, 0.2)'
                  },
                  {
                    data: swapData.map((v) => {
                      // Convert to MB
                      return v.used / 1024 / 1024
                    }),
                    label: 'Swap Usage (MB)',
                    color: 'rgba(54, 162, 235, 0.6)',
                    backgroundColor: 'rgb(54, 162, 235, 0.2)'
                  }
                ]}
              />

              { /* CPU line */ }
              <LineGraph
                labels={ cpuData.map((v) => new Date(v.timestamp * 1000).toLocaleTimeString()) }
                xLabel='Time'
                yLabel='CPU Usage (%)'
                min={0}
                max={100}
                datasets={[
                  {
                    data: cpuData.map((v) => {
                      return v.used
                    }),
                    label: 'CPU Usage (%)',
                    color: 'rgba(255, 99, 132, 0.6)',
                    backgroundColor: 'rgb(255, 99, 132, 0.2)'
                  }
                ]}
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