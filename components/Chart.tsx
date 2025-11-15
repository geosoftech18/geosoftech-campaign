'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ChartProps {
  data: any[]
  type?: 'line' | 'bar'
  dataKey: string
  name: string
}

export function Chart({ data, type = 'line', dataKey, name }: ChartProps) {
  const ChartComponent = type === 'line' ? LineChart : BarChart
  const DataComponent = type === 'line' ? Line : Bar

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <DataComponent type="monotone" dataKey={dataKey} name={name} stroke="#8884d8" />
      </ChartComponent>
    </ResponsiveContainer>
  )
}


