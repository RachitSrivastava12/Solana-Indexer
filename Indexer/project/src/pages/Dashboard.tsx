import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Play, Settings, Info, RefreshCw, AlertTriangle, Database, TrendingUp, Zap } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { usePhantomWallet } from '../contexts/PhantomWalletContext';
import { Github } from 'lucide-react';
import { Twitter } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

// Import dashboard components
import IndexingStatus from '../components/dashboard/IndexingStatus';
import DataTypeStats from '../components/dashboard/DataTypeStats';
import DataPreview from '../components/dashboard/DataPreview';
import DatabaseInfo from '../components/dashboard/DatabaseInfo';

const SolanaLogo: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
    viewBox="0 0 397.7 311.7"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <linearGradient
      id="solana-gradient"
      x1="360.8791"
      y1="351.4553"
      x2="141.213"
      y2="-69.2936"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" stopColor="#00FFA3" />
      <stop offset="100%" stopColor="#DC1FFF" />
    </linearGradient>
    <path
      d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"
      fill="url(#solana-gradient)"
    />
    <path
      d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1L333.1,73.8c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"
      fill="url(#solana-gradient)"
    />
    <path
      d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"
      fill="url(#solana-gradient)"
    />
  </svg>
);

const Dashboard: React.FC = () => {
  const { userData, toggleIndexing } = useUserData();
  const { connected } = usePhantomWallet();
  const navigate = useNavigate();

  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [indexingStartTime] = useState<Date>(new Date(Date.now() - 3600000)); // 1 hour ago

  // Simulated quick metrics (visible upgrade)
  const [metrics] = useState({
    blocksIndexed: '1.24M',
    transactions: '8.7M',
    avgSpeed: '12.4k/sec',
  });

  useEffect(() => {
    if (!connected) {
      navigate('/');
    } else if (!userData.setupComplete) {
      navigate('/setup');
    }
  }, [connected, userData.setupComplete, navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh with better UX
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date());
    }, 800);
  };

  const formatDuration = (startTime: Date) => {
    const diff = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!connected || !userData.setupComplete) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black text-white">
      <div className="max-w-7xl mx-auto p-6 py-10">
        {/* HEADER - Premium glow upgrade */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <SolanaLogo className="h-10 w-10 drop-shadow-[0_0_20px_#00FFA3]" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-[#00FFA3] via-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tighter">
                SOLANA INDEXER
              </h1>
              <p className="text-purple-400 text-sm font-medium tracking-widest">LIVE DASHBOARD</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6 lg:mt-0">
            {/* Toggle Indexing - Neon glow upgrade */}
            <button
              onClick={toggleIndexing}
              className={`group inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 active:scale-95 ${
                userData.indexingActive
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-black'
                  : 'bg-gradient-to-r from-emerald-400 to-cyan-500 hover:brightness-110 text-black'
              }`}
            >
              {userData.indexingActive ? (
                <>
                  <Pause className="w-5 h-5" />
                  PAUSE INDEXING
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  RESUME INDEXING
                </>
              )}
            </button>

            {/* Settings & Refresh */}
            <button
              onClick={() => navigate('/setup')}
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl text-sm font-medium transition-all hover:shadow-xl border border-white/10"
            >
              <Settings className="w-5 h-5" />
              SETTINGS
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl transition-all disabled:opacity-50 border border-white/10"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-45'} transition-transform`} />
            </button>
          </div>
        </div>

        {/* QUICK METRICS ROW - New visible upgrade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-5 hover:border-purple-400/50 transition-colors">
            <div className="p-4 bg-emerald-500/10 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-purple-400 tracking-widest">BLOCKS INDEXED</p>
              <p className="text-4xl font-bold text-white mt-1">{metrics.blocksIndexed}</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-5 hover:border-purple-400/50 transition-colors">
            <div className="p-4 bg-pink-500/10 rounded-2xl">
              <Zap className="w-8 h-8 text-pink-400" />
            </div>
            <div>
              <p className="text-xs text-purple-400 tracking-widest">TRANSACTIONS</p>
              <p className="text-4xl font-bold text-white mt-1">{metrics.transactions}</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-5 hover:border-purple-400/50 transition-colors">
            <div className="p-4 bg-cyan-500/10 rounded-2xl">
              <Database className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-purple-400 tracking-widest">AVG SPEED</p>
              <p className="text-4xl font-bold text-white mt-1">{metrics.avgSpeed}</p>
            </div>
          </div>
        </div>

        {/* STATUS + DB GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <IndexingStatus
              active={userData.indexingActive}
              startTime={indexingStartTime}
              duration={formatDuration(indexingStartTime)}
            />
          </div>
          <div>
            <DatabaseInfo databaseConfig={userData.databaseConfig} />
          </div>
        </div>

        {/* DATA STATS & PREVIEW */}
        <div className="mb-8">
          <DataTypeStats dataTypes={userData.dataTypes} />
        </div>

        <div className="mb-10">
          <DataPreview dataTypes={userData.dataTypes} />
        </div>

        {/* LAST UPDATED BAR - Cleaner & neon */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl text-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            <Info className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400">Last synced</span>
            <span className="font-mono text-white">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {!userData.indexingActive && (
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Indexing paused</span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER - Completely redesigned, premium & clean */}
      <div className="max-w-7xl mx-auto px-6 pb-12 pt-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Branding */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <SolanaLogo className="h-9 w-9 text-transparent drop-shadow-[0_0_30px_#00FFA3]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-purple-400 to-pink-500 bg-clip-text">
                <SolanaLogo className="h-9 w-9" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tighter">
                SOLANA <span className="text-purple-400">INDEXER</span>
              </div>
              <p className="text-xs text-purple-400/70">© {new Date().getFullYear()} • Built with ❤️ for the community</p>
            </div>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-8">
            <div className="text-xs uppercase tracking-[3px] text-purple-400 hidden md:block">Connect with me</div>
            
            <a
              href="https://x.com/Rachit_twts"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-purple-400 hover:text-white transition-all hover:scale-110"
            >
              <Twitter className="w-6 h-6" />
              <span className="text-sm font-medium">@Rachit_twts</span>
            </a>

            <a
              href="https://github.com/RachitSrivastava12/Solana-Indexer"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-purple-400 hover:text-white transition-all hover:scale-110"
            >
              <Github className="w-6 h-6" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
          </div>
        </div>

        {/* Decorative line */}
        <div className="mt-10 flex justify-center">
          <div className="h-px w-40 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        </div>
      </div>

      <Analytics />
    </div>
  );
};

export default Dashboard;
