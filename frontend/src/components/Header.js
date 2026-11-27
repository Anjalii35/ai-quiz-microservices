import React from 'react';
import { Sparkles, Brain, Home, BarChart3 } from 'lucide-react';

const Header = ({ view, onNavigate, showNav }) => {
  const tab = (name, label, icon) => (
    <button
      onClick={() => onNavigate(name)}
      className={`flex items-center px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 border-2 ${
        view === name
          ? 'bg-primary-500 border-primary-500 text-white shadow-md'
          : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <header className="text-center mb-6">
      <div className="flex justify-center items-center mb-2 space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <Sparkles className="w-6 h-6 text-yellow-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-1">AI Quiz Generator</h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Quizzes written by AI, powered by Spring Cloud microservices
      </p>
      {showNav && (
        <div className="flex justify-center gap-3 mt-4">
          {tab('home', 'New Quiz', <Home className="w-4 h-4 mr-2" />)}
          {tab('history', 'History & Stats', <BarChart3 className="w-4 h-4 mr-2" />)}
        </div>
      )}
    </header>
  );
};

export default Header;
