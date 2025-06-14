
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import StreakBadge from './StreakBadge';

interface HeaderProps {
  streakCount: number;
}

const Header: React.FC<HeaderProps> = ({ streakCount }) => {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-lavender-100 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Today I Learned</h1>
            {profile && (
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">
                  Learning moments captured
                </p>
                <StreakBadge streakCount={streakCount} />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {profile && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">@{profile.username}</p>
              <p className="text-xs text-gray-500">
                {profile.email}
              </p>
            </div>
          )}
          <Button
            onClick={signOut}
            variant="outline"
            className="border-lavender-300 text-lavender-700 hover:bg-lavender-50"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
