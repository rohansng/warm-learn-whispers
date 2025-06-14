
import React from 'react';
import { User } from '@supabase/supabase-js';
import Auth from '../../pages/Auth';
import Dashboard from '../Dashboard';
import Footer from '../Footer';
import LoadingScreen from './LoadingScreen';
import { User as AppUser } from '../../types';

interface AppLayoutProps {
  user: User | null;
  guestUser: AppUser | null;
  loading: boolean;
  onAuthSuccess: (user: User) => void;
  onGuestSuccess: (user: AppUser) => void;
  onLogout: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  user,
  guestUser,
  loading,
  onAuthSuccess,
  onGuestSuccess,
  onLogout
}) => {
  console.log('Current state - user:', user?.email, 'guestUser:', guestUser?.username, 'loading:', loading);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user && !guestUser) {
    console.log('Rendering Auth component - no user or guest user found');
    return (
      <div className="min-h-screen bg-gradient-warm font-poppins flex flex-col">
        <div className="flex-1">
          <Auth 
            onAuthSuccess={onAuthSuccess}
            onGuestSuccess={onGuestSuccess}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // Determine username for display
  let username = 'User';
  let currentUser = null;

  if (user) {
    // Authenticated user
    username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
    currentUser = user;
    console.log('Rendering dashboard for authenticated user:', username);
  } else if (guestUser) {
    // Guest user
    username = guestUser.username;
    currentUser = guestUser;
    console.log('Rendering dashboard for guest user:', username);
  }

  return (
    <div className="min-h-screen bg-gradient-warm font-poppins flex flex-col">
      <div className="flex-1">
        <Dashboard 
          username={username} 
          user={currentUser} 
          onLogout={onLogout}
          isGuest={!!guestUser}
        />
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
