import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BitcoinHero } from './components/BitcoinHero';
import { EtfDashboard } from './components/EtfDashboard';
import { Calculator } from './components/Calculator';
import { PriceChart } from './components/PriceChart';
import { fetchBitcoinPrice, fetchBitcoinHistory } from './services/api';
import { REFRESH_INTERVAL_MS } from './constants';
import { PricePoint } from './types';

const App: React.FC = () => {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [btc24hChange, setBtc24hChange] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<PricePoint[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch history separately (only on mount)
  const initHistory = async () => {
    const history = await fetchBitcoinHistory();
    if (history.length > 0) {
      setHistoryData(history);
    }
  };

  const updateData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBitcoinPrice();
      if (data) {
        setBtcPrice(data.price);
        setBtc24hChange(data.change24h);
        const now = new Date();
        setLastUpdated(now);

        // Append new price point to chart history
        setHistoryData(prev => {
          const newPoint = { time: now.getTime(), price: data.price };
          // Keep only the last 120 points to match the init fetch size (approx 2 hours if 1m candles, 
          // but since we are polling every few seconds, we might want to filter or just keep appending 
          // until it gets too large, then slice)
          const newHistory = [...prev, newPoint];
          if (newHistory.length > 200) {
            return newHistory.slice(newHistory.length - 200);
          }
          return newHistory;
        });

      } else {
        setError("Failed to fetch price data.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    initHistory();
    updateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateData();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [updateData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      <Header 
        lastUpdated={lastUpdated} 
        loading={loading} 
        onRefresh={updateData} 
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
            {error} - Showing last known data if available.
          </div>
        )}

        <section>
          <BitcoinHero 
            price={btcPrice} 
            change24h={btc24hChange} 
            loading={loading && !btcPrice} 
          />
        </section>

        <section>
          <EtfDashboard btcPrice={btcPrice} />
        </section>

        <section>
          <Calculator currentBtcPrice={btcPrice} />
        </section>

        <section>
          <PriceChart data={historyData} loading={historyData.length === 0} />
        </section>

        <footer className="pt-8 pb-12 text-center text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} BTC-to-ETF Price Sync. Data provided by CoinCap.</p>
          <p className="mt-2 text-xs">
            Disclaimer: This tool is for informational purposes only. <br/>
            Real-time data may vary. Always verify prices with your broker before trading.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;