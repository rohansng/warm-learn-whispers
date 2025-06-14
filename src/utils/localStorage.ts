
import { TILEntry, User } from '../types';
import { 
  getProfileByUsername, 
  createProfile, 
  updateProfile, 
  getNotesByUserId,
  saveNote,
  hasEntryForTodayInDB,
  getRandomPastEntryFromDB
} from './supabaseStorage';

// Legacy functions that now use Supabase backend
export const saveEntry = async (entry: TILEntry): Promise<void> => {
  try {
    const profile = await getProfileByUsername(entry.username);
    if (profile) {
      await saveNote(profile.id, entry);
    }
  } catch (error) {
    console.error('Error saving entry:', error);
  }
};

export const getEntriesByUsername = async (username: string): Promise<TILEntry[]> => {
  try {
    const profile = await getProfileByUsername(username);
    if (profile) {
      return await getNotesByUserId(profile.id);
    }
  } catch (error) {
    console.error('Error getting entries:', error);
  }
  return [];
};

export const getUser = async (username: string): Promise<User | null> => {
  try {
    const profile = await getProfileByUsername(username);
    if (profile) {
      return {
        username: profile.username,
        totalEntries: profile.total_entries || 0,
        lastVisit: profile.last_visit ? new Date(profile.last_visit) : undefined
      };
    }
  } catch (error) {
    console.error('Error getting user:', error);
  }
  return null;
};

export const saveUser = async (user: User): Promise<void> => {
  try {
    let profile = await getProfileByUsername(user.username);
    if (!profile) {
      profile = await createProfile(user.username);
    }
    if (profile) {
      await updateProfile(profile.id, {
        total_entries: user.totalEntries,
        last_visit: user.lastVisit?.toISOString()
      });
    }
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const hasEntryForToday = async (username: string): Promise<boolean> => {
  try {
    const profile = await getProfileByUsername(username);
    if (profile) {
      return await hasEntryForTodayInDB(profile.id);
    }
  } catch (error) {
    console.error('Error checking today entry:', error);
  }
  return false;
};

export const getRandomPastEntry = async (username: string): Promise<TILEntry | null> => {
  try {
    const profile = await getProfileByUsername(username);
    if (profile) {
      return await getRandomPastEntryFromDB(profile.id);
    }
  } catch (error) {
    console.error('Error getting random entry:', error);
  }
  return null;
};
