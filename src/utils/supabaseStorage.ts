
import { supabase } from "@/integrations/supabase/client";
import { TILEntry, User } from '../types';

export const getProfileByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

export const createProfile = async (username: string): Promise<any> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: crypto.randomUUID(),
      username,
      email: '',
      total_entries: 0,
      last_visit: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (profileId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
};

export const getNotesByUserId = async (userId: string): Promise<TILEntry[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  return data.map(note => ({
    id: note.id,
    username: '', // We'll set this in the component
    content: note.content,
    tags: note.tags || [],
    date: note.date,
    emoji: note.emoji || '📚',
    createdAt: new Date(note.created_at)
  }));
};

export const saveNote = async (userId: string, entry: Omit<TILEntry, 'id' | 'username' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([{
      user_id: userId,
      content: entry.content,
      tags: entry.tags,
      date: entry.date,
      emoji: entry.emoji || '📚'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving note:', error);
    return null;
  }

  return data;
};

export const hasEntryForTodayInDB = async (userId: string): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('notes')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today)
    .limit(1);

  if (error) {
    console.error('Error checking today\'s entry:', error);
    return false;
  }

  return data.length > 0;
};

export const getRandomPastEntryFromDB = async (userId: string): Promise<TILEntry | null> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .lt('date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data.length) {
    return null;
  }

  const randomEntry = data[Math.floor(Math.random() * data.length)];
  
  return {
    id: randomEntry.id,
    username: '',
    content: randomEntry.content,
    tags: randomEntry.tags || [],
    date: randomEntry.date,
    emoji: randomEntry.emoji || '📚',
    createdAt: new Date(randomEntry.created_at)
  };
};
