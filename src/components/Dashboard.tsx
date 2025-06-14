
import React, { useState, useEffect } from 'react';
import { TILEntry, User as AppUser } from '../types';
import { User } from '@supabase/supabase-js';
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
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ username, user, onLogout }) => {
  const [entries, setEntries] = useState<TILEntry[]>([]);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
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
  }, [username, user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      console.log('Loading user data for:', username, 'User ID:', user.id);
      
      // Get or create user profile using the authenticated user's ID
      let profile = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile.error && profile.error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        console.log('Creating new profile for:', username);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id, // Use the authenticated user's ID
            username: username,
            email: user.email || '',
            total_entries: 0,
            last_visit: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Failed to create profile:', createError);
          setLoading(false);
          return;
        }
        profile.data = newProfile;
      }

      if (profile.error) {
        console.error('Error fetching profile:', profile.error);
        setLoading(false);
        return;
      }

      // Update last visit
      await supabase
        .from('profiles')
        .update({ last_visit: new Date().toISOString() })
        .eq('id', user.id);

      // Get user's notes
      const { data: userEntries, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        setLoading(false);
        return;
      }

      const formattedEntries = (userEntries || []).map(note => ({
        id: note.id,
        username: username,
        content: note.content,
        tags: note.tags || [],
        date: note.date,
        emoji: note.emoji || '📚',
        createdAt: new Date(note.created_at)
      }));

      setEntries(formattedEntries);

      // Update total entries count
      await supabase
        .from('profiles')
        .update({ total_entries: formattedEntries.length })
        .eq('id', user.id);

      setAppUser({
        username: profile.data.username,
        totalEntries: formattedEntries.length,
        lastVisit: profile.data.last_visit ? new Date(profile.data.last_visit) : undefined
      });

      // Get random memory and check if should show add entry
      const memory = await getRandomPastEntryFromDB(user.id);
      setRandomMemory(memory ? { ...memory, username } : null);

      const hasToday = await hasEntryForTodayInDB(user.id);
      console.log('Has entry for today:', hasToday);
      setShowAddEntry(!hasToday);
    } catch (error) {
      console.error('Error loading user data:', error);
      setAppUser({
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
      <Header user={appUser} onLogout={onLogout} />
      
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
              ✨ Your notes are securely stored and synced!
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
              <AddEntryCard username={username} userId={user.id} onEntryAdded={handleEntryAdded} />
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
