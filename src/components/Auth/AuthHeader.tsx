
import React from 'react';
import { CardHeader, CardDescription, CardTitle } from '@/components/ui/card';

interface AuthHeaderProps {
  isLogin: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ isLogin }) => {
  return (
    <CardHeader className="text-center space-y-4">
      <div className="text-4xl mb-2">📚✨</div>
      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-lavender-600 to-blush-500 bg-clip-text text-transparent">
        Today I Learned
      </CardTitle>
      <CardDescription className="text-gray-600">
        {isLogin ? 'Welcome back! Sign in to continue your learning journey.' : 'Create an account to start tracking your daily learnings.'}
      </CardDescription>
    </CardHeader>
  );
};

export default AuthHeader;
