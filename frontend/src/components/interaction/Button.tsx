import React from 'preact'

import './Button.css'

interface Props {
  children: React.Component | React.Component[];
  onClick: () => void;
  secondary?: boolean;
}

export function Button(props: Props) {
  return (
    <div className={'Button ' + (props.secondary ? 'secondary' : '')}>

    </div>
  )
}