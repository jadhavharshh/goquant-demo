// pages/index.tsx
"use client"
import React, { useEffect, useState } from 'react'
import { fetchOrderbook } from '../lib/api'
import Orderbook from '../components/Orderbook'
import SpreadIndicator from '../components/SpreadIndicator'
import OrderbookImbalance from '../components/OrderbookImbalance'
import MarketDepthChart from '../components/MarketDepthChart'

const page: React.FC = () => {
  const [orderbookData, setOrderbookData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchOrderbook()
      setOrderbookData(data)
    }

    fetchData()

    const interval = setInterval(fetchData, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">GoQuant Dashboard</h1>
      
      {/* Orderbook Section */}
      <Orderbook data={orderbookData} />

      {/* Spread Indicator Section */}
      <SpreadIndicator data={orderbookData} />

      {/* Orderbook Imbalance Section */}
      <OrderbookImbalance data={orderbookData} />

      {/* Market Depth Chart Section */}
      <MarketDepthChart data={orderbookData} />
    </div>
  )
}

export default page
