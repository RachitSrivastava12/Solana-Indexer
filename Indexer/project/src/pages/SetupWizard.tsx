import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Database, List, Play, CheckCircle } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';

// Step components
import WalletConnected from '../components/setup/WalletConnected';
import DatabaseSetup from '../components/setup/DatabaseSetup';
import DataTypeSelection from '../components/setup/DataTypeSelection';
import SetupComplete from '../components/setup/SetupComplete';


// Add this Solana Logo component
const SolanaLogo = ( className: string | undefined ) => (
  <svg className={className} viewBox="0 0 646 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M108.53 75.6899L90.81 57.9699C90.81 57.9699 82.62 49.7799 74.43 57.9699L22.98 109.42C18.15 114.25 22.98 119.08 22.98 119.08L40.7 136.8C40.7 136.8 48.89 145 57.08 136.8L108.53 85.35C113.36 80.52 108.53 75.6899 108.53 75.6899Z" fill="url(#paint0_linear_174_4403)"/>
    <path d="M108.53 20.31L90.81 2.58998C90.81 2.58998 82.62 -5.59002 74.43 2.58998L22.98 54.04C18.15 58.87 22.98 63.7 22.98 63.7L40.7 81.42C40.7 81.42 48.89 89.61 57.08 81.42L108.53 29.97C113.36 25.14 108.53 20.31 108.53 20.31Z" fill="url(#paint1_linear_174_4403)"/>
    <path d="M57.08 47.95L108.53 -3.5C113.36 -8.33 108.53 -13.16 108.53 -13.16L90.81 -30.88C90.81 -30.88 82.62 -39.07 74.43 -30.88L22.98 20.57C18.15 25.4 22.98 30.23 22.98 30.23L40.7 47.95C40.7 47.95 48.89 56.14 57.08 47.95Z" fill="url(#paint2_linear_174_4403)"/>
    <defs>
      <linearGradient id="paint0_linear_174_4403" x1="22.98" y1="97.245" x2="108.53" y2="97.245" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
      <linearGradient id="paint1_linear_174_4403" x1="22.98" y1="42.005" x2="108.53" y2="42.005" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
      <linearGradient id="paint2_linear_174_4403" x1="22.98" y1="7.395" x2="108.53" y2="7.395" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
    </defs>
  </svg>
);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 max-w-6xl mx-auto p-6 py-12">
        {/* Header with Solana branding */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mr-4 shadow-xl">
              <SolanaLogo className="w-10 h-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Solana Indexer
              </h1>
              <p className="text-purple-300 text-lg">Setup Wizard</p>
            </div>
          </div>
          <p className="text-purple-200 text-xl max-w-2xl mx-auto">
            Complete these steps to start indexing Solana blockchain data with enterprise-grade performance
          </p>
        </div>
        
        {/* Enhanced Progress Steps */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8 relative">
            {/* Progress line background */}
            <div className="absolute top-10 left-0 right-0 h-1 bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-full"></div>
            {/* Active progress line */}
            <div 
              className="absolute top-10 left-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center relative z-10">
                <div 
                  className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 shadow-xl ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white scale-110 shadow-cyan-400/50'
                      : index < currentStep
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-400/50'
                        : 'bg-gray-800/80 backdrop-blur-sm text-gray-400 border-2 border-gray-600/50'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : (
                    <div className="flex items-center justify-center scale-125">
                      {step.icon}
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center max-w-32">
                  <span className={`block text-sm font-bold transition-colors duration-300 ${
                    index === currentStep 
                      ? 'text-cyan-300' 
                      : index < currentStep
                        ? 'text-green-300'
                        : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  <span className="text-xs text-purple-300/70 mt-1 block">
                    Step {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Current Step Content */}
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                {steps[currentStep].icon}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-purple-300 text-lg">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {steps[currentStep].component}
          </div>
        </div>
        
        {/* Enhanced Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="group flex items-center px-8 py-4 font-semibold text-white bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-600/50 hover:bg-gray-700/60 hover:border-gray-500/50 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
          >
            <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Previous Step
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !userData.databaseConfig) ||
                (currentStep === 2 && !Object.values(userData.dataTypes).some(Boolean))
              }
              className="group flex items-center px-8 py-4 font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-cyan-400/25 hover:scale-105"
            >
              Next Step
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          ) : (
            <button
              onClick={() => {
                completeSetup();
                navigate('/dashboard');
              }}
              className="group flex items-center px-8 py-4 font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-green-400/25 hover:scale-105"
            >
              Complete Setup
              <Play className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
            </button>
          )}
        </div>
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