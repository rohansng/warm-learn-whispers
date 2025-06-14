
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User } from '../types';
import { User as AuthUser } from '@supabase/supabase-js';
import UserProfile from './UserProfile';
import { Settings, LogOut, UserCheck } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  authUser?: AuthUser;
  onLogout: () => void;
  isGuest?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, authUser, onLogout, isGuest = false }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleProfileUpdate = (newUsername: string) => {
    setIsProfileOpen(false);
  };

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
        
        <div className="flex items-center space-x-3">
          {user && (
            <div className="text-right hidden sm:block">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-800">@{user.username}</p>
                {isGuest && (
                  <Badge variant="outline" className="border-mint-300 text-mint-700 text-xs">
                    <UserCheck className="w-3 h-3 mr-1" />
                    Guest
                  </Badge>
                )}
              </div>
              {user.lastVisit && (
                <p className="text-xs text-gray-500">
                  Last visit: {new Date(user.lastVisit).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          
          {authUser && !isGuest && (
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-lavender-300 text-lavender-700 hover:bg-lavender-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 border-0 bg-transparent shadow-none">
                <UserProfile 
                  user={authUser} 
                  onProfileUpdate={handleProfileUpdate}
                />
              </DialogContent>
            </Dialog>
          )}
          
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isGuest ? 'Exit Guest' : 'Sign Out'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
