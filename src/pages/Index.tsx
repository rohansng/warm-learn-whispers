
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import Auth from './Auth';
import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import { User as AppUser } from '../types';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [guestUser, setGuestUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Check for existing guest session
    const storedGuestUser = localStorage.getItem('guestUser');
    if (storedGuestUser) {
      try {
        const parsedGuestUser = JSON.parse(storedGuestUser);
        if (mounted) {
          setGuestUser(parsedGuestUser);
          setLoading(false);
          return; // Skip auth check if guest user exists
        }
      } catch (error) {
        console.error('Failed to parse guest user:', error);
        localStorage.removeItem('guestUser');
      }
    }

    // Function to handle session changes
    const handleSession = (session: any) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "There was an issue loading your session. Please try refreshing the page.",
        });
      }
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          toast({
            title: "Signed Out",
            description: "You have been successfully signed out.",
          });
        }
      } else if (event === 'SIGNED_IN') {
        // Clear guest session when user signs in
        localStorage.removeItem('guestUser');
        setGuestUser(null);
        handleSession(session);
        if (mounted && session?.user) {
          toast({
            title: "Welcome!",
            description: "You're now signed in.",
          });
        }
      } else if (event === 'TOKEN_REFRESHED') {
        handleSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const handleAuthSuccess = (authenticatedUser: User) => {
    console.log('Auth success:', authenticatedUser);
    setUser(authenticatedUser);
    setGuestUser(null); // Clear guest state
    localStorage.removeItem('guestUser'); // Clear guest storage
    setLoading(false);
  };

  const handleGuestSuccess = (guestUserData: AppUser) => {
    console.log('Guest success:', guestUserData);
    setGuestUser(guestUserData);
    setUser(null); // Clear auth state
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      if (user) {
        // Regular user logout
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({
            variant: "destructive",
            title: "Logout Error",
            description: error.message,
          });
        } else {
          setUser(null);
        }
      } else if (guestUser) {
        // Guest logout
        localStorage.removeItem('guestUser');
        setGuestUser(null);
        toast({
          title: "Logged Out",
          description: "You've been logged out. Your data is saved and can be accessed anytime with your username.",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: "An unexpected error occurred during logout.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm font-poppins">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-bounce">📚</div>
            <p className="text-gray-600">Loading your learning journey...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user && !guestUser) {
    return (
      <>
        <Auth 
          onAuthSuccess={handleAuthSuccess}
          onGuestSuccess={handleGuestSuccess}
        />
      </>
    );
  }

  // Determine username for display
  let username = 'User';
  let currentUser = null;

  if (user) {
    // Authenticated user
    username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
    currentUser = user;
  } else if (guestUser) {
    // Guest user
    username = guestUser.username;
    currentUser = guestUser;
  }

  return (
    <div className="min-h-screen bg-gradient-warm font-poppins flex flex-col">
      <div className="flex-1">
        <Dashboard 
          username={username} 
          user={currentUser} 
          onLogout={handleLogout}
          isGuest={!!guestUser}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
