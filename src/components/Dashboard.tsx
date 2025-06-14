
import React, { useState, useEffect } from 'react';
import { TILEntry, User as AppUser } from '../types';
import { User } from '@supabase/supabase-js';
import { 
  getNotesByUserId,
  getRandomPastEntryFromDB
} from '../utils/supabaseStorage';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      
      // Get or create user profile with better error handling
      let profileData = null;
      
      try {
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        if (!existingProfile) {
          // Profile doesn't exist, create one with unique username
          console.log('Creating new profile for:', username);
          const baseUsername = user.user_metadata?.username || username || user.email?.split('@')[0] || 'user';
          const uniqueUsername = `${baseUsername}${Date.now().toString().slice(-4)}`;
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              username: uniqueUsername,
              email: user.email || '',
              total_entries: 0,
              last_visit: new Date().toISOString()
            }])
            .select()
            .maybeSingle();

          if (createError) {
            console.error('Failed to create profile:', createError);
            // Continue without profile creation failure blocking the app
          } else {
            profileData = newProfile;
          }
        } else {
          profileData = existingProfile;
          // Update last visit
          await supabase
            .from('profiles')
            .update({ last_visit: new Date().toISOString() })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Profile handling error:', error);
        // Don't block the app if profile operations fail
      }

      // Get user's notes
      const { data: userEntries, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        setEntries([]);
      } else {
        const formattedEntries = (userEntries || []).map(note => ({
          id: note.id,
          username: profileData?.username || username,
          content: note.content,
          tags: note.tags || [],
          date: note.date,
          emoji: note.emoji || '📚',
          createdAt: new Date(note.created_at)
        }));
        setEntries(formattedEntries);

        // Update total entries count if profile exists
        if (profileData) {
          await supabase
            .from('profiles')
            .update({ total_entries: formattedEntries.length })
            .eq('id', user.id);
        }
      }

      setAppUser({
        username: profileData?.username || username,
        totalEntries: userEntries?.length || 0,
        lastVisit: profileData?.last_visit ? new Date(profileData.last_visit) : undefined
      });

      // Get random memory
      const memory = await getRandomPastEntryFromDB(user.id);
      setRandomMemory(memory ? { ...memory, username: profileData?.username || username } : null);

    } catch (error) {
      console.error('Error loading user data:', error);
      setAppUser({
        username: username,
        totalEntries: 0,
        lastVisit: undefined
      });
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
          <div className="text-4xl mb-4 animate-pulse">📚</div>
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
              Welcome back, {appUser?.username || username}! 👋
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

          {/* Add entry card - Always show */}
          <div className="animate-scale-in">
            <AddEntryCard username={appUser?.username || username} userId={user.id} onEntryAdded={handleEntryAdded} />
          </div>

          {/* Timeline view */}
          <div className="animate-fade-in-up">
            <TimelineView entries={entries} />
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Chat Component */}
      <UserChat username={appUser?.username || username} />
    </div>
  );
};

export default Dashboard;
