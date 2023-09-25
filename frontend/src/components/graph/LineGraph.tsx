import { useEffect, useState } from 'preact/hooks'
import { Chart, registerables } from 'chart.js/auto'
Chart.register(...registerables)

import { Line } from 'react-chartjs-2'

import './LineGraph.css'

interface Props {
  labels: string[]
  datasets: {
    data: number[],
    color: string,
    backgroundColor: string
    label: string
  }[],
  xLabel?: string
  yLabel?: string
}

export function LineGraph(props: Props) {
  const [data, setData] = useState({
    labels: props.labels,
    datasets: props.datasets.map((dataset) => {
      return {
        label: dataset.label,
        data: dataset.data,
        fill: true,
        backgroundColor: dataset.backgroundColor,
        borderColor: dataset.color
      }
    })
  })

  useEffect(() => {
    setData({
      labels: props.labels,
      datasets: props.datasets.map((dataset) => {
        return {
          label: dataset.label,
          data: dataset.data,
          fill: true,
          backgroundColor: dataset.backgroundColor,
          borderColor: dataset.color
        }
      })
    })
  }, [])

  return (
    <div className="graph-container">
      <Line
        data={data}
        options={{
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: props.xLabel !== undefined,
                text: props.xLabel
              }
            },
            y: {
              title: {
                display: props.yLabel !== undefined,
                text: props.yLabel
              }
            }
          }
        }}
      ></Line>
    </div>
  )
}