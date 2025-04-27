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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Top navigation bar */}
      <nav className="bg-black text-white border-b border-gray-800 px-4 py-2 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-blue-400">GoQuant Trading</h1>
            <div className="hidden md:flex space-x-4">
              <a href="#" className="hover:text-blue-400 px-2 py-1 border-b-2 border-blue-500">Dashboard</a>
              <a href="#" className="hover:text-blue-400 px-2 py-1 border-b-2 border-transparent">Markets</a>
              <a href="#" className="hover:text-blue-400 px-2 py-1 border-b-2 border-transparent">Portfolio</a>
              <a href="#" className="hover:text-blue-400 px-2 py-1 border-b-2 border-transparent">Orders</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-xs">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : ''}
            </span>
            <button 
              onClick={handleManualRefresh}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded border border-gray-700 text-sm flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
            <div className="relative w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium">
              US
            </div>
          </div>
        </div>
      </nav>

      {/* Market summary bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-xl font-bold">BTC/USD</div>
            {currentPrice && (
              <div className="text-xl">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            <div className={`text-base ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              {priceChange >= 0 ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {Math.abs(priceChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="flex space-x-2 mt-2 md:mt-0">
            {["1H", "4H", "1D", "1W", "1M"].map(timeframe => (
              <button 
                key={timeframe}
                className={`px-3 py-1 rounded text-xs ${
                  selectedTimeframe === timeframe 
                    ? 'bg-blue-600 text-white font-medium shadow-inner' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
      <main className="flex-grow container mx-auto px-4 py-4">
        {/* Loading overlay */}
        {isLoading && !orderbookData && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-lg">
              <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-200">Loading market data...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          {/* Left sidebar - Charts */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 mb-4 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-medium text-gray-200">Market Depth</h2>
                <div className="flex space-x-2 text-xs">
                  <button className="px-2 py-0.5 bg-gray-700 rounded hover:bg-gray-600">
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                  <button className="px-2 py-0.5 bg-gray-700 rounded hover:bg-gray-600">
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Range
                  </button>
                </div>
              </div>
              <div className="h-72 border border-gray-700 rounded bg-gray-900/50">
                <MarketDepthChart data={orderbookData} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-base font-medium text-gray-200">Spread History</h2>
                  <div className="text-xs text-gray-400">1-min rolling window</div>
                </div>
                <div className="h-56 border border-gray-700 rounded bg-gray-900/50">
                  <SpreadIndicator data={orderbookData} />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-base font-medium text-gray-200">Order Book Imbalance</h2>
                  <div className="text-xs text-gray-400">Buy/Sell Pressure</div>
                </div>
                <div className="h-56 border border-gray-700 rounded bg-gray-900/50">
                  <OrderbookImbalance data={orderbookData} />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar - Orderbook */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 sticky top-4 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-medium text-gray-200">Order Book</h2>
                <div className="flex space-x-1 text-xs">
                  <button className="px-1.5 py-0.5 bg-gray-700 rounded-l hover:bg-gray-600">
                    0.1
                  </button>
                  <button className="px-1.5 py-0.5 bg-gray-900 hover:bg-gray-600">
                    0.5
                  </button>
                  <button className="px-1.5 py-0.5 bg-gray-700 rounded-r hover:bg-gray-600">
                    1.0
                  </button>
                </div>
              </div>
              <Orderbook data={orderbookData} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Market status */}
      <footer className="bg-gray-800 border-t border-gray-700 py-2 px-6 text-xs">
        <div className="flex justify-between items-center text-gray-400">
          <div>Market Status: <span className="text-green-500 font-medium">Open</span></div>
          <div>24h Volume: <span className="text-white">$1,423,651,288</span></div>
          <div>Server Time: {new Date().toLocaleTimeString()}</div>
          <div>© 2025 GoQuant Trading</div>
        </div>
      </footer>
    </div>
  )
}

export default Page