import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, BarChart, Image, DollarSign, BadgePercent } from 'lucide-react';

interface DataStats {
  name: string;
  recordCount: number;
  lastUpdate: string;
  growth: number;
}

interface DataTypeStatsResponse {
  success: boolean;
  stats: DataStats[];
  message?: string;
}

interface DataTypeStatsProps {
  dataTypes: {
    nftBids: boolean;
    nftPrices: boolean;
    tokensToBorrow: boolean;
    tokenPrices: boolean;
    customQueries: string[];
  };
}

const DataTypeStats: React.FC<DataTypeStatsProps> = ({ dataTypes }) => {
  const [stats, setStats] = useState<DataStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iconMap: { [key: string]: React.ReactNode } = {
    'NFT Bids': <Image className="w-5 h-5" />,
    'NFT Prices': <DollarSign className="w-5 h-5" />,
    'Tokens to Borrow': <BadgePercent className="w-5 h-5" />,
    'Token Prices': <BarChart className="w-5 h-5" />,
  };

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<DataTypeStatsResponse>(
          ' https://solana-indexer-i0kcm7qx7-rachit-srivastavas-projects-ee6e9b50.vercel.app/api/data-type-stats'
        );

        if (response.data.success) {
          const filteredStats = response.data.stats.filter((stat) =>
            dataTypes.nftBids && stat.name === 'NFT Bids' ||
            dataTypes.nftPrices && stat.name === 'NFT Prices' ||
            dataTypes.tokensToBorrow && stat.name === 'Tokens to Borrow' ||
            dataTypes.tokenPrices && stat.name === 'Token Prices' ||
            stat.name.startsWith('Custom Query')
          );
          setStats(filteredStats);
        } else {
          setError(response.data.message || 'Failed to fetch stats');
        }
      } catch (err) {
        setError('Error fetching stats. Please try again.');
        console.error('Stats fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [dataTypes]);

  if (Object.values(dataTypes).every((value) => !value && dataTypes.customQueries.length === 0)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Data Type Statistics
          </h2>
        </div>
        <div className="flex items-center justify-center p-6 text-gray-500 dark:text-gray-400">
          No data types selected for indexing. Configure data types in settings.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Data Type Statistics
          </h2>
          <button className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-200">
            View All
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
        ) : stats.length === 0 ? (
          <div className="p-6 text-gray-500 dark:text-gray-400">
            No statistics available.
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  24h Growth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.map((stat, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-md">
                        {iconMap[stat.name] || <BarChart3 className="w-5 h-5" />}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {stat.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {stat.recordCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {stat.lastUpdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center text-sm ${
                        stat.growth > 0
                          ? 'text-green-600 dark:text-green-400'
                          : stat.growth < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {stat.growth > 0 && '+'}
                      {stat.growth}%
                      {stat.growth !== 0 && (
                        <svg
                          className={`ml-1 w-3 h-3 fill-current`}
                          viewBox="0 0 12 12"
                        >
                          {stat.growth > 0 ? (
                            <path
                              d="M3 9l3-3 3 3"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          ) : (
                            <path
                              d="M3 3l3 3 3-3"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                        </svg>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DataTypeStats;