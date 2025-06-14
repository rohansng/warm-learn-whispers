
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import Header from './Header';
import AddEntryCard from './AddEntryCard';
import TimelineView from './TimelineView';
import RandomMemoryCard from './RandomMemoryCard';
import Footer from './Footer';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { notes, loading, hasNoteForToday, getRandomPastNote, getStreakCount } = useNotes();

  const randomMemory = getRandomPastNote();
  const showAddEntry = !hasNoteForToday();
  const streakCount = getStreakCount();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-lavender-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm font-poppins">
      <Header streakCount={streakCount} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Welcome back message */}
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {profile?.username || 'learner'}! 👋
            </h1>
            <p className="text-gray-600">
              {notes.length === 0 
                ? "Ready to start your learning journey?" 
                : `You've captured ${notes.length} amazing learning moment${notes.length === 1 ? '' : 's'}!`
              }
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
              <AddEntryCard />
            </div>
          )}

          {/* Timeline view */}
          <div className="animate-fade-in-up">
            <TimelineView entries={notes} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
