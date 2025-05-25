import React, { useState } from 'react';
import { useUserData } from '../../contexts/UserDataContext';
import { 
  CheckCircle2, 
  CircleSlash, 
  DollarSign, 
  BarChart, 
  Image, 
  BadgePercent, 
  PlusCircle, 
  MinusCircle,
  Info
} from 'lucide-react';

interface DataTypeSelectionProps {
  onComplete: () => void;
}

const DataTypeSelection: React.FC<DataTypeSelectionProps> = ({ onComplete }) => {
  const { userData, setDataTypes } = useUserData();
  const [customQueries, setCustomQueries] = useState<string[]>(
    userData.dataTypes.customQueries || []
  );
  
  const { dataTypes } = userData;
  
  const handleTypeToggle = (type: keyof typeof dataTypes) => {
    if (type === 'customQueries') return;
    
    const newDataTypes = {
      ...dataTypes,
      [type]: !dataTypes[type],
    };
    
    setDataTypes(newDataTypes);
  };
  
  const handleAddCustomQuery = () => {
    setCustomQueries([...customQueries, '']);
  };
  
  const handleRemoveCustomQuery = (index: number) => {
    const newQueries = [...customQueries];
    newQueries.splice(index, 1);
    setCustomQueries(newQueries);
    
    setDataTypes({
      ...dataTypes,
      customQueries: newQueries,
    });
  };
  
  const handleCustomQueryChange = (index: number, value: string) => {
    const newQueries = [...customQueries];
    newQueries[index] = value;
    setCustomQueries(newQueries);
    
    setDataTypes({
      ...dataTypes,
      customQueries: newQueries,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setDataTypes({
      ...dataTypes,
      customQueries,
    });
    
    onComplete();
  };
  
  const isFormValid = () => {
    return Object.entries(dataTypes).some(([key, value]) => {
      if (key === 'customQueries') {
        return customQueries.length > 0 && customQueries.every(q => q.trim() !== '');
      }
      return value === true;
    });
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
          <BarChart className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Select Data Types to Index
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose what Solana blockchain data you want to index
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DataTypeCard
            title="NFT Bids"
            description="Track all bids placed on NFTs"
            icon={<Image className="w-6 h-6" />}
            isSelected={dataTypes.nftBids}
            onClick={() => handleTypeToggle('nftBids')}
          />
          
          <DataTypeCard
            title="NFT Prices"
            description="Track NFT sale prices and history"
            icon={<DollarSign className="w-6 h-6" />}
            isSelected={dataTypes.nftPrices}
            onClick={() => handleTypeToggle('nftPrices')}
          />
          
          <DataTypeCard
            title="Tokens to Borrow"
            description="Track tokens available for borrowing"
            icon={<BadgePercent className="w-6 h-6" />}
            isSelected={dataTypes.tokensToBorrow}
            onClick={() => handleTypeToggle('tokensToBorrow')}
          />
          
          <DataTypeCard
            title="Token Prices"
            description="Track SPL token prices and changes"
            icon={<BarChart className="w-6 h-6" />}
            isSelected={dataTypes.tokenPrices}
            onClick={() => handleTypeToggle('tokenPrices')}
          />
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Custom Queries
            </h4>
            <button
              type="button"
              onClick={handleAddCustomQuery}
              className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Query
            </button>
          </div>
          
          {customQueries.length === 0 ? (
            <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <Info className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add custom queries to index specific Solana data
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customQueries.map((query, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleCustomQueryChange(index, e.target.value)}
                    placeholder="Enter SQL-like query for Solana data"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomQuery(index)}
                    className="ml-2 p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={!isFormValid()}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Continue
          </button>
          
          {!isFormValid() && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Please select at least one data type to index
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

interface DataTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const DataTypeCard: React.FC<DataTypeCardProps> = ({
  title,
  description,
  icon,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-500 dark:border-yellow-400'
          : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-200 dark:hover:border-yellow-800/50'
      }`}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full mr-3 ${
          isSelected
            ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          {icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            {isSelected ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <CircleSlash className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataTypeSelection;