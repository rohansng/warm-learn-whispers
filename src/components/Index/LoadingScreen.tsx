
import React from 'react';
import Footer from '../Footer';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-warm font-poppins flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-gray-600">Loading your learning journey...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoadingScreen;
