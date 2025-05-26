import React from 'react';
import { Github } from 'lucide-react';

// Solana Logo Component
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

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-t border-purple-500/20 shadow-2xl">
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
              Powered by Solana blockchain
            </div>
            <a
              href="#"
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
    </footer>
  );
};

export default Footer;