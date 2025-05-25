import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { usePhantomWallet } from '../contexts/PhantomWalletContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { connected, publicKey, disconnectWallet } = usePhantomWallet();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const formatPublicKey = (key: string | null) => {
    if (!key) return '';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold neon-text">Solana</span>
              <span className="text-xl font-bold text-gray-300 ml-1">Indexer</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {connected && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/dashboard' 
                      ? 'text-neon-yellow' 
                      : 'text-gray-300 hover:text-neon-yellow'
                  } transition-colors duration-200`}
                >
                  Dashboard
                </Link>
                
                {publicKey && (
                  <div className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300">
                    <User className="h-4 w-4 mr-1" />
                    {formatPublicKey(publicKey)}
                  </div>
                )}
                
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1.5 text-sm font-medium rounded-md neon-button"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-300 hover:text-neon-yellow transition-colors duration-200"
              aria-expanded={isOpen}
              aria-label="Main menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-600">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {connected && (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/dashboard'
                      ? 'text-neon-yellow'
                      : 'text-gray-300'
                  } transition-colors duration-200`}
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                
                {publicKey && (
                  <div className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300">
                    <User className="h-4 w-4 mr-1" />
                    {formatPublicKey(publicKey)}
                  </div>
                )}
                
                <button
                  onClick={() => {
                    disconnectWallet();
                    toggleMenu();
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium rounded-md neon-button"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;