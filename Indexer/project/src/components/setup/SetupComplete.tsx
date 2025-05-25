import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../contexts/UserDataContext';
import { CheckSquare, ArrowRight, Database, List } from 'lucide-react';

interface SetupCompleteProps {
  onComplete: () => void;
}

const SetupComplete: React.FC<SetupCompleteProps> = ({ onComplete }) => {
  const { userData, toggleIndexing, initializeConnections } = useUserData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const selectedDataTypes = Object.entries(userData.dataTypes)
    .filter(([key, value]) => key !== 'customQueries' && value === true)
    .length;

  const customQueries = userData.dataTypes.customQueries?.length || 0;

  const handleStartIndexing = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Starting indexing with dataTypes:', userData.dataTypes);
      const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=010cd958-a025-4a1a-aa7e-cc27d509f643'; // Updated to Helius Devnet RPC URL
      await initializeConnections(rpcUrl);
      await toggleIndexing();
      onComplete();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error starting indexing:', error);
      setError(
        error instanceof Error
          ? `Failed to start indexing: ${error.message}`
          : 'Failed to start indexing. Please check your configuration and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-center mb-8">
        <div className="w-16 h-16 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-full">
          <CheckSquare className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <h3 className="text-xl font-medium text-center text-gray-900 dark:text-white mb-6">
        Setup Complete! Ready to Start Indexing
      </h3>
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configuration Summary
        </h4>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md mr-3">
              <Database className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h5 className="font-medium text-gray-800 dark:text-gray-200">
                Database Connection
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userData.databaseConfig?.connectionType === 'url'
                  ? 'Connected via connection URL'
                  : `Connected to ${userData.databaseConfig?.host}:${userData.databaseConfig?.port}`}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md mr-3">
              <List className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h5 className="font-medium text-gray-800 dark:text-gray-200">
                Data Types
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedDataTypes} data type{selectedDataTypes !== 1 ? 's' : ''}{' '}
                selected
                {customQueries > 0 &&
                  ` + ${customQueries} custom quer${customQueries !== 1 ? 'ies' : 'y'}`}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {userData.dataTypes.nftBids && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-full">
                    NFT Bids
                  </span>
                )}
                {userData.dataTypes.nftPrices && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-full">
                    NFT Prices
                  </span>
                )}
                {userData.dataTypes.tokensToBorrow && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-full">
                    Tokens to Borrow
                  </span>
                )}
                {userData.dataTypes.tokenPrices && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-full">
                    Token Prices
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          What happens next?
        </h4>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">1.</span>
            <span>We'll start indexing the selected data types into your database</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2.</span>
            <span>You can monitor indexing progress in your dashboard</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3.</span>
            <span>Add, remove, or modify data types at any time from your dashboard</span>
          </li>
        </ul>
      </div>
      <button
        onClick={handleStartIndexing}
        disabled={isLoading}
        className={`w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Starting...' : 'Start Indexing'}
        <ArrowRight className="ml-2 w-5 h-5" />
      </button>
    </div>
  );
};

export default SetupComplete;