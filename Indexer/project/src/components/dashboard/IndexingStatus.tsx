import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Clock, Database } from 'lucide-react';

interface IndexingStatusData {
  active: boolean;
  startTime: string;
  duration: string;
  lastBlockHeight: number | null;
  recordsProcessed: number;
  recordsPerSecond: number;
  lastUpdated: string;
}

interface IndexingStatusResponse {
  success: boolean;
  active: boolean;
  startTime: string;
  duration: string;
  lastBlockHeight: number | null;
  recordsProcessed: number;
  recordsPerSecond: number;
  lastUpdated: string;
  message?: string;
}

interface IndexingStatusProps {
  active?: boolean;
  startTime?: Date;
  duration?: string;
}

const IndexingStatus: React.FC<IndexingStatusProps> = () => {
  const [status, setStatus] = useState<IndexingStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<IndexingStatusResponse>(
          ' https://solana-indexer-h8fy0qclk-rachit-srivastavas-projects-ee6e9b50.vercel.app/api/indexing-status'
        );

        if (response.data.success !== false) {
          setStatus({
            active: response.data.active,
            startTime: response.data.startTime,
            duration: response.data.duration,
            lastBlockHeight: response.data.lastBlockHeight ?? 0,
            recordsProcessed: response.data.recordsProcessed,
            recordsPerSecond: response.data.recordsPerSecond,
            lastUpdated: response.data.lastUpdated,
          });
        } else {
          setError(response.data.message || 'Failed to fetch indexing status');
        }
      } catch (err) {
        setError('Error fetching indexing status. Please try again.');
        console.error('Status fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300">
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300">
        <div className="p-6 text-red-600 dark:text-red-400">
          {error || 'No indexing status available.'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Indexing Status
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              status.active
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            }`}
          >
            {status.active ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard
            title="Processing Rate"
            value={`${status.recordsPerSecond}/sec`}
            trend={status.active ? '+2.4%' : '0%'}
            trendUp={status.active}
            icon={<PieChart className="w-6 h-6" />}
            color="purple"
          />
          <StatusCard
            title="Run Time"
            value={status.duration}
            subtitle={`Since ${new Date(status.startTime).toLocaleTimeString()}`}
            icon={<Clock className="w-6 h-6" />}
            color="blue"
          />
          <StatusCard
            title="Records Processed"
            value={status.recordsProcessed.toLocaleString()}
            subtitle={`Block Height: ${
              status.lastBlockHeight !== null
                ? status.lastBlockHeight.toLocaleString()
                : 'N/A'
            }`}
            icon={<Database className="w-6 h-6" />}
            color="indigo"
          />
        </div>
      </div>
    </div>
  );
};

interface StatusCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  color: 'purple' | 'blue' | 'indigo' | 'green';
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendUp,
  icon,
  color,
}) => {
  const colorClasses = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all duration-300">
      <div className="flex items-center mb-3">
        <div className={`p-2 rounded-md mr-3 ${colorClasses[color]}`}>{icon}</div>
        <h3 className="font-medium text-gray-800 dark:text-white">{title}</h3>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </div>
          )}
        </div>
        {trend && (
          <div
            className={`text-sm ${
              trendUp
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexingStatus;