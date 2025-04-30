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
  data: OrderbookData | null;
  currencySymbol?: string;
}

const MarketDepthChart: React.FC<MarketDepthChartProps> = ({
  data,
  currencySymbol = 'BTC'
}) => {
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

  // Add this component before your main component

const CustomCursor = ({ x, y, width, height, top, left }: any) => {
  return (
    <g>
      {/* Vertical line */}
      <line 
        x1={x} 
        y1={top} 
        x2={x} 
        y2={top + height} 
        stroke="#f0b90b" 
        strokeWidth={1} 
        strokeDasharray="3 3" 
      />
      {/* Horizontal line */}
      <line 
        x1={left} 
        y1={y} 
        x2={left + width} 
        y2={y} 
        stroke="#f0b90b" 
        strokeWidth={1} 
        strokeDasharray="3 3" 
      />
    </g>
  );
};

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const price = payload[0].payload.price
      const bidVolume = payload[0].payload.cumulativeBid
      const askVolume = payload[0].payload.cumulativeAsk

      // Calculate distance from mid price if available
      let priceDistance = '';
      if (midPrice) {
        const distance = ((price - midPrice) / midPrice * 100).toFixed(2);
        priceDistance = `(${distance}% from mid)`;
      }

      return (
        <div className="custom-tooltip bg-[#1e2329] border border-[#2f3741] p-2.5 rounded shadow-lg text-xs">
          <p className="font-medium text-[#eaecef] mb-1.5 flex justify-between">
            <span>Price:</span> 
            <span className="ml-3">${price.toFixed(2)} {priceDistance}</span>
          </p>
          {bidVolume > 0 && (
            <p className="text-[#0ecb81] flex justify-between mb-0.5">
              <span>Bid Volume:</span>
              <span className="ml-3 font-medium">{bidVolume.toFixed(4)} {currencySymbol}</span>
            </p>
          )}
          {askVolume > 0 && (
            <p className="text-[#f6465d] flex justify-between">
              <span>Ask Volume:</span>
              <span className="ml-3 font-medium">{askVolume.toFixed(4)} {currencySymbol}</span>
            </p>
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
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ecb81" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f6465d" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f6465d" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#232a32" 
            opacity={0.5} 
            vertical={false} 
          />
          <XAxis
            dataKey="price"
            stroke="#848e9c"
            tick={{ fill: '#848e9c', fontSize: 10 }}
            tickFormatter={formatPrice}
            domain={['dataMin', 'dataMax']}
            tickCount={7}
            axisLine={{ stroke: '#2f3741' }}
            tickLine={{ stroke: '#2f3741' }}
          />
          <YAxis
            stroke="#848e9c"
            tick={{ fill: '#848e9c', fontSize: 10 }}
            tickFormatter={formatVolume}
            width={36}
            axisLine={{ stroke: '#2f3741' }}
            tickLine={{ stroke: '#2f3741' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 10, color: '#848e9c' }}
            align="right"
            verticalAlign="top"
            height={20}
            iconType="circle"
            iconSize={8}
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
                fontSize: 10,
                fontWeight: 500,
              }}
              isFront
            />
          )}
          <Area
            type="monotone"
            name="Bids"
            dataKey="cumulativeBid"
            stroke="#0ecb81"
            fill="url(#bidGradient)"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
            activeDot={{ r: 4, fill: '#0ecb81', stroke: '#0ecb81' }}
          />
          <Area
            type="monotone"
            name="Asks"
            dataKey="cumulativeAsk"
            stroke="#f6465d"
            fill="url(#askGradient)"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
            activeDot={{ r: 4, fill: '#f6465d', stroke: '#f6465d' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MarketDepthChart