// Create a new file to fetch the orderbook, e.g., `lib/api.js`
export const fetchOrderbook = async () => {
    const res = await fetch('https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=10');
    const data = await res.json();
    return data;
  }
  