"use client"
import React, { useEffect, useState } from 'react'
import { fetchOrderbook } from '../lib/api'
import { OrderbookData } from '../lib/types'
import Orderbook from '../components/Orderbook'
import SpreadIndicator from '../components/SpreadIndicator'
import OrderbookImbalance from '../components/OrderbookImbalance'
import MarketDepthChart from '../components/MarketDepthChart'

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchOrderbook()
        setOrderbookData(data)
        setLastUpdated(new Date())
        
        // Set current price based on mid-price
        if (data) {
          const bestBid = parseFloat(data.bids[0][0])
          const bestAsk = parseFloat(data.asks[0][0])
          const midPrice = (bestBid + bestAsk) / 2
          
          // Calculate price change (simulated here)
          if (currentPrice) {
            setPriceChange(midPrice - currentPrice)
          }
          
          setCurrentPrice(midPrice)
          setPrice(midPrice.toFixed(2))
        }
      } catch (error) {
        console.error('Error fetching orderbook data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 1000) // Update every second
    return () => clearInterval(interval)
  }, [currentPrice])

  const handleManualRefresh = async () => {
    try {
      setIsLoading(true)
      const data = await fetchOrderbook()
      setOrderbookData(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching orderbook data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Top navigation bar */}
      <nav className="bg-black text-white border-b border-gray-800 px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-blue-400">GoQuant Trading</h1>
            <div className="hidden md:flex space-x-4">
              <a href="#" className="hover:text-blue-400 px-2 py-1">Dashboard</a>
              <a href="#" className="hover:text-blue-400 px-2 py-1">Markets</a>
              <a href="#" className="hover:text-blue-400 px-2 py-1">Portfolio</a>
              <a href="#" className="hover:text-blue-400 px-2 py-1">Orders</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : ''}
            </span>
            <button 
              onClick={handleManualRefresh}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded border border-gray-700"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Refresh'}
            </button>
            <div className="relative w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="font-medium">US</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Market summary bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold">BTC/USD</div>
            {currentPrice && (
              <div className="text-2xl">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            <div className={`text-lg ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="flex space-x-2 mt-2 md:mt-0">
            {["1H", "4H", "1D", "1W", "1M"].map(timeframe => (
              <button 
                key={timeframe}
                className={`px-3 py-1 rounded text-sm ${selectedTimeframe === timeframe ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main trading interface */}
      <main className="container mx-auto px-4 py-4">
        {/* Loading overlay */}
        {isLoading && !orderbookData && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-200">Loading market data...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          {/* Left sidebar - Order entry */}
          <div className="col-span-12 md:col-span-6 lg:col-span-7">
  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
    <h2 className="text-lg font-medium mb-3 text-gray-200 border-b border-gray-700 pb-2">Market Depth</h2>
    <div className="h-72">
      <MarketDepthChart data={orderbookData} />
    </div>
  </div>
  
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h2 className="text-lg font-medium mb-3 text-gray-200 border-b border-gray-700 pb-2">Spread History</h2>
      <div className="h-56">
        <SpreadIndicator data={orderbookData} />
      </div>
    </div>
    
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h2 className="text-lg font-medium mb-3 text-gray-200 border-b border-gray-700 pb-2">Order Book Imbalance</h2>
      <div className="h-56">
        <OrderbookImbalance data={orderbookData} />
      </div>
    </div>
  </div>
</div>

{/* Right sidebar - Orderbook */}
<div className="col-span-12 md:col-span-3 lg:col-span-3">
  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sticky top-4">
    <h2 className="text-lg font-medium mb-3 text-gray-200 border-b border-gray-700 pb-2">Order Book</h2>
    <Orderbook data={orderbookData} />
  </div>
</div>
        </div>
      </main>

      {/* Footer - Market status */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-4 py-2 px-6">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div>Market Status: <span className="text-green-500">Open</span></div>
          <div>24h Volume: <span className="text-white">$1,423,651,288</span></div>
          <div>Server Time: {new Date().toLocaleTimeString()}</div>
          <div>© 2025 GoQuant Trading</div>
        </div>
      </footer>
    </div>
  )
}

export default Page