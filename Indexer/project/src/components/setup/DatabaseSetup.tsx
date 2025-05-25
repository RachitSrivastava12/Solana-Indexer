import React, { useState } from 'react';
import { useUserData } from '../../contexts/UserDataContext';
import { Database, ArrowRight } from 'lucide-react';

interface DatabaseSetupProps {
  onComplete: () => void;
}

const DatabaseSetup: React.FC<DatabaseSetupProps> = ({ onComplete }) => {
  const { userData, setDatabaseConfig } = useUserData();
  const [connectionType, setConnectionType] = useState<'url' | 'credentials'>(
    userData.databaseConfig?.connectionType || 'url'
  );
  const [url, setUrl] = useState(userData.databaseConfig?.url || '');
  const [host, setHost] = useState(userData.databaseConfig?.host || '');
  const [port, setPort] = useState(userData.databaseConfig?.port || '5432');
  const [username, setUsername] = useState(userData.databaseConfig?.username || '');
  const [password, setPassword] = useState(userData.databaseConfig?.password || '');
  const [database, setDatabase] = useState(userData.databaseConfig?.database || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const config = connectionType === 'url'
      ? { connectionType, url }
      : { connectionType, host, port, username, password, database };
    
    setDatabaseConfig(config);
    await testConnection(config);
  };

  const testConnection = async (config: any) => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Prepare the payload for the backend
      const payload = connectionType === 'url' 
        ? {
            connectionType,
            connectionUrl: url
          }
        : {
            connectionType,
            host,
            port,
            database,
            username,
            password
          };
      
      // Send the request to the backend
      const response = await fetch('http://localhost:5000/api/configure-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Database connection successful!'
        });
        console.log('Database connection successful:', data);
        // Move to next step after successful connection
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Failed to connect to database.'
        });
      }
    } catch (error) {
      console.error('Error testing database connection:', error);
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
          <Database className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            PostgreSQL Database Connection
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure how to connect to your PostgreSQL database
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex mb-4">
          <button
            type="button"
            onClick={() => setConnectionType('url')}
            className={`flex-1 py-2 px-4 text-center border-b-2 ${
              connectionType === 'url'
                ? 'border-yellow-600 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            Connection URL
          </button>
          <button
            type="button"
            onClick={() => setConnectionType('credentials')}
            className={`flex-1 py-2 px-4 text-center border-b-2 ${
              connectionType === 'credentials'
                ? 'border-yellow-600 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            Connection Credentials
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {connectionType === 'url' ? (
            <div className="mb-4">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                PostgreSQL Connection URL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="postgresql://username:password@localhost:5432/database"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Format: postgresql://username:password@hostname:port/database
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="host" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Host
                  </label>
                  <input
                    type="text"
                    id="host"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="port" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    id="port"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="5432"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="database" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Database Name
                </label>
                <input
                  type="text"
                  id="database"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  placeholder="postgres"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="postgres"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={testing}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {testing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing Connection...
                </>
              ) : (
                <>
                  Test Connection
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
        
        {testResult && (
          <div className={`mt-4 p-3 rounded-md ${
            testResult.success 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400'
          }`}>
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseSetup;