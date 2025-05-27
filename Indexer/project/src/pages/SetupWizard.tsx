import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Database, List, Play } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { Github } from 'lucide-react';
import { Twitter } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

// Step components
import WalletConnected from '../components/setup/WalletConnected';
import DatabaseSetup from '../components/setup/DatabaseSetup';
import DataTypeSelection from '../components/setup/DataTypeSelection';
import SetupComplete from '../components/setup/SetupComplete';


const SolanaLogo: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
    viewBox="0 0 397.7 311.7"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <linearGradient
      id="solana-gradient"
      x1="360.8791"
      y1="351.4553"
      x2="141.213"
      y2="-69.2936"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" stopColor="#00FFA3" />
      <stop offset="100%" stopColor="#DC1FFF" />
    </linearGradient>
    <path
      d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"
      fill="url(#solana-gradient)"
    />
    <path
      d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1L333.1,73.8c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"
      fill="url(#solana-gradient)"
    />
    <path
      d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"
      fill="url(#solana-gradient)"
    />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative max-w-5xl mx-auto p-4 py-12">
        {/* Header with Solana branding */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-300 bg-clip-text text-transparent mb-3">
            Solana Setup Wizard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Complete these steps to start indexing Solana blockchain data with lightning speed
          </p>
        </div>
  
        {/* Enhanced Progress steps */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center relative">
                <div
                  className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-500 transform ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-purple-500 to-violet-500 border-purple-400 scale-110 shadow-lg shadow-purple-500/25'
                      : index < currentStep
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-lg shadow-green-500/25'
                      : 'bg-gray-800/50 border-gray-600 backdrop-blur-sm'
                  } hover:scale-105`}
                >
                  {index < currentStep ? (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className={`flex items-center justify-center text-xl ${
                      index === currentStep ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.icon}
                    </div>
                  )}
                </div>
                <span className={`mt-3 text-sm font-semibold tracking-wide transition-colors duration-300 ${
                  index === currentStep
                    ? 'text-purple-300'
                    : index < currentStep
                    ? 'text-green-300'
                    : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {/* Step number indicator */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  index === currentStep
                    ? 'bg-purple-400 text-white'
                    : index < currentStep
                    ? 'bg-green-400 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          {/* Enhanced progress bar */}
          <div className="relative px-7">
            <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-2 bg-gray-700/50 rounded-full backdrop-blur-sm"></div>
            <div
              className="absolute top-1/2 transform -translate-y-1/2 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-purple-500/25"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
            </div>
          </div>
        </div>
  
        {/* Enhanced current step content */}
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8 mb-10 relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 pointer-events-none"></div>
          
          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl mr-4">
                <div className="text-purple-400 text-xl">
                  {steps[currentStep].icon}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  {steps[currentStep].title}
                </h2>
                <div className="flex items-center text-sm text-purple-300">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <div className="w-2 h-2 bg-purple-400 rounded-full mx-2"></div>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {steps[currentStep].description}
            </p>
            
            <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700/30">
              {steps[currentStep].component}
            </div>
          </div>
        </div>
  
        {/* Enhanced navigation buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="group flex items-center px-6 py-3 font-semibold text-gray-300 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-800/50"
          >
            <ChevronLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Back
          </button>
  
          <div className="flex items-center space-x-4">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
              <span>{currentStep + 1}</span>
              <div className="w-8 h-0.5 bg-gray-600 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
              <span>{steps.length}</span>
            </div>
  
            {currentStep < steps.length - 1 && (
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !userData.databaseConfig) ||
                  (currentStep === 2 && !Object.values(userData.dataTypes).some(Boolean))
                }
                className="group flex items-center px-8 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-violet-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transform"
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
  
        {/* Completion celebration for final step */}
        {currentStep === steps.length - 1 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full text-green-300 text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Ready to launch your Solana indexer!
            </div>
          </div>
        )}
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center space-x-3">
            <div className="relative">
              <SolanaLogo className="h-8 w-8 text-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-purple-500 to-pink-500 bg-clip-text">
                <SolanaLogo className="h-8 w-8" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Solana
                </span>
                <span className="text-lg font-bold text-gray-200">
                  Indexer
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:block text-sm text-gray-400">
              Let's Connect ⮕
            </div>
            <a
              href="https://x.com/Rachit_twts"
              className="group relative p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-gray-300 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="sr-only">Twitter</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </a>
            <a
              href="https://github.com/RachitSrivastava12/Solana-Indexer"
              className="group relative p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-gray-300 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="sr-only">GitHub</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </a>
          </div>
        </div>
        
        {/* Decorative bottom border */}
        <div className="mt-6 pt-4 border-t border-purple-500/10">
          <div className="flex justify-center">
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
        </div>
      </div>
      <Analytics />
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