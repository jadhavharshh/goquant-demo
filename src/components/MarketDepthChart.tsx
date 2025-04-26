// components/MarketDepthChart.tsx
import React, { useEffect, useState } from 'react'
import { OrderbookData } from '../lib/types'
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MarketDepthChartProps {
  data: OrderbookData | null
}

const MarketDepthChart: React.FC<MarketDepthChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<{ price: number, cumulativeBid: number, cumulativeAsk: number }[]>([])

  useEffect(() => {
    if (data) {
      const bids = data.bids.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      }))
      const asks = data.asks.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      }))

      // Calculate cumulative bids and asks
      let cumulativeBid = 0
      let cumulativeAsk = 0

      const depthData = []
      for (let i = 0; i < Math.max(bids.length, asks.length); i++) {
        if (bids[i]) {
          cumulativeBid += bids[i].quantity
        }
        if (asks[i]) {
          cumulativeAsk += asks[i].quantity
        }
        depthData.push({
          price: bids[i]?.price || asks[i]?.price,
          cumulativeBid,
          cumulativeAsk
        })
      }

      setChartData(depthData)
    }
  }, [data])

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold mb-4">Market Depth Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="price" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cumulativeBid" stroke="#4CAF50" strokeWidth={2} />
          <Line type="monotone" dataKey="cumulativeAsk" stroke="#F44336" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MarketDepthChart
