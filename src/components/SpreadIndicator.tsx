"use client"
// components/SpreadIndicator.tsx
import React, { useEffect, useState } from 'react'
import { OrderbookData } from '../lib/types'

interface SpreadIndicatorProps {
  data: OrderbookData | null
}

const SpreadIndicator: React.FC<SpreadIndicatorProps> = ({ data }) => {
  const [spread, setSpread] = useState<number | null>(null)

  useEffect(() => {
    if (data) {
      const bestBid = parseFloat(data.bids[0][0]) // Best bid price
      const bestAsk = parseFloat(data.asks[0][0]) // Best ask price
      setSpread(bestAsk - bestBid)
    }
  }, [data])

  if (spread === null) {
    return <div>Loading...</div>
  }

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold mb-4">Spread Indicator</h2>
      <div className="border p-4 rounded-lg bg-gray-100">
        <h3 className="font-semibold text-xl mb-2">Current Spread</h3>
        <p className="text-xl font-medium text-blue-600">
          {spread.toFixed(2)} USD
        </p>
      </div>
    </div>
  )
}

export default SpreadIndicator
