import { bytesToReadable } from '../util/byte'
import './QuickStats.css'
import { ArrowDown } from './icons/ArrowDown'
import { ArrowUp } from './icons/ArrowUp'

interface Props {
  sysinfo: SystemInfo;
  memoryData: Memory[];
  swapData: Memory[];
  cpuData: CPU[];
  diskData: Disk[];
  networkData: Network[];
  processList: Process[];
}

export function QuickStats(props: Props) {
  const memoryUse = props.memoryData[props.memoryData.length - 1]?.used
  const swapUse = props.swapData[props.swapData.length - 1]?.used
  const diskUse = props.diskData.map(d => d.used).reduce((a, b) => a + b)
  const diskTotal = props.diskData.map(d => d.total).reduce((a, b) => a + b)
  const netRecieve = props.networkData.map(n => n.recieve).reduce((a, b) => a + b)
  const netTransmit = props.networkData.map(n => n.transmit).reduce((a, b) => a + b)
  const cpuPct = props.cpuData[props.cpuData.length - 1]?.used

  return (
    <div className="quick-stats-outer">
      <div className="quick-stats-header">
        <span className="quick-stats-title">Quick Stats</span>
      </div>

      <div className="quick-stats">
        <div className="stat">
          <span className="stat-big">{bytesToReadable(memoryUse)}</span>
          <span className="stat-small">{
            (memoryUse / props.sysinfo.mem_size * 100).toFixed(2)
          }% of total memory ({bytesToReadable(props.sysinfo.mem_size)})</span>
        </div>

        <div className="stat">
          <span className="stat-big">{bytesToReadable(swapUse)}</span>
          <span className="stat-small">{
            (swapUse / props.sysinfo.swap_size * 100).toFixed(2)
          }% of total swap ({bytesToReadable(props.sysinfo.swap_size)})</span>
        </div>

        <div className="stat">
          <span className="stat-big">{cpuPct.toFixed(2)}%</span>
          <span className="stat-small">
            <span className="stat-mini">({props.sysinfo.cpu_brand})</span>
          </span>
        </div>

        <div className="stat">
          <span className="stat-big">
            {bytesToReadable(netRecieve)} <ArrowDown /> / {bytesToReadable(netTransmit)} <ArrowUp />
          </span>
          <span className="stat-small">Network RX / TX ({props.networkData.length} devices)</span>
        </div>

        <div className="stat">
          <span className="stat-big">{bytesToReadable(diskUse)}</span>
          <span className="stat-small">{
            (diskUse / diskTotal * 100).toFixed(2)
          }% of {props.diskData.length} disks</span>
        </div>
      </div>
    </div>

  )
}