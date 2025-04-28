"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { OrderbookData } from '../lib/types'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'

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
  const [minSpread, setMinSpread] = useState<number | null>(null)
  const [maxSpread, setMaxSpread] = useState<number | null>(null)
  const [avgSpread, setAvgSpread] = useState<number | null>(null)
  
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
        
        // Calculate min/max/avg values
        if (updatedHistory.length > 0) {
          const values = updatedHistory.map(p => p.value);
          setMinSpread(Math.min(...values));
          setMaxSpread(Math.max(...values));
          setAvgSpread(values.reduce((sum, val) => sum + val, 0) / values.length);
        }
        
        return updatedHistory;
      });
    }
  }, [data])

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Calculate domain for Y axis with padding
  const yDomain = useMemo(() => {
    if (!minSpread || !maxSpread || minSpread === maxSpread) {
      return ['auto', 'auto'];
    }
    
    const padding = (maxSpread - minSpread) * 0.2;
    return [Math.max(0, minSpread - padding), maxSpread + padding];
  }, [minSpread, maxSpread]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-[#1e2329] border border-[#232a32] p-2 rounded shadow-lg text-xs">
          <p className="text-[#848e9c] mb-0.5">{formatTime(label)}</p>
          <p className="text-[#f0b90b] font-medium">
            Spread: ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (spread === null) {
    return (
      <div className="flex justify-center items-center h-full text-[#848e9c]">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#f0b90b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading spread data...
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-3 gap-1 mb-2">
        <div className="bg-[#1e2329] rounded p-1 text-center">
          <div className="text-[10px] text-[#848e9c] mb-0.5">Current</div>
          <div className="text-[#f0b90b] text-xs font-medium">${spread.toFixed(2)}</div>
        </div>
        
        <div className="bg-[#1e2329] rounded p-1 text-center">
          <div className="text-[10px] text-[#848e9c] mb-0.5">Min/Max</div>
          <div className="text-[#eaecef] text-[10px]">
            ${minSpread?.toFixed(2) || "-"} / ${maxSpread?.toFixed(2) || "-"}
          </div>
        </div>
        
        <div className="bg-[#1e2329] rounded p-1 text-center">
          <div className="text-[10px] text-[#848e9c] mb-0.5">Average</div>
          <div className="text-[#eaecef] text-xs">
            ${avgSpread?.toFixed(2) || "-"}
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full">
        {spreadHistory.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spreadHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f0b90b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f0b90b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232a32" opacity={0.6} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime} 
                domain={['dataMin', 'dataMax']}
                stroke="#848e9c"
                tick={{ fill: '#848e9c', fontSize: 9 }}
                minTickGap={30}
              />
              <YAxis 
                domain={yDomain} 
                stroke="#848e9c"
                tick={{ fill: '#848e9c', fontSize: 9 }}
                tickFormatter={(value) => `$${value.toFixed(1)}`}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              {avgSpread && (
                <ReferenceLine 
                  y={avgSpread} 
                  label={{ 
                    value: `Avg: $${avgSpread.toFixed(2)}`,
                    position: 'right',
                    fill: '#f0b90b',
                    fontSize: 9
                  }} 
                  stroke="#f0b90b" 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.8}
                />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f0b90b"
                strokeWidth={1.5}
                fill="url(#spreadGradient)"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 3, fill: '#f0b90b', stroke: '#f0b90b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#848e9c] text-xs">Collecting data for chart...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SpreadIndicator