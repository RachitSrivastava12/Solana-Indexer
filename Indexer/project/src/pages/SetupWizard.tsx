import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Database, List, Play } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';

// Step components
import WalletConnected from '../components/setup/WalletConnected';
import DatabaseSetup from '../components/setup/DatabaseSetup';
import DataTypeSelection from '../components/setup/DataTypeSelection';
import SetupComplete from '../components/setup/SetupComplete';

const SetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { userData, completeSetup } = useUserData();
  const navigate = useNavigate();
  
  const steps = [
    { 
      title: 'Wallet Connected',
      description: 'Your wallet is connected and ready to go',
      component: <WalletConnected />,
      icon: <WalletIcon />
    },
    { 
      title: 'Database Setup', 
      description: 'Configure your PostgreSQL database connection',
      component: <DatabaseSetup onComplete={() => setCurrentStep(2)} />,
      icon: <Database className="w-6 h-6" />
    },
    { 
      title: 'Data Selection', 
      description: 'Choose what Solana data you want to index',
      component: <DataTypeSelection onComplete={() => setCurrentStep(3)} />,
      icon: <List className="w-6 h-6" />
    },
    { 
      title: 'Start Indexing', 
      description: 'Review your settings and start the indexing process',
      component: <SetupComplete onComplete={() => {
        completeSetup();
        navigate('/dashboard');
      }} />,
      icon: <Play className="w-6 h-6" />
    }
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Setup Wizard</h1>
        <p className="text-gray-600 dark:text-gray-400">Complete these steps to start indexing Solana data</p>
      </div>
      
      {/* Progress steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index === currentStep
                    ? 'bg-yellow-600 text-white'
                    : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                } transition-colors duration-300`}
              >
                {index < currentStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="flex items-center justify-center">
                    {step.icon}
                  </div>
                )}
              </div>
              <span className={`mt-2 text-sm font-medium ${
                index === currentStep 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
        
        <div className="relative">
          <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700"></div>
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-yellow-600 transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Current step content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-all duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {steps[currentStep].title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {steps[currentStep].description}
        </p>
        
        <div className="mb-6">
          {steps[currentStep].component}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center px-4 py-2 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        
        {currentStep < steps.length - 1 && (
          <button
            onClick={nextStep}
            disabled={
              (currentStep === 1 && !userData.databaseConfig) ||
              (currentStep === 2 && !Object.values(userData.dataTypes).some(Boolean))
            }
            className="flex items-center px-4 py-2 font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

// Special wallet icon for the first step
const WalletIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8H20C20.5523 8 21 8.44772 21 9V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4H18C18.5523 4 19 4.44772 19 5V8H18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 14C16.5523 14 17 13.5523 17 13C17 12.4477 16.5523 12 16 12C15.4477 12 15 12.4477 15 13C15 13.5523 15.4477 14 16 14Z" fill="currentColor"/>
  </svg>
);

export default SetupWizard;