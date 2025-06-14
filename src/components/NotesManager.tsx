
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Note {
  id: string;
  user_id: string;
  content: string;
  tags: string[];
  emoji: string;
  date: string;
  created_at: string;
  updated_at: string;
}

interface NotesManagerProps {
  children: (props: {
    notes: Note[];
    addNote: (content: string, tags: string[], emoji: string) => Promise<void>;
    updateNote: (id: string, content: string, tags: string[], emoji: string) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    loading: boolean;
  }) => React.ReactNode;
}

const NotesManager: React.FC<NotesManagerProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    fetchNotes();
    setupRealtimeSubscription();
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load your notes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
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
  };

  const addNote = async (content: string, tags: string[], emoji: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          content,
          tags,
          emoji,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Note added!",
        description: "Your learning moment has been saved.",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to save your note.",
        variant: "destructive",
      });
    }
  };

  const updateNote = async (id: string, content: string, tags: string[], emoji: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content, tags, emoji, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Note updated!",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update your note.",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Note deleted",
        description: "Your note has been removed.",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete your note.",
        variant: "destructive",
      });
    }
  };

  return <>{children({ notes, addNote, updateNote, deleteNote, loading })}</>;
};

export default NotesManager;
