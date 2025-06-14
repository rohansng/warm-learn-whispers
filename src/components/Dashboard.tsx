
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TILEntry, User } from '../types';
import Header from './Header';
import TILForm from './TILForm';
import TILList from './TILList';
import RandomTIL from './RandomTIL';
import ChatSystem from './Chat/ChatWindow';
import { getNotesByUserId } from '@/utils/supabaseStorage';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  username: string;
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ username, user, onLogout }) => {
  const [entries, setEntries] = useState<TILEntry[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, [user?.id, username]);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      const notes = await getNotesByUserId(user.id);
      setEntries(notes);

      // Fetch the profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Fallback to metadata username if profile doesn't exist
        const metaUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
        setUserData({
          id: user.id,
          username: metaUsername,
          email: user.email || '',
          totalEntries: notes.length,
          lastVisit: new Date()
        });
      } else {
        setUserData({
          id: user.id,
          username: profile?.username || 'User',
          email: user.email || '',
          totalEntries: notes.length,
          lastVisit: profile?.last_visit ? new Date(profile.last_visit) : new Date()
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        variant: "destructive",
        title: "Data Error",
        description: "Failed to load user data. Please try again.",
      });
    }
  };

  const addEntry = (newEntry: TILEntry) => {
    setEntries([newEntry, ...entries]);
    setUserData(prev => prev ? { ...prev, totalEntries: prev.totalEntries + 1 } : null);
  };

  return (
    <div className="min-h-screen bg-gradient-warm font-poppins">
      <Header 
        user={userData} 
        authUser={user}
        onLogout={onLogout} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <TILForm userId={user.id} username={username} onEntryAdded={addEntry} />
            <TILList entries={entries} />
          </div>
          <div className="space-y-6">
            <RandomTIL userId={user.id} />
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Chat System</h3>
              <p className="text-gray-600 mb-4">Connect with other learners and share your insights!</p>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="w-full bg-lavender-500 hover:bg-lavender-600 text-white font-semibold py-3 rounded-xl transition-all duration-300"
              >
                {isChatOpen ? 'Close Chat' : 'Open Chat'}
              </button>
            </div>
          </div>
        </div>

        {isChatOpen && (
          <ChatSystem 
            userId={user.id}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
