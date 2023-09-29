import { VNode } from 'preact'
import './StatRow.css'

interface Props {
  children?: VNode | VNode[]
  header?: string
}

export function StatRow(props: Props) {
  return (
    <div className="stat-row-outer">
      <div className="stat-row-header">
        <span className="stat-row-title">{props.header}</span>
      </div>

      <div className="stat-row">
        {props.children}
      </div>
    </div>
  )
}