// components/OrderbookImbalance.tsx
import React, { useEffect, useState } from 'react'
import { OrderbookData } from '../lib/types'

interface OrderbookImbalanceProps {
  data: OrderbookData | null
}

const OrderbookImbalance: React.FC<OrderbookImbalanceProps> = ({ data }) => {
  const [imbalance, setImbalance] = useState<number | null>(null)

  useEffect(() => {
    if (data) {
      const totalBidQuantity = data.bids.reduce((sum, [price, quantity]) => sum + parseFloat(quantity), 0)
      const totalAskQuantity = data.asks.reduce((sum, [price, quantity]) => sum + parseFloat(quantity), 0)

      const imbalance = totalBidQuantity - totalAskQuantity
      setImbalance(imbalance)
    }
  }, [data])

  if (imbalance === null) {
    return <div>Loading...</div>
  }

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold mb-4">Orderbook Imbalance</h2>
      <div className="border p-4 rounded-lg bg-gray-100">
        <h3 className="font-semibold text-xl mb-2">Imbalance</h3>
        <p
          className={`text-xl font-medium ${imbalance > 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {imbalance.toFixed(2)} BTC
        </p>
      </div>
    </div>
  )
}

export default OrderbookImbalance
