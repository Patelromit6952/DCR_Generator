import React from 'react';

export const PDFLoader = ({ currentStep, isVisible }) => {
  if (!isVisible) return null;

  const steps = [
    { id: 1, text: 'Validating data...', icon: '🔍' },
    { id: 2, text: 'Saving to database...', icon: '💾' },
    { id: 3, text: 'Generating Abstract PDF...', icon: '📄' },
    { id: 4, text: 'Generating Measurement PDF...', icon: '📏' }
  ];

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-ping"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute top-2 left-2 w-16 h-16 border-4 border-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                currentStep >= step.id
                  ? 'bg-blue-50 text-blue-700'
                  : currentStep === step.id - 1
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-gray-50 text-gray-400'
              }`}
            >
              <span className="text-2xl">{step.icon}</span>
              <span className="font-medium">{step.text}</span>
              {currentStep === step.id && (
                <div className="ml-auto">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {currentStep > step.id && (
                <div className="ml-auto text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">Generating Abstract and Measurement PDFs...</p>
        </div>
      </div>
    </div>
  );
};