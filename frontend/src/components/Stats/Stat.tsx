import { VNode } from 'preact'
import './Stat.css'

interface Props {
  big: string | VNode
  small?: string
  mini?: boolean
}

export function Stat(props: Props) {
  return (
    <div className="stat">
      <span className="stat-big">{props.big}</span>
      <span className={'stat-' + (props.mini ? 'mini' : 'small')}>
        {props.small}
      </span>
    </div>
  )
}