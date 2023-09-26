import { useEffect, useState } from 'preact/hooks'
import { bytesToReadable } from '../../util/byte'

import './ProcessTable.css'

interface Props {
  processList: Process[];
}

export function ProcessTable(props: Props) {
  const [processList, setProcessList] = useState([] as Process[])
  const [sortType, setSortType] = useState({
    key: 'pid',
    reverse: false
  })

  useEffect(() => {
    setProcessList(sort(props.processList, sortType.key))
  }, [props.processList, sortType])

  const sort = (processList: Process[], key: string) => {
    return [...processList].sort((a, b) => {
      if (key === 'pid') {
        return sortType.reverse ? b.pid - a.pid : a.pid - b.pid
      } else if (key === 'name') {
        return sortType.reverse ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
      } else if (key === 'cpu') {
        return sortType.reverse ? b.cpu - a.cpu : a.cpu - b.cpu
      } else if (key === 'mem') {
        return sortType.reverse ? b.mem - a.mem : a.mem - b.mem
      } else {
        return 0
      }
    })
  }

  return (
    <div className="process-table-outer">
      <div className="process-table-heading">
        <span className="process-table-title">Processes ({processList.length})</span>
      </div>

      <div className="process-table-row process-table-header">
        <span
          className="process-table-cell short process-header-sortable"
          onClick={() => {
            setSortType((prev) => ({
              key: 'pid',
              reverse: prev.key === 'pid' ? !prev.reverse : false
            }))
          }}
        >PID</span>
        <span
          className="process-table-cell process-header-sortable"
          onClick={() => {
            setSortType((prev) => ({
              key: 'name',
              reverse: prev.key === 'name' ? !prev.reverse : false
            }))
          }}
        >Name</span>
        <span
          className="process-table-cell short process-header-sortable"
          onClick={() => {
            setSortType((prev) => ({
              key: 'cpu',
              reverse: prev.key === 'cpu' ? !prev.reverse : false
            }))
          }}
        >CPU (%)</span>
        <span
          className="process-table-cell short process-header-sortable"
          onClick={() => {
            setSortType((prev) => ({
              key: 'mem',
              reverse: prev.key === 'mem' ? !prev.reverse : false
            }))
          }}
        >Memory</span>
      </div>
      
      { /* We use flex here */ }
      <div className="process-table">
        {
          processList.map((process) => {
            return (
              <div className="process-table-row">
                <span className="process-table-cell short">{process.pid}</span>
                <span className="process-table-cell">{process.name}</span>
                <span className="process-table-cell short">{process.cpu.toFixed(2)}</span>
                <span className="process-table-cell short">{bytesToReadable(process.mem)}</span>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}