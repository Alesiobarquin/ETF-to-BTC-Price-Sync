import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

interface HeaderProps {
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated, loading, onRefresh }) => {
  return (
    <header className="w-full py-6 px-4 sm:px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg shadow-lg shadow-orange-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">BTC-to-ETF Price Sync</h1>
            <p className="text-xs text-slate-400">Real-time Fair Market Value Calculator</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">Last Updated</p>
            <p className="text-sm text-slate-200 font-mono">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${loading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'
              }
            `}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
};