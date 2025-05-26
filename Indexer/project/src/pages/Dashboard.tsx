import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Play, Settings, Info, RefreshCw, AlertTriangle, Database } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { usePhantomWallet } from '../contexts/PhantomWalletContext';
import { Github } from 'lucide-react';
import { Twitter } from 'lucide-react';

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
  
  // Simulated data
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [indexingStartTime] = useState<Date>(new Date(Date.now() - 3600000)); // 1 hour ago
  
  useEffect(() => {
    // Redirect if not connected or setup not complete
    if (!connected) {
      navigate('/');
    } else if (!userData.setupComplete) {
      navigate('/setup');
    }
  }, [connected, userData.setupComplete, navigate]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date());
    }, 1000);
  };
  
  // Format duration
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
    <div className="max-w-7xl mx-auto p-4 py-8 bg-purple-950">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
            Solana Indexing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage your Solana blockchain data indexing
          </p>
        </div>
        
        <div className="flex items-center mt-4 md:mt-0 space-x-3">
          <button
            onClick={toggleIndexing}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              userData.indexingActive
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                : 'bg-gradient-to-r from-green-400 to-teal-500 text-white hover:from-green-500 hover:to-teal-600'
            }`}
          >
            {userData.indexingActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Indexing
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume Indexing
              </>
            )}
          </button>
          
          <button
            onClick={() => navigate('/setup')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center p-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Status card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
      
      {/* Data type stats */}
      <div className="mb-6">
        <DataTypeStats dataTypes={userData.dataTypes} />
      </div>
      
      {/* Data preview */}
      <div className="mb-6">
        <DataPreview dataTypes={userData.dataTypes} />
      </div>
      
      {/* Last updated indicator */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-full mr-2 animate-pulse"></div>
          <Info className="w-4 h-4 mr-1" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
        
        {!userData.indexingActive && (
          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-medium">
              Indexing is currently paused
            </span>
          </div>
        )}
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center space-x-3">
            <div className="relative">
              <SolanaLogo className="h-8 w-8 text-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-purple-500 to-pink-500 bg-clip-text">
                <SolanaLogo className="h-8 w-8" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Solana
                </span>
                <span className="text-lg font-bold text-gray-200">
                  Indexer
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:block text-sm text-gray-400">
              Let's Connect ⮕
            </div>
            <a
              href="https://x.com/Rachit_twts"
              className="group relative p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-gray-300 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="sr-only">Twitter</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </a>
            <a
              href="https://github.com/RachitSrivastava12/Solana-Indexer"
              className="group relative p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-gray-300 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="sr-only">GitHub</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </a>
          </div>
        </div>
        
        {/* Decorative bottom border */}
        <div className="mt-6 pt-4 border-t border-purple-500/10">
          <div className="flex justify-center">
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;