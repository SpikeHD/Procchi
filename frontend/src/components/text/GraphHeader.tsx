import React from 'preact'

interface Props {
  children: React.Component | React.Component[];
}

export function GraphHeader(props: Props) {
  return (
    <div className="graph-header">
      {props.children}
    </div>
  )
}