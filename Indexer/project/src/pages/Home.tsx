import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhantomWallet } from '../contexts/PhantomWalletContext';
import { useUserData } from '../contexts/UserDataContext';

const Home: React.FC = () => {
  const { wallet, connected, connecting, connectWallet } = usePhantomWallet();
  const { userData, setWalletAddress } = useUserData();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (connected && wallet?.publicKey) {
      setWalletAddress(wallet.publicKey.toString());
      
      if (userData.setupComplete) {
        navigate('/dashboard');
      } else {
        navigate('/setup');
      }
    }
  }, [connected, wallet, navigate, setWalletAddress, userData.setupComplete]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] px-4 py-16 bg-dark-900">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          <span className="neon-text animate-pulse-slow">
            Solana Data Indexer
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-8">
          Index Solana blockchain data directly into your PostgreSQL database.
          Customize what you need, we'll handle the rest.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={connectWallet}
            disabled={connecting || !wallet}
            className="px-6 py-3 text-lg font-medium rounded-lg neon-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? (
              'Connecting...'
            ) : wallet ? (
              'Connect with Phantom'
            ) : (
              'Install Phantom Wallet'
            )}
          </button>
          
          {!wallet && (
            <p className="text-sm text-gray-500">
              Phantom wallet extension not detected.{' '}
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-yellow hover:text-neon-pink transition-colors duration-200"
              >
                Click here to install
              </a>
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <FeatureCard 
          title="Connect Your Wallet" 
          description="Securely authenticate with your Phantom wallet to get started."
          icon="🔒"
        />
        <FeatureCard 
          title="Configure Your Database" 
          description="Connect to your PostgreSQL database using a connection URL or credentials."
          icon="🗄️"
        />
        <FeatureCard 
          title="Select Data Types" 
          description="Choose what Solana data you want to index: NFT bids, token prices, and more."
          icon="📊"
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="neon-card rounded-xl p-6">
      <div className="flex flex-col items-center text-center">
        <span className="text-4xl mb-4">{icon}</span>
        <h3 className="text-xl font-semibold text-neon-yellow mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default Home;