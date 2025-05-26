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
    <footer className="bg-white dark:bg-gray-800 py-6 shadow-inner transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center space-x-2">
            <SolanaLogo className="h-6 w-6" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Solana Indexer. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;