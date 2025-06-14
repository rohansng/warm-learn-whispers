
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { User as AppUser } from '../types';
import Header from './Header';
import DashboardTabs from './Dashboard/DashboardTabs';
import GuestBanner from './Dashboard/GuestBanner';
import LoadingSpinner from './Dashboard/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { getNotesByUserId, createProfile, updateProfile } from '@/utils/supabaseStorage';
import { TILEntry } from '../types';

interface DashboardProps {
  username: string;
  user: User | AppUser;
  onLogout: () => void;
  isGuest?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ username, user, onLogout, isGuest = false }) => {
  const [entries, setEntries] = useState<TILEntry[]>([]);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [randomEntry, setRandomEntry] = useState<TILEntry | null>(null);
  const { toast } = useToast();

  // Load user data and entries
  useEffect(() => {
    loadUserData();
  }, [user]);

  // Set random entry when entries change
  useEffect(() => {
    if (entries.length > 0) {
      const randomIndex = Math.floor(Math.random() * entries.length);
      setRandomEntry(entries[randomIndex]);
    }
  }, [entries]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      let userId: string;
      
      if (isGuest) {
        // Guest user
        const guestUser = user as AppUser;
        userId = guestUser.id;
        setUserProfile(guestUser);
      } else {
        // Authenticated user
        const authUser = user as User;
        userId = authUser.id;
        
        // For authenticated users, we might need to create/update profile
        const metaUsername = authUser.user_metadata?.username || authUser.email?.split('@')[0] || username;
        const profile = await createProfile(userId, metaUsername, authUser.email || '');
        
        if (profile) {
          const appUser: AppUser = {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            totalEntries: profile.total_entries || 0,
            lastVisit: profile.last_visit || new Date().toISOString()
          };
          setUserProfile(appUser);
        }
      }
      
      // Load entries
      const userEntries = await getNotesByUserId(userId);
      const formattedEntries = userEntries.map(entry => ({
        ...entry,
        username: username
      }));
      
      setEntries(formattedEntries);
      
      // Update last visit
      if (userProfile) {
        await updateProfile(userId, { 
          last_visit: new Date().toISOString(),
          total_entries: userEntries.length
        });
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        variant: "destructive",
        title: "Loading Error",
        description: "Failed to load your data. Please try refreshing the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEntryAdded = () => {
    // Reload entries after a new one is added
    loadUserData();
  };

  const handleEntryUpdate = (updatedEntry: TILEntry) => {
    setEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
  };

  const handleEntryDelete = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
    if (userProfile) {
      setUserProfile(prev => prev ? { ...prev, totalEntries: Math.max(0, prev.totalEntries - 1) } : null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-warm font-poppins">
      <Header 
        user={userProfile} 
        authUser={isGuest ? undefined : (user as User)}
        onLogout={onLogout}
        isGuest={isGuest}
      />
      
      <main className="container mx-auto px-4 py-6">
        {isGuest && <GuestBanner username={username} />}

        <DashboardTabs
          user={user}
          username={username}
          entries={entries}
          userProfile={userProfile}
          randomEntry={randomEntry}
          isGuest={isGuest}
          onEntryAdded={handleEntryAdded}
          onEntryUpdate={handleEntryUpdate}
          onEntryDelete={handleEntryDelete}
        />
      </main>
    </div>
  );
};

export default Dashboard;
