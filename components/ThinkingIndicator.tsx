import React from 'react';

const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-4 bg-white/50 rounded-2xl max-w-[200px] animate-pulse">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm font-medium text-indigo-600">Thinking deeply...</span>
    </div>
  );
};

export default ThinkingIndicator;
