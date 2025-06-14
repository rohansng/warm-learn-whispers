
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="glass backdrop-blur-md border-b border-crimson-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-4xl animate-bounce-gentle">📚</div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-crimson-300 bg-clip-text text-transparent">
              Today I Learned
            </h1>
            {user && (
              <p className="text-sm text-gray-300 font-medium">
                <span className="text-cherry-400">{user.totalEntries}</span> learning moments captured
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-right hidden sm:block glass-card px-4 py-2 rounded-lg">
              <p className="text-sm font-semibold text-white">@{user.username}</p>
              {user.lastVisit && (
                <p className="text-xs text-gray-400">
                  Last visit: {new Date(user.lastVisit).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          <Button
            onClick={onLogout}
            className="bg-gradient-button hover:glow-red-intense text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 border border-crimson-500/30"
          >
            Switch User
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
