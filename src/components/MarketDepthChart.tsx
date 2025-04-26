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

      // Sort by price
      bids.sort((a, b) => b.price - a.price) // Descending
      asks.sort((a, b) => a.price - b.price) // Ascending

      // Calculate cumulative values
      let cumulativeBid = 0
      const bidData = bids.map(item => {
        cumulativeBid += item.quantity
        return {
          price: item.price,
          cumulativeBid: cumulativeBid,
          cumulativeAsk: 0
        }
      })

      let cumulativeAsk = 0
      const askData = asks.map(item => {
        cumulativeAsk += item.quantity
        return {
          price: item.price,
          cumulativeBid: 0,
          cumulativeAsk: cumulativeAsk
        }
      })

      // Combine data for the chart
      const combinedData = [...bidData, ...askData].sort((a, b) => a.price - b.price)
      setChartData(combinedData)
    }
  }, [data])

  if (!data) {
    return <div className="flex justify-center items-center h-full text-gray-400">Loading data...</div>
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="price" 
            stroke="#6b7280"
            tick={{ fill: '#9ca3af' }}
            domain={['dataMin', 'dataMax']}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fill: '#9ca3af' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
            labelStyle={{ color: '#f9fafb' }}
            formatter={(value) => [
              `${Number(value).toFixed(2)} BTC`,
              typeof value === 'number' && value > 0 ? 'Volume' : ''
            ]
          } />
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
          <Line 
            type="monotone" 
            name="Bids" 
            dataKey="cumulativeBid" 
            stroke="#10b981" 
            dot={false} 
            strokeWidth={2}
            isAnimationActive={false} 
          />
          <Line 
            type="monotone" 
            name="Asks" 
            dataKey="cumulativeAsk" 
            stroke="#ef4444" 
            dot={false} 
            strokeWidth={2}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MarketDepthChart