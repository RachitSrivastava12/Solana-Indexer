import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pause, Play, Settings, Info, RefreshCw, AlertTriangle, Database } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { usePhantomWallet } from '../contexts/PhantomWalletContext';

// Import dashboard components
import IndexingStatus from '../components/dashboard/IndexingStatus';
import DataTypeStats from '../components/dashboard/DataTypeStats';
import DataPreview from '../components/dashboard/DataPreview';
import DatabaseInfo from '../components/dashboard/DatabaseInfo';

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
    <div className="max-w-7xl mx-auto p-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Indexing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage your Solana data indexing
          </p>
        </div>
        
        <div className="flex items-center mt-4 md:mt-0 space-x-3">
          <button
            onClick={toggleIndexing}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              userData.indexingActive
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-800/40'
                : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/40'
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
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md text-sm font-medium transition-colors duration-200"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center p-2 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors duration-200 disabled:opacity-50"
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
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Info className="w-4 h-4 mr-1" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
        
        {!userData.indexingActive && (
          <div className="flex items-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Indexing is currently paused
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;