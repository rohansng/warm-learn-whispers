
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading your dashboard..." }) => {
  return (
    <div className="min-h-screen bg-gradient-warm font-poppins flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">📚</div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
