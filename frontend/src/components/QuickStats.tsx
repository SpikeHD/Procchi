import { bytesToReadable } from '../util/byte'
import './QuickStats.css'

interface Props {
  sysinfo: SystemInfo;
  memoryData: Memory[];
  swapData: Memory[];
  cpuData: CPU[];
  diskData: Disk[];
  processList: Process[];
}

export function QuickStats(props: Props) {
  const memoryUse = props.memoryData[props.memoryData.length - 1]?.used
  const swapUse = props.swapData[props.swapData.length - 1]?.used
  const diskUse = props.diskData.map(d => d.used).reduce((a, b) => a + b)
  const diskTotal = props.diskData.map(d => d.total).reduce((a, b) => a + b)
  const cpuPct = props.cpuData[props.cpuData.length - 1]?.used

  return (
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
        <span className="stat-small">CPU usage</span>
      </div>

      <div className="stat">
        <span className="stat-big">{bytesToReadable(diskUse)}</span>
        <span className="stat-small">{
          (diskUse / diskTotal * 100).toFixed(2)
        }% of {props.diskData.length} disks</span>
      </div>
    </div>
  )
}