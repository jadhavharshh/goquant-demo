# GoQuant: Crypto Trading Interface

A modern, responsive cryptocurrency trading interface built with Next.js and real-time WebSocket data from Binance.

---

## 🚀 Features

* **Real-time Orderbook Visualization**: Live display of bid and ask orders with depth visualization.
* **Dynamic Market Depth Chart**: Visual representation of buy and sell liquidity.
* **Spread Indicator**: Track bid-ask spread changes over time.
* **Orderbook Imbalance**: Visual indicators of buy/sell pressure and market sentiment.
* **Multiple Trading Pairs**: Switch between BTC, ETH, XRP, DOGE, SOL.
* **Responsive Design**: Optimized for both desktop and mobile.

---

## 🖼️ Demo

![GoQuant Demo Interface](https://via.placeholder.com/800x450.png?text=GoQuant+Interface+Screenshot)

---

## 🧰 Technologies Used

* **Next.js 15** – React framework with App Router
* **React 19** – Frontend UI library
* **TypeScript** – Type-safe JavaScript
* **Tailwind CSS 4** – Utility-first CSS framework
* **Recharts** – Composable charting library for React
* **Binance WebSocket API** – Real-time market data

---

## 📦 Prerequisites

Ensure you have the following installed:

* Node.js (v20.x or higher)
* npm, yarn, or bun (any JS package manager)

---

## 🛠️ Installation

```bash
git clone https://github.com/jadhavharshh/goquant-demo.git
cd goquant-demo
npm install
```

---

## ▶️ Running the Project

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`

---

## 🏗️ Building for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
/
├── public/                      # Static assets
├── src/
│   ├── app/                     # Next.js App Router components
│   │   ├── layout.tsx           # Root layout with theme provider
│   │   ├── page.tsx             # Main trading interface
│   │   └── globals.css          # Global CSS (Tailwind)
│   ├── components/              # React components
│   │   ├── Orderbook.tsx
│   │   ├── SpreadIndicator.tsx
│   │   ├── OrderbookImbalance.tsx
│   │   ├── MarketDepthChart.tsx
│   │   ├── TradingPairSelector.tsx
│   │   ├── useBinanceWebSocket.tsx
│   │   └── ui/                  # Shared UI components
│   └── lib/                     # Utilities and types
│       ├── api.ts
│       ├── types.ts
│       └── utils.ts
```

---

## 📌 Assumptions

* **WebSocket Connectivity**: Assumes stable internet for real-time data.
* **API Availability**: Uses Binance's public WebSocket API without heavy rate limits.
* **Market Hours**: No handling required since crypto trades 24/7.
* **Data Precision**: Fixed decimal precision used across pairs.
* **Authentication**: No user auth is included (demo only).

---

## 🧱 Libraries Used

* `next-themes`: Light/dark theme support
* `recharts`: Charts for market depth and spread
* `clsx` & `tailwind-merge`: Class name management
* `lucide-react`: Icon components
* `next/font`: Font optimization (Geist)

---

## 🔮 Future Improvements

* Enable order placement and execution
* Add historical price charts with timeframes
* Include recent trade history visualization
* Implement user authentication & account management
* Add trading pair watchlists and favorites
* Improve mobile UX with dedicated layouts

---