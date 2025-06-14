
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, MessageCircle, Clock, Sparkles } from 'lucide-react';
import AddEntryCard from '../AddEntryCard';
import TILList from '../TILList';
import TimelineView from '../TimelineView';
import RandomMemoryCard from '../RandomMemoryCard';
import ChatSystem from '../Chat';
import ProgressSidebar from './ProgressSidebar';
import { TILEntry, User } from '../../types';

interface DashboardTabsProps {
  user: any;
  username: string;
  entries: TILEntry[];
  userProfile: User | null;
  randomEntry: TILEntry | null;
  isGuest: boolean;
  onEntryAdded: (newEntry: TILEntry) => void;
  onEntryUpdate: (updatedEntry: TILEntry) => void;
  onEntryDelete: (entryId: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  user,
  username,
  entries,
  userProfile,
  randomEntry,
  isGuest,
  onEntryAdded,
  onEntryUpdate,
  onEntryDelete
}) => {
  return (
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
              onEntryAdded={onEntryAdded}
            />
            <TILList 
              entries={entries}
              onEntryUpdate={onEntryUpdate}
              onEntryDelete={onEntryDelete}
            />
          </div>
          <div className="space-y-6">
            <ProgressSidebar 
              userProfile={userProfile}
              entries={entries}
              isGuest={isGuest}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="timeline">
        <TimelineView entries={entries} />
      </TabsContent>

      <TabsContent value="memories">
        {randomEntry ? (
          <RandomMemoryCard entry={randomEntry} />
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-600">No memories to show yet. Start learning to create some!</p>
          </div>
        )}
      </TabsContent>

      {!isGuest && (
        <TabsContent value="chat">
          <ChatSystem userId={user.id} />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default DashboardTabs;
