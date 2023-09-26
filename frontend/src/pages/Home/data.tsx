import { useEffect, useState } from 'preact/hooks'
import { LineGraph } from '../../components/graph/LineGraph'

import './data.css'
import { Loader } from '../../components/Loader'
import { ProcessTable } from './ProcessTable'

interface Props {
  sysinfo: SystemInfo;
  memoryData: Memory[];
  swapData: Memory[];
  cpuData: CPU[];
  diskData: Disk[];
  networkData: Network[];
  processList: Process[];
  diskColors: { color: string; backgroundColor: string }[];
}

export function DataHome(props: Props) {
  const [sysinfo, setSysinfo] = useState({} as SystemInfo)
  const [memoryData, setMemoryData] = useState([] as Memory[])
  const [swapData, setSwapData] = useState([] as Memory[])
  const [cpuData, setCpuData] = useState([] as CPU[])
  const [diskData, setDiskData] = useState([] as Disk[])
  const [networkData, setNetworkData] = useState([] as Network[])
  const [processList, setProcessList] = useState([] as Process[])
  const [diskColors, setDiskColors] = useState(
    [] as { color: string; backgroundColor: string }[]
  )

  useEffect(() => {
    setSysinfo(props.sysinfo)
    setMemoryData(props.memoryData)
    setSwapData(props.swapData)
    setCpuData(props.cpuData)
    setDiskData(props.diskData)
    setNetworkData(props.networkData)
    setProcessList(props.processList)
    setDiskColors(props.diskColors)
  }, [props])

  return (
    <>
      {sysinfo?.os_name ? (
        <div className="home-graphs-outer">
          <div className="home-graphs">
            {/* Memory line */}
            <LineGraph
              labels={memoryData.map((v) =>
                new Date(v.timestamp * 1000).toLocaleTimeString()
              )}
              xLabel="Time"
              yLabel="Memory Usage (MB)"
              max={sysinfo.mem_size / 1024 / 1024}
              min={0}
              datasets={[
                {
                  data: memoryData.map((v) => {
                    // Convert to MB
                    return v.used / 1024 / 1024
                  }),
                  label: 'Memory Usage (MB)',
                  color: 'rgba(255, 99, 132, 0.6)',
                  backgroundColor: 'rgb(255, 99, 132, 0.2)',
                },
                {
                  data: swapData.map((v) => {
                    // Convert to MB
                    return v.used / 1024 / 1024
                  }),
                  label: 'Swap Usage (MB)',
                  color: 'rgba(54, 162, 235, 0.6)',
                  backgroundColor: 'rgb(54, 162, 235, 0.2)',
                },
              ]}
            />

            {/* CPU line */}
            <LineGraph
              labels={cpuData.map((v) =>
                new Date(v.timestamp * 1000).toLocaleTimeString()
              )}
              xLabel="Time"
              yLabel="CPU Usage (%)"
              min={0}
              max={100}
              datasets={[
                {
                  data: cpuData.map((v) => {
                    return v.used
                  }),
                  label: 'CPU Usage (%)',
                  color: 'rgba(255, 99, 132, 0.6)',
                  backgroundColor: 'rgb(255, 99, 132, 0.2)',
                },
              ]}
            />
          </div>

          <div className="home-graphs">
            {/* Disks */}
            <LineGraph
              // All disks have the same timestamps, so just use the first one
              labels={diskData[Object.keys(diskData)[0]].map((v) =>
                new Date(v.timestamp * 1000).toLocaleTimeString()
              )}
              xLabel="Time"
              yLabel="Disk Usage (GB)"
              min={0}
              datasets={Object.keys(diskData).map((disk, i) => {
                return {
                  data: diskData[disk].map((v) => {
                    // Convert to GB
                    return v.used / 1024 / 1024 / 1024
                  }),
                  label: disk === '' ? 'Unknown Disk ' + i : disk.trim(),
                  color: diskColors[i]?.color || 'rgba(255, 99, 132, 0.6)',
                  backgroundColor:
                    diskColors[i]?.backgroundColor || 'rgb(255, 99, 132, 0.2)',
                }
              })}
            />

            {/* Network (same format as Disks)*/}
            <LineGraph
              labels={networkData[Object.keys(networkData)[0]].map((v) =>
                new Date(v.timestamp * 1000).toLocaleTimeString()
              )}
              xLabel="Time"
              yLabel="Network Usage (MB)"
              min={0}
              datasets={Object.keys(networkData).map((network, i) => {
                return {
                  data: networkData[network].map((v) => {
                    // Convert to MB
                    return v.recieve / 1024 / 1024
                  }),
                  label:
                    network === '' ? 'Unknown Network ' + i : network.trim(),
                  color: 'rgba(255, 99, 132, 0.6)',
                  backgroundColor: 'rgb(255, 99, 132, 0.2)',
                }
              })}
            />
          </div>

          <div className="home-table">
            <ProcessTable
              processList={processList}
            />
          </div>
        </div>
      ) : (
        <div className="loading">
          <Loader />
        </div>
      )}
    </>
  )
}
