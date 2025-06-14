
import React, { useState, useEffect } from 'react';
import { TILEntry, User } from '../types';
import { 
  getProfileByUsername, 
  createProfile, 
  updateProfile, 
  getNotesByUserId,
  hasEntryForTodayInDB,
  getRandomPastEntryFromDB
} from '../utils/supabaseStorage';
import { supabase } from "@/integrations/supabase/client";
import Header from './Header';
import AddEntryCard from './AddEntryCard';
import TimelineView from './TimelineView';
import RandomMemoryCard from './RandomMemoryCard';
import Footer from './Footer';
import UserChat from './UserChat';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [entries, setEntries] = useState<TILEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [randomMemory, setRandomMemory] = useState<TILEntry | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    
    // Set up realtime subscription for notes
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        () => {
          console.log('Notes changed, reloading data...');
          loadUserData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      console.log('Loading user data for:', username);
      
      // Get or create user profile
      let profile = await getProfileByUsername(username);
      console.log('Profile found:', profile);
      
      if (!profile) {
        console.log('Creating new profile for:', username);
        profile = await createProfile(username);
        
        if (!profile) {
          console.error('Failed to create profile for:', username);
          // Still show the interface, but with limited functionality
          setUser({
            username: username,
            totalEntries: 0,
            lastVisit: undefined
          });
          setLoading(false);
          return;
        }
      }

      // Update last visit and get notes
      const updatedProfile = await updateProfile(profile.id, {
        last_visit: new Date().toISOString()
      });

      const userEntries = await getNotesByUserId(profile.id);
      console.log('User entries:', userEntries);
      setEntries(userEntries.map(entry => ({ ...entry, username })));

      // Update total entries count
      await updateProfile(profile.id, {
        total_entries: userEntries.length
      });

      setUser({
        username: profile.username,
        totalEntries: userEntries.length,
        lastVisit: profile.last_visit ? new Date(profile.last_visit) : undefined
      });

      // Get random memory and check if should show add entry
      const memory = await getRandomPastEntryFromDB(profile.id);
      setRandomMemory(memory ? { ...memory, username } : null);

      const hasToday = await hasEntryForTodayInDB(profile.id);
      console.log('Has entry for today:', hasToday);
      setShowAddEntry(!hasToday);
    } catch (error) {
      console.error('Error loading user data:', error);
      // If there's an error, still show the add entry card and basic user info
      setUser({
        username: username,
        totalEntries: 0,
        lastVisit: undefined
      });
      setShowAddEntry(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryAdded = () => {
    console.log('Entry added, reloading data...');
    loadUserData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm font-poppins flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-600">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm font-poppins">
      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Welcome back message */}
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {username}! 👋
            </h1>
            <p className="text-gray-600">
              {entries.length === 0 
                ? "Ready to start your learning journey?" 
                : `You've captured ${entries.length} amazing learning moment${entries.length === 1 ? '' : 's'}!`
              }
            </p>
            <p className="text-sm text-blue-600 mt-2">
              ✨ Your notes now sync across all devices!
            </p>
          </div>

          {/* Random memory card */}
          {randomMemory && (
            <div className="animate-fade-in-up">
              <RandomMemoryCard entry={randomMemory} />
            </div>
          )}

          {/* Add entry card */}
          {showAddEntry && (
            <div className="animate-scale-in">
              <AddEntryCard username={username} onEntryAdded={handleEntryAdded} />
            </div>
          )}

          {/* Timeline view */}
          <div className="animate-fade-in-up">
            <TimelineView entries={entries} />
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Chat Component */}
      <UserChat username={username} />
    </div>
  );
};

export default Dashboard;
