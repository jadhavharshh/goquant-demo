export interface OrderbookData {
    bids: Array<[string, string]> // [price, quantity]
    asks: Array<[string, string]> // [price, quantity]
  }