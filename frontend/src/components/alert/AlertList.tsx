import { Alert } from './Alert'
import './AlertList.css'

interface Props {
  alerts: string[]
}

export function AlertList(props: Props) {
  return (
    <div className="alert-list">
      {
        props.alerts.map((a, i) => (
          <Alert key={i} type='info'>
            {a}
          </Alert>
        ))
      }
    </div>
  )
}