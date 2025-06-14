
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-lavender-100 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Today I Learned</h1>
            {user && (
              <p className="text-sm text-gray-600">
                {user.totalEntries} learning moments captured
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">@{user.username}</p>
              {user.lastVisit && (
                <p className="text-xs text-gray-500">
                  Last visit: {new Date(user.lastVisit).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-lavender-300 text-lavender-700 hover:bg-lavender-50"
          >
            Switch User
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
