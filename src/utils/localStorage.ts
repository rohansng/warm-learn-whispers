
import { TILEntry, User } from '../types';

const ENTRIES_KEY = 'til_entries';
const USERS_KEY = 'til_users';

export const saveEntry = (entry: TILEntry): void => {
  const entries = getEntries();
  entries.push(entry);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};

export const getEntries = (): TILEntry[] => {
  const stored = localStorage.getItem(ENTRIES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getEntriesByUsername = (username: string): TILEntry[] => {
  const entries = getEntries();
  return entries.filter(entry => entry.username.toLowerCase() === username.toLowerCase());
};

export const hasEntryForToday = (username: string): boolean => {
  const entries = getEntriesByUsername(username);
  const today = new Date().toDateString();
  return entries.some(entry => new Date(entry.date).toDateString() === today);
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingUserIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
  
  if (existingUserIndex >= 0) {
    users[existingUserIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getUser = (username: string): User | null => {
  const users = getUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
};

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getRandomPastEntry = (username: string): TILEntry | null => {
  const entries = getEntriesByUsername(username);
  const pastEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date).toDateString();
    const today = new Date().toDateString();
    return entryDate !== today;
  });
  
  if (pastEntries.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * pastEntries.length);
  return pastEntries[randomIndex];
};
