
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/auth';
import DashboardHeader from './DashboardHeader';
import NotesTimeline from './NotesTimeline';
import AddNoteForm from './AddNoteForm';
import StreakBadge from './StreakBadge';
import FloatingAddButton from './FloatingAddButton';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Dashboard = () => {
  const { auth } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (auth.user) {
      fetchNotes();
      subscribeToNotes();
    }
  }, [auth.user]);

  const fetchNotes = async () => {
    if (!auth.user) return;

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const subscribeToNotes = () => {
    if (!auth.user) return;

    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${auth.user.id}`,
        },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addNote = async (content: string, tags: string[], emoji: string) => {
    if (!auth.user) return;

    const { error } = await supabase
      .from('notes')
      .insert({
        user_id: auth.user.id,
        content,
        tags,
        emoji,
        date: new Date().toISOString().split('T')[0],
      });

    if (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } else {
      toast.success('Note added successfully! 🎉');
      setShowAddForm(false);
    }
  };

  const filteredNotes = selectedTags.length > 0
    ? notes.filter(note => 
        selectedTags.some(tag => note.tags.includes(tag))
      )
    : notes;

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your learning journey...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {auth.profile?.username} 👋
              </h1>
              <StreakBadge notes={notes} />
            </div>
            <p className="text-gray-300 text-lg">
              {notes.length === 0 
                ? "What did you learn today?" 
                : `You've captured ${notes.length} learning moment${notes.length === 1 ? '' : 's'}!`
              }
            </p>
          </div>

          {/* Add Note Button */}
          {!showAddForm && (
            <div className="text-center">
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Writing
              </Button>
            </div>
          )}

          {/* Add Note Form */}
          {showAddForm && (
            <AddNoteForm
              onSubmit={addNote}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-white font-medium">Filter by tags:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTags([])}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.length === 0
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes Timeline */}
          <NotesTimeline notes={filteredNotes} />
        </div>
      </main>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setShowAddForm(true)} />
    </div>
  );
};

export default Dashboard;
