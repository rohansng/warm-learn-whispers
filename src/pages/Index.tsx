
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import Auth from './Auth';
import Dashboard from '../components/Dashboard';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

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
    setUser(authenticatedUser);
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
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
      <div className="min-h-screen bg-gradient-warm font-poppins flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-gray-600">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Get username from user metadata or email
  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';

  return <Dashboard username={username} user={user} onLogout={handleLogout} />;
};

export default Index;
