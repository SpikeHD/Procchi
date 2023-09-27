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
  min?: number
  max?: number
}

export function LineGraph(props: Props) {
  const color = getComputedStyle(document.documentElement).getPropertyValue('--graph-color')
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

    // Listen to rerender-graphs event
    document.addEventListener('rerender-graphs', () => {
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
    })
  }, [props.datasets])

  return (
    <div className="graph-container">
      <Line
        data={data}
        options={{
          animation: false,
          maintainAspectRatio: false,
          responsive: true,
          color: color,
          backgroundColor: color,
          borderColor: color,
          scales: {
            x: {
              title: {
                display: props.xLabel !== undefined,
                text: props.xLabel,
                color: color,
              },
              grid: {
                color: color,
                tickColor: color,
              },
              ticks: {
                color: color,
              },
            },
            y: {
              title: {
                display: props.yLabel !== undefined,
                text: props.yLabel,
                color: color,
              },
              grid: {
                color: color,
                tickColor: color,
              },
              ticks: {
                color: color,
              },
              suggestedMin: props.min || null,
              suggestedMax: props.max || null,
              beginAtZero: props.min === 0
            }
          }
        }}
      ></Line>
    </div>
  )
}