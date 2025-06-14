
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { User as AppUser } from '../types';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [guestUser, setGuestUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Check for existing guest session
    const storedGuestUser = localStorage.getItem('guestUser');
    console.log('Checking for stored guest user:', storedGuestUser);
    
    if (storedGuestUser) {
      try {
        const parsedGuestUser = JSON.parse(storedGuestUser);
        if (mounted) {
          console.log('Found stored guest user:', parsedGuestUser);
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
        console.log('Handling session:', session?.user?.email);
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
    console.log('Guest success received in Index:', guestUserData);
    
    // Clear any existing auth state
    setUser(null);
    
    // Set guest user state
    setGuestUser(guestUserData);
    setLoading(false);
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('guestUser', JSON.stringify(guestUserData));
      console.log('Guest user stored in localStorage successfully');
    } catch (error) {
      console.error('Failed to store guest user in localStorage:', error);
    }
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

  return {
    user,
    guestUser,
    loading,
    handleAuthSuccess,
    handleGuestSuccess,
    handleLogout
  };
};
