import React from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { usePhantomWallet } from '../../contexts/PhantomWalletContext';

const WalletConnected: React.FC = () => {
  const { publicKey } = usePhantomWallet();
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-full mb-4">
        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        Wallet Connected Successfully
      </h3>
      
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 w-full max-w-md mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Wallet Address:</p>
        <div className="flex items-center justify-between">
          <p className="font-mono text-gray-800 dark:text-gray-200 truncate">
            {publicKey || 'Not connected'}
          </p>
          <a
            href={`https://explorer.solana.com/address/${publicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        Your wallet will be used to identify your account and secure your database connection.
      </p>
    </div>
  );
};

export default WalletConnected;