
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Note {
  id: string;
  user_id: string;
  content: string;
  tags: string[];
  emoji?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotes = async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load your notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (content: string, tags: string[], emoji?: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          content,
          tags,
          emoji,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      toast({
        title: "Note saved!",
        description: "Your learning has been captured ✨"
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to save your note",
        variant: "destructive"
      });
      return { error };
    }
  };

  const hasNoteForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return notes.some(note => note.date === today);
  };

  const getRandomPastNote = () => {
    const today = new Date().toISOString().split('T')[0];
    const pastNotes = notes.filter(note => note.date !== today);
    if (pastNotes.length === 0) return null;
    return pastNotes[Math.floor(Math.random() * pastNotes.length)];
  };

  const getStreakCount = () => {
    if (notes.length === 0) return 0;
    
    const sortedDates = [...new Set(notes.map(note => note.date))].sort((a, b) => b.localeCompare(a));
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const noteDate = new Date(sortedDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (noteDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes(prev => [payload.new as Note, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotes(prev => prev.map(note => 
              note.id === payload.new.id ? payload.new as Note : note
            ));
          } else if (payload.eventType === 'DELETE') {
            setNotes(prev => prev.filter(note => note.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notes,
    loading,
    addNote,
    hasNoteForToday,
    getRandomPastNote,
    getStreakCount,
    refetch: fetchNotes
  };
};
