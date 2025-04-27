import React, { useMemo } from 'react'
import { OrderbookData } from '../lib/types'

interface OrderbookProps {
  data: OrderbookData | null
}

const Orderbook: React.FC<OrderbookProps> = ({ data }) => {
  // Calculate the max quantity for visual depth bars
  const maxQuantity = useMemo(() => {
    if (!data) return 1;
    
    const bidMax = Math.max(...data.bids.map(([_, qty]) => parseFloat(qty)));
    const askMax = Math.max(...data.asks.map(([_, qty]) => parseFloat(qty)));
    return Math.max(bidMax, askMax);
  }, [data]);
  
  // Calculate market spread
  const spread = useMemo(() => {
    if (!data || data.bids.length === 0 || data.asks.length === 0) return null;
    
    const bestBid = parseFloat(data.bids[0][0]);
    const bestAsk = parseFloat(data.asks[0][0]);
    const spreadAmount = bestAsk - bestBid;
    const spreadPercent = (spreadAmount / bestBid) * 100;
    
    return {
      amount: spreadAmount,
      percent: spreadPercent
    };
  }, [data]);

  if (!data) {
    return (
      <div className="flex justify-center items-center py-4 text-gray-400">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading orderbook...
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Spread indicator */}
      {spread && (
        <div className="text-xs py-1 px-2 mb-2 bg-gray-700 rounded flex justify-between items-center">
          <span className="text-gray-300">Spread</span>
          <span className="font-medium text-gray-200">
            {spread.amount.toFixed(2)} <span className="text-gray-400">({spread.percent.toFixed(2)}%)</span>
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-1">
        {/* Asks - reversed to show highest on top */}
        <div>
          <div className="overflow-y-auto max-h-[calc(50vh-150px)] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-800 z-10">
                <tr className="text-gray-400">
                  <th className="text-left pb-2 font-medium">Price (USD)</th>
                  <th className="text-right pb-2 font-medium">Amount (BTC)</th>
                  <th className="text-right pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...data.asks].reverse().map(([price, quantity], index) => {
                  const priceNum = parseFloat(price);
                  const quantityNum = parseFloat(quantity);
                  const percentOfMax = (quantityNum / maxQuantity) * 100;
                  
                  return (
                    <tr key={`ask-${index}`} className="relative hover:bg-gray-700 transition-colors duration-100">
                      {/* Background bar for depth visualization */}
                      <td colSpan={3} className="absolute inset-0 z-0">
                        <div 
                          className="h-full bg-red-700/20" 
                          style={{ width: `${percentOfMax}%`, marginLeft: 'auto' }}
                        />
                      </td>
                      {/* Content on top of the bar */}
                      <td className="text-red-400 py-1 relative z-10 font-medium">{priceNum.toFixed(2)}</td>
                      <td className="text-right py-1 relative z-10">{quantityNum.toFixed(5)}</td>
                      <td className="text-right text-gray-400 py-1 relative z-10">${(priceNum * quantityNum).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bids */}
        <div className="mt-1">
          <div className="overflow-y-auto max-h-[calc(50vh-150px)] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <table className="w-full text-xs">
              <tbody>
                {data.bids.map(([price, quantity], index) => {
                  const priceNum = parseFloat(price);
                  const quantityNum = parseFloat(quantity);
                  const percentOfMax = (quantityNum / maxQuantity) * 100;
                  
                  return (
                    <tr key={`bid-${index}`} className="relative hover:bg-gray-700 transition-colors duration-100">
                      {/* Background bar for depth visualization */}
                      <td colSpan={3} className="absolute inset-0 z-0">
                        <div 
                          className="h-full bg-green-700/20" 
                          style={{ width: `${percentOfMax}%` }}
                        />
                      </td>
                      {/* Content on top of the bar */}
                      <td className="text-green-400 py-1 relative z-10 font-medium">{priceNum.toFixed(2)}</td>
                      <td className="text-right py-1 relative z-10">{quantityNum.toFixed(5)}</td>
                      <td className="text-right text-gray-400 py-1 relative z-10">${(priceNum * quantityNum).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orderbook