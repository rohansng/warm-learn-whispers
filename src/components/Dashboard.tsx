
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { User as AppUser } from '../types';
import Header from './Header';
import AddEntryCard from './AddEntryCard';
import TILList from './TILList';
import RandomMemoryCard from './RandomMemoryCard';
import TimelineView from './TimelineView';
import ChatSystem from './Chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Book, MessageCircle, Clock, Sparkles } from 'lucide-react';
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
  const { toast } = useToast();

  // Load user data and entries
  useEffect(() => {
    loadUserData();
  }, [user]);

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

  const handleNewEntry = (newEntry: TILEntry) => {
    setEntries(prev => [newEntry, ...prev]);
    if (userProfile) {
      setUserProfile(prev => prev ? { ...prev, totalEntries: prev.totalEntries + 1 } : null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm font-poppins flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
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
        {isGuest && (
          <div className="mb-6 p-4 bg-mint-50 border border-mint-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">👤</div>
              <div>
                <p className="font-medium text-mint-800">Guest Mode Active</p>
                <p className="text-sm text-mint-600">
                  Your learning data is saved and will be accessible on any device using the username "{username}".
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm mb-6">
            <TabsTrigger value="today" className="flex items-center space-x-2">
              <Book className="w-4 h-4" />
              <span>Today</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="memories" className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Memories</span>
            </TabsTrigger>
            {!isGuest && (
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <AddEntryCard 
                  userId={user.id} 
                  username={username} 
                  onNewEntry={handleNewEntry}
                />
                <TILList entries={entries} />
              </div>
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-lavender-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Learnings</span>
                      <Badge variant="secondary" className="bg-lavender-100 text-lavender-700">
                        {userProfile?.totalEntries || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Month</span>
                      <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                        {entries.filter(entry => {
                          const entryDate = new Date(entry.date);
                          const now = new Date();
                          return entryDate.getMonth() === now.getMonth() && 
                                 entryDate.getFullYear() === now.getFullYear();
                        }).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Type</span>
                      <Badge variant={isGuest ? "outline" : "default"} className={isGuest ? "border-mint-300 text-mint-700" : "bg-lavender-500 text-white"}>
                        {isGuest ? "Guest" : "Member"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineView entries={entries} />
          </TabsContent>

          <TabsContent value="memories">
            <RandomMemoryCard userId={user.id} />
          </TabsContent>

          {!isGuest && (
            <TabsContent value="chat">
              <ChatSystem userId={user.id} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
