import React, { useMemo } from 'react'
import { OrderbookData } from '../lib/types'

interface OrderbookProps {
  data: OrderbookData | null;
  currencySymbol?: string;
}

const Orderbook: React.FC<OrderbookProps> = ({ data, currencySymbol = 'BTC' }) => {

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

  // Calculate total bid/ask volume
  const volumes = useMemo(() => {
    if (!data) return { bids: 0, asks: 0 };
    
    const bidVolume = data.bids.reduce((sum, [price, qty]) => sum + parseFloat(price) * parseFloat(qty), 0);
    const askVolume = data.asks.reduce((sum, [price, qty]) => sum + parseFloat(price) * parseFloat(qty), 0);
    
    return {
      bids: bidVolume,
      asks: askVolume,
      ratio: bidVolume / (askVolume || 1)
    };
  }, [data]);

  // Calculate price range
  const priceRange = useMemo(() => {
    if (!data || data.bids.length === 0 || data.asks.length === 0) return null;
    
    const lowestBid = parseFloat(data.bids[data.bids.length - 1][0]);
    const highestAsk = parseFloat(data.asks[data.asks.length - 1][0]);
    
    return {
      low: lowestBid,
      high: highestAsk,
      range: highestAsk - lowestBid
    };
  }, [data]);

  // Define consistent column classes for alignment
  const columnClasses = {
    price: "w-[35%] py-0.5 px-1 relative z-10",
    amount: "w-[30%] text-right py-0.5 px-1 relative z-10",
    total: "w-[35%] text-right py-0.5 px-1 relative z-10"
  };

  if (!data) {
    return (
      <div className="flex justify-center items-center h-full text-[#848e9c]">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#f0b90b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading orderbook...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Single unified floating container */}
      <div className="bg-[#161b22] border border-[#232a32] rounded shadow-sm h-full flex flex-col">
        {/* Header section */}
        <div className="flex justify-between items-center px-3 py-2 border-b border-[#232a32]">
          <h2 className="text-sm font-medium text-[#eaecef]">Order Book</h2>
          <div className="flex text-xs">
            <button className="px-1.5 py-0.5 bg-[#1e2329] rounded-l text-[#f0b90b]">
              0.1
            </button>
            <button className="px-1.5 py-0.5 bg-[#1e2329]">
              0.5
            </button>
            <button className="px-1.5 py-0.5 bg-[#1e2329] rounded-r">
              1.0
            </button>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="p-3 flex-1 flex flex-col">
          {/* Metrics panels */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[#182433] rounded-lg p-1.5 text-center shadow-md border border-[#232f3e]/60">
              <div className="text-[10px] text-[#99a4b2] mb-0.5">Spread</div>
              <div className="text-[#f0b90b] text-xs font-medium">
                {spread ? spread.amount.toFixed(2) : "-"}
                <span className="text-[#99a4b2] text-[9px] ml-1">
                  ({spread ? spread.percent.toFixed(2) : "-"}%)
                </span>
              </div>
            </div>
            
            <div className="bg-[#182433] rounded-lg p-1.5 text-center shadow-md border border-[#232f3e]/60">
              <div className="text-[10px] text-[#99a4b2] mb-0.5">Volume Ratio</div>
              <div className={`text-xs font-medium ${(volumes.ratio ?? 0) > 1 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                {(volumes.ratio ?? 0).toFixed(2)}
                <span className="text-[#99a4b2] text-[9px] ml-1">B/A</span>
              </div>
            </div>
            
            <div className="bg-[#182433] rounded-lg p-1.5 text-center shadow-md border border-[#232f3e]/60">
              <div className="text-[10px] text-[#99a4b2] mb-0.5">Depth</div>
              <div className="text-[#eaecef] text-xs">
                {(volumes.bids + volumes.asks).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
                <span className="text-[#99a4b2] text-[9px] ml-1">USD</span>
              </div>
            </div>
          </div>
          
          {/* Optional spread indicator */}
          {spread && (
            <div className="text-xs py-1 px-2 mb-2 bg-[#1e2329] rounded flex justify-between items-center">
              <span className="text-[#848e9c]">Spread</span>
              <span className="font-medium text-[#eaecef]">
                {spread.amount.toFixed(2)} <span className="text-[#848e9c]">({spread.percent.toFixed(2)}%)</span>
              </span>
            </div>
          )}
          
          {/* Orderbook content */}
          <div className="flex-1 grid grid-cols-1 gap-0">
            {/* Asks - reversed to show highest on top */}
            <div>
              <div className="overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-[#2b3139] scrollbar-track-[#1e2329]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#161b22] z-10">
                    <tr className="text-[#848e9c]">
                      <th className={`${columnClasses.price} font-medium text-[11px]`}>Price (USD)</th>
                      <th className={`${columnClasses.amount} font-medium text-[11px]`}>Amount ({currencySymbol})</th>
                      <th className={`${columnClasses.total} font-medium text-[11px]`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.asks].reverse().map(([price, quantity], index) => {
                      const priceNum = parseFloat(price);
                      const quantityNum = parseFloat(quantity);
                      const percentOfMax = (quantityNum / maxQuantity) * 100;
                      
                      return (
                        <tr key={`ask-${index}`} className="relative hover:bg-[#2b3139]/30 transition-colors duration-100">
                          {/* Background bar for depth visualization */}
                          <td colSpan={3} className="absolute inset-0 z-0">
                            <div 
                              className="h-full bg-[#f6465d]/10" 
                              style={{ width: `${percentOfMax}%`, marginLeft: 'auto' }}
                            />
                          </td>
                          {/* Content on top of the bar */}
                          <td className={`${columnClasses.price} text-[#f6465d] font-medium`}>{priceNum.toFixed(2)}</td>
                          <td className={columnClasses.amount}>{quantityNum.toFixed(5)}</td>
                          <td className={`${columnClasses.total} text-[#848e9c]`}>${(priceNum * quantityNum).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bids */}
            <div className="border-t border-[#232a32]">
              <div className="overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-[#2b3139] scrollbar-track-[#1e2329]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#161b22] z-10">
                    <tr className="text-[#848e9c]">
                      <th className={`${columnClasses.price} font-medium text-[11px]`}>Price (USD)</th>
                      <th className={`${columnClasses.amount} font-medium text-[11px]`}>Amount ({currencySymbol})</th>
                      <th className={`${columnClasses.total} font-medium text-[11px]`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bids.map(([price, quantity], index) => {
                      const priceNum = parseFloat(price);
                      const quantityNum = parseFloat(quantity);
                      const percentOfMax = (quantityNum / maxQuantity) * 100;
                      
                      return (
                        <tr key={`bid-${index}`} className="relative hover:bg-[#2b3139]/30 transition-colors duration-100">
                          {/* Background bar for depth visualization */}
                          <td colSpan={3} className="absolute inset-0 z-0">
                            <div 
                              className="h-full bg-[#0ecb81]/10" 
                              style={{ width: `${percentOfMax}%` }}
                            />
                          </td>
                          {/* Content on top of the bar */}
                          <td className={`${columnClasses.price} text-[#0ecb81] font-medium`}>{priceNum.toFixed(2)}</td>
                          <td className={columnClasses.amount}>{quantityNum.toFixed(5)}</td>
                          <td className={`${columnClasses.total} text-[#848e9c]`}>${(priceNum * quantityNum).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orderbook