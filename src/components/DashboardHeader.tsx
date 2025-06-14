
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';

const DashboardHeader = () => {
  const { auth, signOut } = useAuth();

  return (
    <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-xl font-semibold text-white">Today I Learned</h1>
            <p className="text-sm text-gray-300">
              Your personal learning journal
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-white">
            <User className="w-5 h-5" />
            <span className="hidden sm:block">@{auth.profile?.username}</span>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
