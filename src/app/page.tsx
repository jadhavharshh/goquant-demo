"use client"
import React, { useEffect, useState, useRef } from 'react'
import { OrderbookData } from '../lib/types'
import Orderbook from '../components/Orderbook'
import SpreadIndicator from '../components/SpreadIndicator'
import OrderbookImbalance from '../components/OrderbookImbalance'
import MarketDepthChart from '../components/MarketDepthChart'
import TradingPairSelector from '@/components/TradingPairSelector'

const Page: React.FC = () => {
  const [orderbookData, setOrderbookData] = useState<OrderbookData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1D")
  const [orderType, setOrderType] = useState<string>("limit")
  const [orderSide, setOrderSide] = useState<string>("buy")
  const [quantity, setQuantity] = useState<string>("0.01")
  const [price, setPrice] = useState<string>("0")
  const [tradingPair, setTradingPair] = useState("BTCUSDT")
  
  // WebSocket reference
  const ws = useRef<WebSocket | null>(null)
  
  // Handle trading pair changes
  const handlePairChange = (newPair: string) => {
    console.log(`Changing trading pair from ${tradingPair} to ${newPair}`)
    
    // Clear current data when changing pairs
    setOrderbookData(null)
    setIsLoading(true)
    
    // Update the trading pair state
    setTradingPair(newPair)
  }
  
  // Setup WebSocket connection
  useEffect(() => {
    console.log(`Setting up WebSocket for ${tradingPair}`)
    
    // Close any existing connection
    if (ws.current) {
      console.log('Closing existing WebSocket connection')
      ws.current.close()
    }
    
    // Create new WebSocket connection
    const wsUrl = `wss://stream.binance.com:9443/ws/${tradingPair.toLowerCase()}@depth20@100ms`
    console.log(`Connecting to: ${wsUrl}`)
    
    const socket = new WebSocket(wsUrl)
    ws.current = socket
    
    // Connection opened
    socket.onopen = () => {
      console.log(`WebSocket connected for ${tradingPair}`)
      setIsLoading(false)
    }
    
    // Listen for messages
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Ensure data has the expected structure
        if (data && data.bids && data.asks) {
          // Convert to your existing format
          const formattedData: OrderbookData = {
            bids: data.bids,
            asks: data.asks
          }
          
          setOrderbookData(formattedData)
          setLastUpdated(new Date())
          
          // Update current price
          if (formattedData.bids.length > 0 && formattedData.asks.length > 0) {
            const bestBid = parseFloat(formattedData.bids[0][0])
            const bestAsk = parseFloat(formattedData.asks[0][0])
            const midPrice = (bestBid + bestAsk) / 2
            
            // Calculate price change
            if (currentPrice) {
              setPriceChange(midPrice - currentPrice)
            }
            
            setCurrentPrice(midPrice)
            setPrice(midPrice.toFixed(2))
          }
        } else {
          console.error('Unexpected WebSocket data format:', data)
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error)
      }
    }
    
    // Handle errors
    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsLoading(false)
    }
    
    // Connection closed
    socket.onclose = () => {
      console.log(`WebSocket closed for ${tradingPair}`)
    }
    
    // Cleanup on unmount or when tradingPair changes
    return () => {
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        console.log(`Cleanup: closing WebSocket for ${tradingPair}`)
        socket.close()
      }
    }
  }, [tradingPair]) // Reconnect when trading pair changes
  
  // Format the current trading pair for display in header
  const formattedTradingPair = tradingPair.replace('USDT', '/USDT')
  const currencySymbol = tradingPair.replace('USDT', '')

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col">
      {/* Top navigation bar - Binance style */}
      <nav className="bg-[#0b0e11] text-[#eaecef] border-b border-[#232a32] px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-[#f0b90b]">GoQuant Trading</h1>
            <div className="hidden md:flex space-x-1">
              <a href="#" className="px-3 py-1.5 text-sm hover:text-[#f0b90b] border-b-2 border-[#f0b90b]">Dashboard</a>
              <a href="#" className="px-3 py-1.5 text-sm hover:text-[#f0b90b] border-b-2 border-transparent">Markets</a>
              <a href="#" className="px-3 py-1.5 text-sm hover:text-[#f0b90b] border-b-2 border-transparent">Portfolio</a>
              <a href="#" className="px-3 py-1.5 text-sm hover:text-[#f0b90b] border-b-2 border-transparent">Orders</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[#848e9c] text-xs">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : ''}
            </span>
            <div className="relative w-7 h-7 rounded-full bg-[#f0b90b] flex items-center justify-center text-xs font-medium text-[#0b0e11]">
              US
            </div>
          </div>
        </div>
      </nav>

      {/* Market summary bar - Binance style */}
      <div className="bg-[#161b22] border-b border-[#232a32] px-4 py-2">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-lg font-bold">{formattedTradingPair}</div>
            {currentPrice && (
              <div className="text-lg font-medium">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            <div className={`text-sm ${priceChange >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'} flex items-center`}>
              {priceChange >= 0 ? (
                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {Math.abs(priceChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="flex space-x-1 mt-1 md:mt-0">
            <TradingPairSelector 
              currentPair={tradingPair} 
              onPairChange={handlePairChange} 
            />
            {["1H", "4H", "1D", "1W", "1M"].map(timeframe => (
              <button 
                key={timeframe}
                className={`px-2 py-0.5 rounded text-xs ${
                  selectedTimeframe === timeframe 
                    ? 'bg-[#2b3139] text-[#f0b90b] font-medium' 
                    : 'bg-[#1e2329] text-[#848e9c] hover:bg-[#2b3139]'
                }`}
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main trading interface */}
      <main className="flex-grow grid grid-cols-12 gap-0">
        {/* Loading overlay */}
        {isLoading && !orderbookData && (
          <div className="absolute inset-0 bg-[#0b0e11]/80 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center bg-[#1e2329] p-5 rounded-lg shadow-lg">
              <svg className="animate-spin h-8 w-8 text-[#f0b90b] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-[#eaecef]">Loading market data for {currencySymbol}...</p>
            </div>
          </div>
        )}

        {/* Left sidebar - Orderbook - Binance style */}
        <div className="col-span-12 md:col-span-3 border-r border-[#232a32]">
          <div className="h-full p-2">
            <Orderbook data={orderbookData} currencySymbol={currencySymbol} />
          </div>
        </div>

        {/* Main chart area - Binance style */}
        <div className="col-span-12 md:col-span-9 p-2">
          <div className="h-96 mb-2 bg-[#161b22] border border-[#232a32] rounded">
            <div className="flex justify-between items-center px-3 py-2 border-b border-[#232a32]">
              <h2 className="text-sm font-medium text-[#eaecef]">Market Depth</h2>
              <div className="flex space-x-1 text-xs">
                <button className="px-2 py-0.5 bg-[#1e2329] rounded hover:bg-[#2b3139]">
                  <svg className="w-3 h-3 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
                <button className="px-2 py-0.5 bg-[#1e2329] rounded hover:bg-[#2b3139]">
                  <svg className="w-3 h-3 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Range
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-36px)]">
              <MarketDepthChart data={orderbookData} currencySymbol={currencySymbol} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#161b22] border border-[#232a32] rounded">
              <div className="flex justify-between items-center px-3 py-2 border-b border-[#232a32]">
                <h2 className="text-sm font-medium text-[#eaecef]">Spread History</h2>
                <div className="text-xs text-[#848e9c]">1-min rolling window</div>
              </div>
              <div className="h-48 p-2">
                <SpreadIndicator data={orderbookData} />
              </div>
            </div>
            
            <div className="bg-[#161b22] border border-[#232a32] rounded">
              <div className="flex justify-between items-center px-3 py-2 border-b border-[#232a32]">
                <h2 className="text-sm font-medium text-[#eaecef]">Order Book Imbalance</h2>
                <div className="text-xs text-[#848e9c]">Buy/Sell Pressure</div>
              </div>
              <div className="h-48 p-2">
                <OrderbookImbalance data={orderbookData} currencySymbol={currencySymbol} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Market status */}
      <footer className="bg-[#161b22] border-t border-[#232a32] py-1.5 px-4 text-xs">
        <div className="flex justify-between items-center text-[#848e9c]">
          <div>Market Status: <span className="text-[#0ecb81] font-medium">Open</span></div>
          <div>24h Volume: <span className="text-[#eaecef]">$1,423,651,288</span></div>
          <div>Server Time: {new Date().toLocaleTimeString()}</div>
          <div>© 2025 GoQuant Trading</div>
        </div>
      </footer>
    </div>
  )
}

export default Page