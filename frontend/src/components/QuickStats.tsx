import { bytesToReadable } from '../util/byte'
import './QuickStats.css'

interface Props {
  sysinfo: SystemInfo;
  memoryData: Memory[];
  swapData: Memory[];
  cpuData: CPU[];
  processList: Process[];
}

export function QuickStats(props: Props) {
  const memoryUse = props.memoryData[props.memoryData.length - 1]?.used
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
        <span className="stat-big">{cpuPct.toFixed(2)}%</span>
        <span className="stat-small">CPU usage</span>
      </div>
    </div>
  )
}