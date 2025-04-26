// components/Orderbook.tsx
import React from 'react'
import { OrderbookData } from '../lib/types'

interface OrderbookProps {
  data: OrderbookData | null
}

const Orderbook: React.FC<OrderbookProps> = ({ data }) => {
  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold mb-4">Orderbook</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Bids */}
        <div className="border p-4 rounded-lg bg-gray-100">
          <h3 className="font-semibold text-xl mb-2">Bids</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Price</th>
                <th className="text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.bids.map(([price, quantity], index) => (
                <tr key={index}>
                  <td className="text-green-500">{parseFloat(price).toFixed(2)}</td>
                  <td>{parseFloat(quantity).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Asks */}
        <div className="border p-4 rounded-lg bg-gray-100">
          <h3 className="font-semibold text-xl mb-2">Asks</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Price</th>
                <th className="text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.asks.map(([price, quantity], index) => (
                <tr key={index}>
                  <td className="text-red-500">{parseFloat(price).toFixed(2)}</td>
                  <td>{parseFloat(quantity).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Orderbook
