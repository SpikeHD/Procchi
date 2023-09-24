import { useState } from 'preact/hooks'
import { Chart } from 'react-charts'

export function LineGraph() {
  const data = useState()

  return (
    <Chart
      options={{
        data: data,
      }}
    ></Chart>
  )
}