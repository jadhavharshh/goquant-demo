"use client"
import React, { useEffect, useState } from 'react'
import { OrderbookData } from '../lib/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface SpreadIndicatorProps {
  data: OrderbookData | null
}

interface SpreadDataPoint {
  timestamp: number;
  value: number;
}

const SpreadIndicator: React.FC<SpreadIndicatorProps> = ({ data }) => {
  const [spread, setSpread] = useState<number | null>(null)
  const [spreadHistory, setSpreadHistory] = useState<SpreadDataPoint[]>([])
  
  // One minute in milliseconds
  const ONE_MINUTE_MS = 60 * 1000;

  useEffect(() => {
    if (data) {
      const bestBid = parseFloat(data.bids[0][0]) // Best bid price
      const bestAsk = parseFloat(data.asks[0][0]) // Best ask price
      const currentSpread = bestAsk - bestBid;
      
      setSpread(currentSpread)
      
      // Add current spread to history with timestamp
      const now = Date.now();
      const newDataPoint = { timestamp: now, value: currentSpread };
      
      // Update spread history, keeping only last minute of data
      setSpreadHistory(prevHistory => {
        const updatedHistory = [...prevHistory, newDataPoint]
          .filter(point => now - point.timestamp < ONE_MINUTE_MS);
        return updatedHistory;
      });
    }
  }, [data])

  if (spread === null) {
    return <div className="flex justify-center items-center h-full text-gray-400">Loading data...</div>
  }

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg text-blue-400">
          Current: <span className="font-bold">${spread.toFixed(2)}</span>
        </div>
        <div className="text-xs text-gray-400">
          1-minute rolling window
        </div>
      </div>
      
      <div className="flex-1 w-full">
        {spreadHistory.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spreadHistory}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime} 
                domain={['dataMin', 'dataMax']}
                stroke="#6b7280"
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                stroke="#6b7280"
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
                labelStyle={{ color: '#f9fafb' }}
                labelFormatter={(timestamp) => `Time: ${formatTime(timestamp as number)}`}
                formatter={(value) => [`${Number(value).toFixed(2)} USD`, 'Spread']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                dot={false} 
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Collecting data for chart...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SpreadIndicator