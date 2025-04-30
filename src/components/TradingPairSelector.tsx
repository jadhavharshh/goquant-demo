import React from 'react';

interface TradingPairSelectorProps {
  currentPair: string;
  onPairChange: (pair: string) => void;
}

const TradingPairSelector: React.FC<TradingPairSelectorProps> = ({ 
  currentPair, 
  onPairChange 
}) => {
  const tradingPairs = [
    { symbol: "BTCUSDT", label: "BTC-USDT" },
    { symbol: "ETHUSDT", label: "ETH-USDT" },
    { symbol: "XRPUSDT", label: "XRP-USDT" },
    { symbol: "DOGEUSDT", label: "DOGE-USDT" },
    { symbol: "SOLUSDT", label: "SOL-USDT" }
  ];

  return (
    <div className="p-2 bg-[#161b22] rounded-md shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-[#848e9c] text-sm">Trading Pair:</span>
        <select
          value={currentPair}
          onChange={(e) => {
            console.log("Selected:", e.target.value); // Debug log
            onPairChange(e.target.value);
          }}
          className="bg-[#1e2329] text-white p-1.5 rounded border border-[#232a32] text-sm focus:outline-none focus:ring-1 focus:ring-[#f0b90b]"
        >
          {tradingPairs.map((pair) => (
            <option key={pair.symbol} value={pair.symbol}>
              {pair.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TradingPairSelector;