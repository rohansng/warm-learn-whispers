
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Settings } from 'lucide-react';

interface Profile {
  username: string;
  email: string;
  avatar_url?: string;
}

interface DashboardHeaderProps {
  noteCount: number;
  streak: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ noteCount, streak }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, email, avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-black/40 backdrop-blur-lg border-b border-red-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">📚</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Today I Learned</h1>
              <p className="text-red-200 text-sm">
                {noteCount} learning moments captured
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Streak Badge */}
            <div className="bg-red-600/20 px-3 py-1 rounded-full border border-red-500/30">
              <span className="text-red-200 text-sm font-medium">
                🔥 {streak}-day streak
              </span>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="border-2 border-red-500/30">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-red-600 text-white">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-right hidden sm:block">
                <p className="text-white font-medium">@{profile?.username}</p>
                <p className="text-red-200 text-xs">{profile?.email}</p>
              </div>
            </div>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-200 hover:bg-red-500/10 hover:border-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
