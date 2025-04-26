import React from 'react'
import { OrderbookData } from '../lib/types'

interface OrderbookProps {
  data: OrderbookData | null
}

const Orderbook: React.FC<OrderbookProps> = ({ data }) => {
  if (!data) {
    return <div className="flex justify-center items-center py-4 text-gray-400">Loading orderbook data...</div>
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-2">
        {/* Bids */}
        <div>
          <div className="mb-1 text-gray-400 text-xs font-medium">Bids</div>
          <div className="overflow-y-auto max-h-[calc(50vh-120px)]">
            <table className="w-full text-sm">
              <thead className="text-gray-400 text-xs">
                <tr>
                  <th className="text-left pb-2">Price</th>
                  <th className="text-right pb-2">Quantity</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.bids.map(([price, quantity], index) => {
                  const priceNum = parseFloat(price);
                  const quantityNum = parseFloat(quantity);
                  return (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="text-green-500 py-1">{priceNum.toFixed(2)}</td>
                      <td className="text-right py-1">{quantityNum.toFixed(4)}</td>
                      <td className="text-right text-gray-400 py-1">${(priceNum * quantityNum).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asks */}
        <div className="mt-3">
          <div className="mb-1 text-gray-400 text-xs font-medium">Asks</div>
          <div className="overflow-y-auto max-h-[calc(50vh-120px)]">
            <table className="w-full text-sm">
              <thead className="text-gray-400 text-xs">
                <tr>
                  <th className="text-left pb-2">Price</th>
                  <th className="text-right pb-2">Quantity</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.asks.map(([price, quantity], index) => {
                  const priceNum = parseFloat(price);
                  const quantityNum = parseFloat(quantity);
                  return (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="text-red-500 py-1">{priceNum.toFixed(2)}</td>
                      <td className="text-right py-1">{quantityNum.toFixed(4)}</td>
                      <td className="text-right text-gray-400 py-1">${(priceNum * quantityNum).toFixed(2)}</td>
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