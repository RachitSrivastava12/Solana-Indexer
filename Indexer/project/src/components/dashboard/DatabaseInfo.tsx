import React from 'react';
import { Database, Key, Server } from 'lucide-react';

interface DatabaseInfoProps {
  databaseConfig: {
    connectionType: 'url' | 'credentials';
    url?: string;
    host?: string;
    port?: string;
    username?: string;
    password?: string;
    database?: string;
  } | null;
}

const DatabaseInfo: React.FC<DatabaseInfoProps> = ({ databaseConfig }) => {
  if (!databaseConfig) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full transition-all duration-300">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Database Connection
          </h2>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Connected
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <ul className="space-y-4">
          <li className="flex items-start">
            <div className="flex-shrink-0">
              <Server className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Connection
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {databaseConfig.connectionType === 'url'
                  ? databaseConfig.url
                    ? `URL: ${databaseConfig.url.substring(0, 30)}...`
                    : 'URL not provided'
                  : `${databaseConfig.host || 'N/A'}:${databaseConfig.port || 'N/A'}`}
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0">
              <Database className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Database
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {databaseConfig.database || 'N/A'}
              </p>
            </div>
          </li>
          {databaseConfig.connectionType === 'credentials' && (
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <Key className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Credentials
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {databaseConfig.username || 'N/A'}
                </p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DatabaseInfo;