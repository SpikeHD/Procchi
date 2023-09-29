import { bytesToReadable } from '../util/byte'
import './QuickStats.css'
import { Stat } from './Stats/Stat'
import { StatRow } from './Stats/StatRow'
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
  const diskUse = Object.keys(props.diskData).map(d => props.diskData[d][props.diskData[d].length - 1].used).reduce((a, b) => a + b)
  const diskTotal = Object.keys(props.diskData).map(d => props.diskData[d][props.diskData[d].length - 1].total).reduce((a, b) => a + b)
  const diskDeviceCount = Object.keys(props.diskData).length
  const netRecieve = Object.keys(props.networkData).map(n => props.networkData[n][props.networkData[n].length - 1].recieve).reduce((a, b) => a + b)
  const netTransmit = Object.keys(props.networkData).map(n => props.networkData[n][props.networkData[n].length - 1].transmit).reduce((a, b) => a + b)
  const netDeviceCount = Object.keys(props.networkData).length
  const cpuPct = props.cpuData[props.cpuData.length - 1]?.used

  return (
    <StatRow header={'Quick Stats'}>
      <Stat
        big={bytesToReadable(memoryUse)}
        small={
          ((memoryUse / props.sysinfo.mem_size * 100) || 0).toFixed(2) + '% of total memory (' + bytesToReadable(props.sysinfo.mem_size) + ')'
        }
      />

      <Stat
        big={bytesToReadable(swapUse)}
        small={
          ((swapUse / props.sysinfo.swap_size * 100) || 0).toFixed(2) + '% of total swap (' + bytesToReadable(props.sysinfo.swap_size) + ')'
        }
      />

      <Stat
        big={cpuPct.toFixed(2) + '%'}
        small={
          props.sysinfo.cpu_brand
        }
        mini={true}
      />

      <Stat
        big={props.processList.length.toString()}
        small={'Active Processes'}
      />

      <Stat
        big={(
          <span className="network-stat">
            <span>
              {bytesToReadable(netRecieve)} <ArrowDown />  
            </span>
            <span className="stat-seperator">
              /
            </span> 
            <span>
              {bytesToReadable(netTransmit)} <ArrowUp />
            </span>
          </span>
        )}
        small={'Network RX / TX (' + netDeviceCount + ' devices)'}
      />

      <Stat
        big={bytesToReadable(diskUse)}
        small={
          (diskUse / diskTotal * 100).toFixed(2) + '% of ' + diskDeviceCount + ' disks'
        }
      />
    </StatRow>
  )
}