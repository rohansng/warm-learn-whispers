
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardHeader from './DashboardHeader';
import AddNoteForm from './AddNoteForm';
import NotesTimeline from './NotesTimeline';
import NotesManager from './NotesManager';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [streak, setStreak] = useState(0);
  const { user } = useAuth();

  const calculateStreak = (notes: any[]) => {
    if (notes.length === 0) return 0;

    const today = new Date();
    const sortedNotes = notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    let currentDate = new Date(today);
    
    // Check if there's a note for today
    const todayStr = today.toISOString().split('T')[0];
    const hasToday = sortedNotes.some(note => note.date === todayStr);
    
    if (!hasToday) {
      // If no note today, check if there was one yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Count consecutive days with notes
    for (let i = 0; i < sortedNotes.length; i++) {
      const noteDate = currentDate.toISOString().split('T')[0];
      const hasNoteForDate = sortedNotes.some(note => note.date === noteDate);
      
      if (hasNoteForDate) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  useEffect(() => {
    // Check if user should see add form (no note for today)
    const today = new Date().toISOString().split('T')[0];
    // This will be handled by NotesManager
  }, []);

  return (
    <NotesManager>
      {({ notes, addNote, updateNote, deleteNote, loading }) => {
        const todayNote = notes.find(note => note.date === new Date().toISOString().split('T')[0]);
        const shouldShowAddForm = !todayNote && !showAddForm;
        
        // Calculate streak when notes change
        React.useEffect(() => {
          setStreak(calculateStreak(notes));
        }, [notes]);

        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
            <div className="absolute inset-0 bg-black/30"></div>
            
            <div className="relative z-10">
              <DashboardHeader noteCount={notes.length} streak={streak} />
              
              <main className="container mx-auto px-6 py-8 max-w-4xl">
                <div className="space-y-8">
                  {/* Welcome Message */}
                  <div className="text-center animate-fade-in">
                    <h1 className="text-4xl font-bold text-white mb-4">
                      Welcome back! 👋
                    </h1>
                    <p className="text-red-200 text-lg">
                      {notes.length === 0 
                        ? "Ready to start your learning journey?" 
                        : `You've captured ${notes.length} amazing learning moment${notes.length === 1 ? '' : 's'}!`
                      }
                    </p>
                    {todayNote && (
                      <p className="text-red-300 text-sm mt-2">
                        ✅ You've already logged your learning for today!
                      </p>
                    )}
                  </div>

                  {/* Add Note Form */}
                  {(shouldShowAddForm || showAddForm) && (
                    <div className="animate-scale-in">
                      <AddNoteForm 
                        onAddNote={async (content, tags, emoji) => {
                          await addNote(content, tags, emoji);
                          setShowAddForm(false);
                        }}
                        disabled={loading}
                      />
                    </div>
                  )}

                  {/* Timeline View */}
                  <div className="animate-fade-in-up">
                    <NotesTimeline 
                      notes={notes}
                      onUpdateNote={updateNote}
                      onDeleteNote={deleteNote}
                    />
                  </div>
                </div>
              </main>

              {/* Floating Add Button */}
              {!showAddForm && !shouldShowAddForm && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 shadow-2xl z-50 transition-all duration-300 hover:scale-110"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              )}
            </div>
          </div>
        );
      }}
    </NotesManager>
  );
};

export default Dashboard;
