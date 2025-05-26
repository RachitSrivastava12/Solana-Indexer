import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhantomWallet } from '../contexts/PhantomWalletContext';
import { useUserData } from '../contexts/UserDataContext';
import { Database, Shield, BarChart3, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import { Github } from 'lucide-react';
import { Twitter } from 'lucide-react';

// Solana Logo Component
const SolanaLogo: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <svg
    className={className}
    viewBox="0 0 397.7 311.7"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="solana-gradient-home"
        x1="360.8791"
        y1="351.4553"
        x2="141.213"
        y2="-69.2936"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#00FFA3" />
        <stop offset="100%" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
    <path
      d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"
      fill="url(#solana-gradient-home)"
    />
    <path
      d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1L333.1,73.8c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"
      fill="url(#solana-gradient-home)"
    />
    <path
      d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"
      fill="url(#solana-gradient-home)"
    />
  </svg>
);

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
    <div className="min-h-[calc(100vh-7rem)] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl text-center mb-16">
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-8">
            <SolanaLogo className="h-16 w-16 mr-4 drop-shadow-2xl" />
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-purple-400 to-transparent mx-4" />
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                  Solana Data
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/90 mt-2">
                Indexer
              </h2>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Stream Solana blockchain data directly into your PostgreSQL database. 
            <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold"> Customize what you need, we'll handle the rest.</span>
          </p>

          {/* CTA Section */}
          <div className="space-y-6">
            <button
              onClick={connectWallet}
              disabled={connecting || !wallet}
              className="group relative px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="flex items-center space-x-2">
                {connecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : wallet ? (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Connect with Phantom</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    <span>Install Phantom Wallet</span>
                  </>
                )}
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
            </button>

            {!wallet && (
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-2">
                  Phantom wallet extension not detected.
                </p>
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors duration-200 font-medium"
                >
                  <span>Download Phantom Wallet</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          <FeatureCard
            title="Connect Your Wallet"
            description="Securely authenticate with your Phantom wallet to get started with blockchain data indexing."
            icon={<Shield className="w-8 h-8 text-cyan-400" />}
            gradient="from-cyan-500/20 to-blue-500/20"
          />
          <FeatureCard
            title="Configure Database"
            description="Connect to your PostgreSQL database using connection URL or credentials with built-in validation."
            icon={<Database className="w-8 h-8 text-purple-400" />}
            gradient="from-purple-500/20 to-pink-500/20"
          />
          <FeatureCard
            title="Select Data Types"
            description="Choose what Solana data to index: NFT bids, token prices, transactions, and much more."
            icon={<BarChart3 className="w-8 h-8 text-pink-400" />}
            gradient="from-pink-500/20 to-red-500/20"
          />
        </div>

        {/* Additional Features */}
        <div className="mt-16 max-w-4xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <Zap className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Real-time Streaming</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Get live blockchain data streamed directly to your database with minimal latency and maximum reliability.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <Database className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Custom Schemas</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Automatically create optimized database schemas tailored to your specific data requirements and use cases.
              </p>
            </div>
          </div>
        </div>
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

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, gradient }) => {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative p-8 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 h-full">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-lg bg-slate-700/50">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-gray-300 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;