import React, { useEffect, useState, useRef } from 'react'
import { OrderbookData } from '../lib/types'

interface OrderbookImbalanceProps {
  data: OrderbookData | null;
  currencySymbol?: string;
}

interface ImbalanceHistory {
  timestamp: number;
  value: number;
  percent: number;
}

const OrderbookImbalance: React.FC<OrderbookImbalanceProps> = ({ data , currencySymbol = 'BTC' }) => {
  const [imbalance, setImbalance] = useState<number | null>(null)
  const [imbalancePercent, setImbalancePercent] = useState<number>(50)
  const [history, setHistory] = useState<ImbalanceHistory[]>([])
  const [trend, setTrend] = useState<'increasing' | 'decreasing' | 'stable'>('stable')
  
  // For calculating trend
  const prevImbalanceRef = useRef<number | null>(null)
  
  // Max history points to keep
  const MAX_HISTORY = 20
  
  useEffect(() => {
    if (data) {
      const totalBidQuantity = data.bids.reduce((sum, [_, quantity]) => sum + parseFloat(quantity), 0)
      const totalAskQuantity = data.asks.reduce((sum, [_, quantity]) => sum + parseFloat(quantity), 0)

      const calc = totalBidQuantity - totalAskQuantity
      setImbalance(calc)
      
      // Store previous value for trend calculation
      if (prevImbalanceRef.current !== null) {
        const diff = Math.abs((calc - prevImbalanceRef.current) / prevImbalanceRef.current)
        
        // Only update trend if the change is significant (> 1%)
        if (diff > 0.01) {
          if (calc > prevImbalanceRef.current) {
            setTrend('increasing')
          } else if (calc < prevImbalanceRef.current) {
            setTrend('decreasing')
          }
        } else {
          setTrend('stable')
        }
      }
      prevImbalanceRef.current = calc
      
      // Calculate percentage for the visual indicator
      const total = totalBidQuantity + totalAskQuantity
      const percent = total > 0 ? (totalBidQuantity / total) * 100 : 50
      setImbalancePercent(percent)
      
      // Add to history
      setHistory(prev => {
        const newPoint = { 
          timestamp: Date.now(), 
          value: calc,
          percent
        }
        
        const updated = [newPoint, ...prev].slice(0, MAX_HISTORY)
        return updated
      })
    }
  }, [data])

  if (imbalance === null) {
    return (
      <div className="flex justify-center items-center h-full text-[#848e9c]">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#f0b90b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading imbalance data...
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs flex items-center">
        <div className={`text-sm font-medium ${imbalance > 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
            {Math.abs(imbalance).toFixed(2)} {currencySymbol}
          </div>
          
          {/* Trend indicator */}
          <div className="ml-1">
            {trend === 'increasing' && (
              <svg className="w-3 h-3 text-[#0ecb81]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
            {trend === 'decreasing' && (
              <svg className="w-3 h-3 text-[#f6465d]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {trend === 'stable' && (
              <svg className="w-3 h-3 text-[#848e9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
              </svg>
            )}
          </div>
        </div>
        <div className="text-[10px] text-[#848e9c]">
          {imbalancePercent > 50 ? (
            <div><span className="text-[#0ecb81] font-medium">{Math.round(imbalancePercent)}%</span> Buy Dominance</div>
          ) : (
            <div><span className="text-[#f6465d] font-medium">{Math.round(100 - imbalancePercent)}%</span> Sell Dominance</div>
          )}
        </div>
      </div>
      
      {/* Visual indicator */}
      <div className="h-1.5 w-full bg-[#1e2329] rounded-full overflow-hidden flex relative">
        <div 
          className="h-full bg-[#0ecb81] transition-all duration-300 ease-out" 
          style={{ width: `${imbalancePercent}%` }}
        />
        <div 
          className="h-full bg-[#f6465d] transition-all duration-300 ease-out"
          style={{ width: `${100-imbalancePercent}%` }}
        />
        {/* Midpoint marker */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#848e9c]" />
      </div>
      
      <div className="flex justify-between text-[10px] text-[#848e9c] mt-0.5 mb-2">
        <div>Bids</div>
        <div>Asks</div>
      </div>
      
      {/* Imbalance history chart (simplified) */}
      <div className="flex-1 relative">
        <div className="absolute top-0 left-0 text-[10px] text-[#848e9c]">History (recent first)</div>
        <div className="absolute top-5 bottom-0 left-0 right-0">
          <div className="w-full h-full flex items-end space-x-0.5">
            {history.map((point, index) => (
              <div 
                key={point.timestamp} 
                className="flex-1 h-full flex flex-col justify-end" 
                style={{ opacity: Math.max(0.3, 1 - index * 0.05) }}
              >
                <div 
                  className={`w-full rounded-t ${point.value > 0 ? 'bg-[#0ecb81]' : 'bg-[#f6465d]'}`} 
                  style={{ 
                    height: `${Math.min(100, Math.max(5, Math.abs(point.value) / (Math.max(...history.map(h => Math.abs(h.value))) * 1.2) * 100))}%` 
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-1 text-center">
        <div className="text-[10px] text-[#848e9c] mb-0.5">Market Sentiment</div>
        <div className={`text-xs font-medium ${imbalance > 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
          {imbalance > 0 
            ? (imbalancePercent > 65 ? 'Strong Buy Pressure' : 'Moderate Buy Pressure') 
            : (imbalancePercent < 35 ? 'Strong Sell Pressure' : 'Moderate Sell Pressure')}
        </div>
      </div>
    </div>
  )
}

export default OrderbookImbalance