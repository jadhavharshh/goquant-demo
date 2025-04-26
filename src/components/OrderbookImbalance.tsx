import React, { useEffect, useState } from 'react'
import { OrderbookData } from '../lib/types'

interface OrderbookImbalanceProps {
  data: OrderbookData | null
}

const OrderbookImbalance: React.FC<OrderbookImbalanceProps> = ({ data }) => {
  const [imbalance, setImbalance] = useState<number | null>(null)
  const [imbalancePercent, setImbalancePercent] = useState<number>(0)

  useEffect(() => {
    if (data) {
      const totalBidQuantity = data.bids.reduce((sum, [price, quantity]) => sum + parseFloat(quantity), 0)
      const totalAskQuantity = data.asks.reduce((sum, [price, quantity]) => sum + parseFloat(quantity), 0)

      const calc = totalBidQuantity - totalAskQuantity
      setImbalance(calc)
      
      // Calculate percentage for the visual indicator
      const total = totalBidQuantity + totalAskQuantity
      setImbalancePercent(total > 0 ? (totalBidQuantity / total) * 100 : 50)
    }
  }, [data])

  if (imbalance === null) {
    return <div className="flex justify-center items-center h-full text-gray-400">Loading data...</div>
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="text-right text-sm">
          <div className={`text-2xl font-bold ${imbalance > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(imbalance).toFixed(2)} BTC
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {imbalance > 0 ? 'Buy Side Dominance' : 'Sell Side Pressure'}
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {imbalancePercent > 50 ? (
            <span className="text-green-500">{Math.round(imbalancePercent)}% Bids</span>
          ) : (
            <span className="text-red-500">{Math.round(100 - imbalancePercent)}% Asks</span>
          )}
        </div>
      </div>
      
      {/* Visual indicator */}
      <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${imbalance > 0 ? 'bg-green-600' : 'bg-red-600'}`} 
          style={{ width: `${imbalancePercent}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <div>Bids</div>
        <div>Asks</div>
      </div>
      
      <div className="flex-1 flex items-center justify-center mt-4">
        <div className="text-center">
          <div className="text-gray-400 text-sm">Imbalance suggests</div>
          <div className={`text-xl font-medium mt-1 ${imbalance > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {imbalance > 0 ? 'Bullish Pressure' : 'Bearish Pressure'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderbookImbalance