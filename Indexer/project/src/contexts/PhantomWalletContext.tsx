import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PhantomWalletContextType {
  wallet: any | null;
  connected: boolean;
  publicKey: string | null;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const PhantomWalletContext = createContext<PhantomWalletContextType>({
  wallet: null,
  connected: false,
  publicKey: null,
  connecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const usePhantomWallet = () => useContext(PhantomWalletContext);

interface PhantomWalletProviderProps {
  children: ReactNode;
}

export const PhantomWalletProvider: React.FC<PhantomWalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<any | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);

  useEffect(() => {
    const checkForPhantom = async () => {
      try {
        // Check if Phantom is available
        const phantom = window.phantom?.solana;
        
        if (phantom) {
          setWallet(phantom);
          
          // Check if already connected
          if (phantom.isConnected) {
            setConnected(true);
            setPublicKey(phantom.publicKey.toString());
          }
          
          // Set up listeners
          phantom.on('connect', (publicKey: any) => {
            setConnected(true);
            setPublicKey(publicKey.toString());
            setConnecting(false);
          });
          
          phantom.on('disconnect', () => {
            setConnected(false);
            setPublicKey(null);
          });
        }
      } catch (error) {
        console.error('Error checking for Phantom wallet:', error);
      }
    };
    
    checkForPhantom();
    
    return () => {
      // Clean up listeners if needed
      if (wallet) {
        wallet.off('connect');
        wallet.off('disconnect');
      }
    };
  }, []);
  
  const connectWallet = async () => {
    try {
      if (wallet) {
        setConnecting(true);
        await wallet.connect();
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('Error connecting to Phantom wallet:', error);
      setConnecting(false);
    }
  };
  
  const disconnectWallet = () => {
    if (wallet) {
      wallet.disconnect();
      setConnected(false);
      setPublicKey(null);
    }
  };
  
  return (
    <PhantomWalletContext.Provider
      value={{
        wallet,
        connected,
        publicKey,
        connecting,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </PhantomWalletContext.Provider>
  );
};