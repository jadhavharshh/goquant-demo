import React, { useEffect, useState, useMemo } from 'react'
import { OrderbookData } from '../lib/types'
import { 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine,
  Area
} from 'recharts'

interface MarketDepthChartProps {
  data: OrderbookData | null
}

const MarketDepthChart: React.FC<MarketDepthChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<{ price: number, cumulativeBid: number, cumulativeAsk: number }[]>([])
  const [midPrice, setMidPrice] = useState<number | null>(null)

  // Calculate mid price and chart data
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

      // Calculate mid price
      if (bids.length > 0 && asks.length > 0) {
        const bestBid = bids[0].price
        const bestAsk = asks[0].price
        setMidPrice((bestBid + bestAsk) / 2)
      }

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

      // Combine data for the chart - use fewer points for smoother rendering
      // Take every Nth point to reduce density but maintain shape
      const skipFactor = Math.max(1, Math.floor((bidData.length + askData.length) / 100))
      
      const filteredBids = bidData.filter((_, i) => i % skipFactor === 0 || i === 0 || i === bidData.length - 1)
      const filteredAsks = askData.filter((_, i) => i % skipFactor === 0 || i === 0 || i === askData.length - 1)
      
      const combinedData = [...filteredBids, ...filteredAsks].sort((a, b) => a.price - b.price)
      setChartData(combinedData)
    }
  }, [data])

  // Custom price formatter for X axis
  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `$${(price / 1000).toFixed(1)}K`
    }
    return `$${price.toFixed(0)}`
  }

  // Custom volume formatter for Y axis
  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toFixed(1)
  }

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const price = payload[0].payload.price
      const bidVolume = payload[0].payload.cumulativeBid
      const askVolume = payload[0].payload.cumulativeAsk
      
      return (
        <div className="custom-tooltip bg-[#1e2329] border border-[#232a32] p-2 rounded shadow-lg text-xs">
          <p className="font-medium text-[#eaecef] mb-1">Price: ${price.toFixed(2)}</p>
          {bidVolume > 0 && (
            <p className="text-[#0ecb81]">Bid Volume: {bidVolume.toFixed(4)} BTC</p>
          )}
          {askVolume > 0 && (
            <p className="text-[#f6465d]">Ask Volume: {askVolume.toFixed(4)} BTC</p>
          )}
        </div>
      )
    }
    return null
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-full text-[#848e9c]">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#f0b90b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading market depth...
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232a32" opacity={0.8} />
          <XAxis 
            dataKey="price" 
            stroke="#848e9c"
            tick={{ fill: '#848e9c', fontSize: 10 }}
            tickFormatter={formatPrice}
            domain={['dataMin', 'dataMax']}
            tickCount={7}
          />
          <YAxis 
            stroke="#848e9c"
            tick={{ fill: '#848e9c', fontSize: 10 }}
            tickFormatter={formatVolume}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: 10, bottom: 0 }}
            align="right" 
            verticalAlign="top"
            height={20}
            iconType="circle"
            iconSize={6}
          />
          {midPrice && (
            <ReferenceLine 
              x={midPrice} 
              stroke="#f0b90b" 
              strokeWidth={1} 
              strokeDasharray="3 3" 
              label={{ 
                value: `$${midPrice.toFixed(2)}`,
                position: 'top', 
                fill: '#f0b90b', 
                fontSize: 10 
              }} 
            />
          )}
          <Area
            type="monotone" 
            name="Bids" 
            dataKey="cumulativeBid" 
            stroke="#0ecb81" 
            fill="#0ecb8120"
            dot={false} 
            strokeWidth={1.5}
            isAnimationActive={false} 
          />
          <Area
            type="monotone" 
            name="Asks" 
            dataKey="cumulativeAsk" 
            stroke="#f6465d" 
            fill="#f6465d20"
            dot={false} 
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MarketDepthChart