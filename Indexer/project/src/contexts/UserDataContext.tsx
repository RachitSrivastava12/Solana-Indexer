import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface DatabaseConfig {
  connectionType: 'url' | 'credentials';
  url?: string;
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  database?: string;
}

interface DataTypeConfig {
  nftBids: boolean;
  nftPrices: boolean;
  tokensToBorrow: boolean;
  tokenPrices: boolean;
  customQueries: string[];
}

interface UserData {
  walletAddress: string | null;
  databaseConfig: DatabaseConfig | null;
  dataTypes: DataTypeConfig;
  indexingActive: boolean;
  setupComplete: boolean;
}

interface UserDataContextType {
  userData: UserData;
  setWalletAddress: (address: string | null) => void;
  setDatabaseConfig: (config: DatabaseConfig | null) => void;
  setDataTypes: (types: DataTypeConfig) => void;
  toggleIndexing: () => Promise<void>;
  completeSetup: () => void;
  resetUserData: () => void;
  initializeConnections: (rpcUrl: string) => Promise<void>;
}

const defaultDataTypes: DataTypeConfig = {
  nftBids: false,
  nftPrices: false,
  tokensToBorrow: false,
  tokenPrices: false,
  customQueries: [],
};

const initialUserData: UserData = {
  walletAddress: null,
  databaseConfig: null,
  dataTypes: defaultDataTypes,
  indexingActive: false,
  setupComplete: false,
};

const UserDataContext = createContext<UserDataContextType>({
  userData: initialUserData,
  setWalletAddress: () => {},
  setDatabaseConfig: () => {},
  setDataTypes: () => {},
  toggleIndexing: async () => {},
  completeSetup: () => {},
  resetUserData: () => {},
  initializeConnections: async () => {},
});

export const useUserData = () => useContext(UserDataContext);

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(initialUserData);

  const setWalletAddress = (address: string | null) => {
    setUserData((prev) => ({ ...prev, walletAddress: address }));
  };

  const setDatabaseConfig = (config: DatabaseConfig | null) => {
    setUserData((prev) => ({ ...prev, databaseConfig: config }));
  };

  const setDataTypes = (types: DataTypeConfig) => {
    // Validate custom queries
    const validCustomQueries = types.customQueries.filter(
      (query) => query.trim() && query.toLowerCase().startsWith('select')
    );
    setUserData((prev) => ({
      ...prev,
      dataTypes: { ...types, customQueries: validCustomQueries }
    }));
  };

  const toggleIndexing = async () => {
    try {
      const isStarting = !userData.indexingActive;
      console.log('Toggling indexing:', isStarting, 'dataTypes:', userData.dataTypes);
      const endpoint = isStarting ? '/api/start-indexing' : '/api/stop-indexing';
      const payload = isStarting ? { dataTypes: userData.dataTypes } : {};

      const response = await axios.post(
        `https://solana-indexer-7smpaunpj-rachit-srivastavas-projects-ee6e9b50.vercel.app${endpoint}`,
        payload
      );

      console.log('Toggle indexing response:', response.data);
      if (response.data.success) {
        setUserData((prev) => ({
          ...prev,
          indexingActive: isStarting,
        }));
      } else {
        throw new Error(response.data.message || 'Failed to toggle indexing');
      }
    } catch (error) {
      console.error('Toggle indexing error:', error);
      throw error;
    }
  };

  const completeSetup = () => {
    setUserData((prev) => ({ ...prev, setupComplete: true }));
  };

  const resetUserData = () => {
    setUserData(initialUserData);
  };

  const initializeConnections = async (rpcUrl: string) => {
    try {
      const solanaResponse = await axios.post('https://solana-indexer-7smpaunpj-rachit-srivastavas-projects-ee6e9b50.vercel.app/api/initialize', {
        rpcUrl,
      });
      console.log('Solana initialize response:', solanaResponse.data);
      if (!solanaResponse.data.success) {
        throw new Error(solanaResponse.data.message || 'Failed to initialize Solana connection');
      }

      if (!userData.databaseConfig) {
        throw new Error('Database configuration is missing');
      }

      const dbPayload = {
        connectionType: userData.databaseConfig.connectionType,
        ...(userData.databaseConfig.connectionType === 'url'
          ? { connectionUrl: userData.databaseConfig.url }
          : {
              host: userData.databaseConfig.host,
              port: userData.databaseConfig.port,
              database: userData.databaseConfig.database,
              username: userData.databaseConfig.username,
              password: userData.databaseConfig.password,
            }),
      };

      const dbResponse = await axios.post(
        'https://solana-indexer-7smpaunpj-rachit-srivastavas-projects-ee6e9b50.vercel.app/api/configure-database',
        dbPayload
      );
      console.log('Database configure response:', dbResponse.data);
      if (!dbResponse.data.success) {
        throw new Error(dbResponse.data.message || 'Failed to configure database');
      }
    } catch (error) {
      console.error('Initialize connections error:', error);
      throw error;
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        userData,
        setWalletAddress,
        setDatabaseConfig,
        setDataTypes,
        toggleIndexing,
        completeSetup,
        resetUserData,
        initializeConnections,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};