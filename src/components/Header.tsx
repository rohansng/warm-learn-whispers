
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="glass sticky top-0 z-50 border-b border-cherry-red/30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="pulse-cherry p-2 rounded-full bg-gradient-primary">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h1 className="text-xl font-orbitron font-semibold gradient-text">Today I Learned</h1>
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
                <p className="text-xs text-cherry-red">
                  Last visit: {new Date(user.lastVisit).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          <Button
            onClick={onLogout}
            className="glass-card hover:glow-cherry-hover border-cherry-red/50 text-cherry-red hover:text-white font-medium px-6 py-2 rounded-lg transition-all duration-300"
          >
            Switch User
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
