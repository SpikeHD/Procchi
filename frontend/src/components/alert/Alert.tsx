import './Alert.css'

interface Props {
  children: string
  type: 'error' | 'info' | 'warning'
}

export const ProcchiAlert = (str: string) => new CustomEvent('procchi-alert', { detail: str })

export function Alert(props: Props) {
  return (
    <div className={'alert alert-' + props.type}>
      {props.children}
    </div>
  )
}