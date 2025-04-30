import React, { useMemo, useState } from 'react'
import { OrderbookData } from '../lib/types'

interface OrderbookProps {
  data: OrderbookData | null;
  currencySymbol?: string;
}

const Orderbook: React.FC<OrderbookProps> = ({ data, currencySymbol = 'BTC' }) => {
  // Number of rows to display for each side
  const [displayRows, setDisplayRows] = useState<number>(12);
  
  // Price precision toggle
  const [pricePrecision, setPricePrecision] = useState<string>("0.1");

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

  // Handle price precision change
  const handlePrecisionChange = (precision: string) => {
    setPricePrecision(precision);
  };

  // Handle row count change
  const handleRowCountChange = (count: number) => {
    setDisplayRows(count);
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

  // Get limited sets of asks and bids based on displayRows
  const visibleAsks = [...data.asks].slice(0, displayRows);
  const visibleBids = [...data.bids].slice(0, displayRows);

  return (
    <div className="w-full h-full">
      <div className="bg-[#161b22] border border-[#232a32] rounded shadow-sm h-full flex flex-col">
        {/* Header section with controls */}
        <div className="flex justify-between items-center px-3 py-2 border-b border-[#232a32]">
          <h2 className="text-sm font-normal text-[#eaecef]">Order Book</h2>
          <div className="flex space-x-2 text-xs">
            {/* Precision controls */}
            <div className="flex">
              {["0.1", "0.5", "1.0"].map((precision) => (
                <button
                  key={precision}
                  className={`px-1.5 py-0.5 ${
                    pricePrecision === precision 
                      ? 'bg-[#2b3139] text-[#f0b90b]' 
                      : 'bg-[#1e2329] text-[#848e9c] hover:bg-[#2b3139]/50'
                  } ${precision === "0.1" ? "rounded-l" : ""} ${
                    precision === "1.0" ? "rounded-r" : ""
                  }`}
                  onClick={() => handlePrecisionChange(precision)}
                >
                  {precision}
                </button>
              ))}
            </div>
            
            {/* Row count controls */}
            <div className="flex">
              {[8, 12, 16].map((count) => (
                <button
                  key={count}
                  className={`px-1.5 py-0.5 ${
                    displayRows === count 
                      ? 'bg-[#2b3139] text-[#f0b90b]' 
                      : 'bg-[#1e2329] text-[#848e9c] hover:bg-[#2b3139]/50'
                  } ${count === 8 ? "rounded-l" : ""} ${
                    count === 16 ? "rounded-r" : ""
                  }`}
                  onClick={() => handleRowCountChange(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-3 flex-1 flex flex-col">
          {/* Metrics panels */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[#182433] rounded-lg p-1.5 text-center shadow-md border border-[#232f3e]/60">
              <div className="text-[10px] text-[#99a4b2] mb-0.5">Spread</div>
              <div className="text-[#f0b90b] text-xs font-normal">
                {spread ? spread.amount.toFixed(2) : "-"}
                <span className="text-[#99a4b2] text-[9px] ml-1">
                  ({spread ? spread.percent.toFixed(2) : "-"}%)
                </span>
              </div>
            </div>

            <div className="bg-[#182433] rounded-lg p-1.5 text-center shadow-md border border-[#232f3e]/60">
              <div className="text-[10px] text-[#99a4b2] mb-0.5">Volume Ratio</div>
              <div className={`text-xs font-normal ${(volumes.ratio ?? 0) > 1 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                {(volumes.ratio ?? 0).toFixed(2)}
                <span className="text-[#99a4b2] text-[9px] ml-1">B/A</span>
              </div>
            </div>

            <div className="bg-[#182433] rounded-lg p-1.5 text-center shadow-md border border-[#232f3e]/60">
              <div className="text-[10px] text-[#99a4b2] mb-0.5">Depth</div>
              <div className="text-[#eaecef] text-xs font-normal">
                {(volumes.bids + volumes.asks).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
                <span className="text-[#99a4b2] text-[9px] ml-1">USD</span>
              </div>
            </div>
          </div>

          {/* Orderbook content - Fixed rows without scrollbars */}
          <div className="flex-1 flex flex-col">
            {/* Column headers */}
            <div className="grid grid-cols-3 text-[11px] text-[#848e9c] mb-1 px-2">
              <div className="font-light">Price (USD)</div>
              <div className="font-light text-right">Amount ({currencySymbol})</div>
              <div className="font-light text-right">Total</div>
            </div>
            
            {/* Asks - reversed to show lowest ask at bottom */}
            <div className="flex-1">
              <div className="space-y-0.5">
                {visibleAsks.map(([price, quantity], index) => {
                  const priceNum = parseFloat(price);
                  const quantityNum = parseFloat(quantity);
                  const percentOfMax = (quantityNum / maxQuantity) * 100;
                  const alpha = Math.max(0.05, Math.min(0.2, percentOfMax / 100));

                  return (
                    <div 
                      key={`ask-${index}`} 
                      className="relative group h-5 grid grid-cols-3 items-center hover:bg-[#2b3139]/30 transition-colors duration-100"
                    >
                      <div className="px-2 z-10 font-normal text-xs text-[#f6465d]">
                        {priceNum.toFixed(2)}
                      </div>
                      <div className="px-2 z-10 text-right text-xs">
                        {quantityNum.toFixed(5)}
                      </div>
                      <div className="px-2 z-10 text-right text-xs text-[#848e9c]">
                        ${(priceNum * quantityNum).toFixed(2)}
                      </div>
                      {/* Background depth visualization */}
                      <div 
                        className="absolute top-0 right-0 bottom-0 text-xs bg-[#f6465d] transition-all duration-200 ease-out group-hover:opacity-30"
                        style={{ width: `${percentOfMax}%`, opacity: alpha }}
                      />
                    </div>
                  );
                }).reverse()}
              </div>
            </div>
            
            {/* Spread indicator */}
            {spread && (
              <div className="py-1 px-2 my-1 bg-[#1e2329] rounded flex justify-between items-center text-xs">
                <span className="text-[#848e9c]">Spread</span>
                <span className="font-normal text-[#eaecef]">
                  {spread.amount.toFixed(2)} <span className="text-[#848e9c]">({spread.percent.toFixed(2)}%)</span>
                </span>
              </div>
            )}
            
            {/* Bids */}
            <div className="flex-1">
              <div className="space-y-0.5">
                {visibleBids.map(([price, quantity], index) => {
                  const priceNum = parseFloat(price);
                  const quantityNum = parseFloat(quantity);
                  const percentOfMax = (quantityNum / maxQuantity) * 100;
                  const alpha = Math.max(0.05, Math.min(0.2, percentOfMax / 100));

                  return (
                    <div 
                      key={`bid-${index}`} 
                      className="relative group h-5 grid grid-cols-3 items-center hover:bg-[#2b3139]/30 transition-colors duration-100"
>
                      <div className="px-2 z-10 font-normal text-[#0ecb81] text-xs">
                        {priceNum.toFixed(2)}
                      </div>
                      <div className="px-2 z-10 text-right text-xs">
                        {quantityNum.toFixed(5)}
                      </div>
                      <div className="px-2 z-10 text-right text-[#848e9c] text-xs">
                        ${(priceNum * quantityNum).toFixed(2)}
                      </div>
                      {/* Background depth visualization */}
                      <div 
                        className="absolute top-0 left-0 bottom-0 bg-[#0ecb81] opacity-10 transition-all duration-200 ease-out group-hover:opacity-30"
                        style={{ width: `${percentOfMax}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orderbook