import { useState, useEffect, useRef } from 'react';
import { OrderbookData } from '@/lib/types';

export default function useBinanceWebSocket(symbol: string): OrderbookData | null {
  const [orderbookData, setOrderbookData] = useState<OrderbookData | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log(`Setting up WebSocket for ${symbol}`); // Debug log
    
    // Important: Clear previous data when symbol changes
    setOrderbookData(null);
    
    // Close existing connection when symbol changes
    if (ws.current) {
      console.log(`Closing existing WebSocket connection`);
      ws.current.close();
    }

    // Create new connection with updated symbol
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`;
    console.log(`Connecting to: ${wsUrl}`);
    
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log(`WebSocket connected for ${symbol}`);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Ensure data has the expected structure
        if (data && data.bids && data.asks) {
          const formattedData: OrderbookData = {
            bids: data.bids,
            asks: data.asks
          };
          
          setOrderbookData(formattedData);
        } else {
          console.error('Unexpected WebSocket data format:', data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log(`WebSocket closed for ${symbol}`);
    };

    return () => {
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        console.log(`Cleanup: closing WebSocket for ${symbol}`);
        socket.close();
      }
    };
  }, [symbol]); // Reconnect when symbol changes

  return orderbookData;
}