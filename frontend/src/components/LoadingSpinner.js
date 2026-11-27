import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

const LoadingSpinner = ({ message = "Generating your smart quiz..." }) => {
  const tips = [
    "Writing questions with Claude...",
    "Checking every answer key...",
    "Saving questions to the question bank...",
    "This can take up to a minute with free models..."
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="flex flex-col items-center justify-center min-h-64 space-y-6 p-8">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Brain className="w-8 h-8 text-primary-600 animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-gray-700 text-lg font-semibold">{message}</p>
        <p className="text-gray-500 text-sm max-w-md">
          {randomTip}
        </p>
      </div>
      
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md">
        <div className="flex items-start">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Working through your microservices</p>
            <p className="text-xs text-blue-600 mt-1">
              The AI service, question service and quiz service are all involved in this request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;