import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Eye, Code, RefreshCw, Download } from 'lucide-react';

interface DataRow {
  [key: string]: string | number | boolean | null;
}

interface DataPreviewResponse {
  success: boolean;
  data: DataRow[];
  tableName: string;
  message?: string;
}

interface CustomQuery {
  id: number;
  query_name: string;
  created_at: string;
}

interface CustomQueriesResponse {
  success: boolean;
  queries: CustomQuery[];
  message?: string;
}

interface DataPreviewProps {
  dataTypes: {
    nftBids: boolean;
    nftPrices: boolean;
    tokensToBorrow: boolean;
    tokenPrices: boolean;
    customQueries: string[];
  };
}

const DataPreview: React.FC<DataPreviewProps> = ({ dataTypes }) => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [viewType, setViewType] = useState<'table' | 'json'>('table');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<DataRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [customQueries, setCustomQueries] = useState<CustomQuery[]>([]);

  // Fetch custom queries metadata
  useEffect(() => {
    const fetchCustomQueries = async () => {
      try {
        const response = await axios.get<CustomQueriesResponse>(
          'https://solana-indexer-3ttcyyfq6-rachit-srivastavas-projects-ee6e9b50.vercel.app/api/custom-queries'
        );
        if (response.data.success) {
          setCustomQueries(response.data.queries);
        } else {
          console.error('Failed to fetch custom queries:', response.data.message);
        }
      } catch (err) {
        console.error('Error fetching custom queries:', err);
      }
    };
    fetchCustomQueries();
  }, []);

  // Memoize tabs to prevent unnecessary re-computation
  const tabs = useMemo(() => {
    const tabList: { name: string; dataType: string }[] = [];
    if (dataTypes.nftBids) tabList.push({ name: 'NFT Bids', dataType: 'nftBids' });
    if (dataTypes.nftPrices) tabList.push({ name: 'NFT Prices', dataType: 'nftPrices' });
    if (dataTypes.tokensToBorrow) tabList.push({ name: 'Tokens to Borrow', dataType: 'tokensToBorrow' });
    if (dataTypes.tokenPrices) tabList.push({ name: 'Token Prices', dataType: 'tokenPrices' });
    customQueries.forEach((query) => {
      tabList.push({ name: query.query_name, dataType: `custom_${query.id}` });
    });
    return tabList;
  }, [dataTypes, customQueries]);

  // Set first tab as active if none selected
  useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0].name);
    }
  }, [tabs, activeTab]);

  // Fetch data for the active tab
  const fetchData = useCallback(async () => {
    if (!activeTab) return;

    // Only show loading on the initial fetch
    if (data.length === 0) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const tab = tabs.find((t) => t.name === activeTab);
      if (!tab) {
        setError('Invalid tab selected');
        return;
      }

      const response = await axios.get<DataPreviewResponse>(
        `https://solana-indexer-3ttcyyfq6-rachit-srivastavas-projects-ee6e9b50.vercel.app/api/data-preview/${tab.dataType}`
      );

      console.log(`Data fetched for ${activeTab}:`, response.data); // Debug log

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        setData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch data');
        console.warn(`No valid data for ${activeTab}, preserving previous data`);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      if (data.length === 0) {
        setError('Error fetching data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, tabs, data]);

  // Initial fetch and polling
  useEffect(() => {
    fetchData();

    // Poll every 60 seconds
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(); // Directly call fetchData instead of resetting activeTab
  };

  const handleDownload = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${value ?? ''}"`)
        .join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab.toLowerCase().replace(' ', '_')}_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (tabs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Data Preview
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
            Data Preview
          </h2>
          <div className="flex items-center space-x-2">
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <button
                onClick={() => setViewType('table')}
                className={`px-2 py-1 text-sm ${
                  viewType === 'table'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewType('json')}
                className={`px-2 py-1 text-sm ${
                  viewType === 'json'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleDownload}
              disabled={data.length === 0}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.name
                  ? 'border-b-2 border-yellow-600 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto max-h-80">
        {(isLoading && data.length === 0) ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : error && data.length === 0 ? (
          <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
        ) : data.length === 0 ? (
          <div className="p-6 text-gray-500 dark:text-gray-400">
            No data available for {activeTab}.
          </div>
        ) : viewType === 'table' ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {key.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {Object.values(row).map((value, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                    >
                      {value !== null ? value.toString() : 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4">
            <pre className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-4 rounded-md overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPreview;