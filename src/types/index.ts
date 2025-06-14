
export interface TILEntry {
  id: string;
  username: string;
  content: string;
  tags: string[];
  date: string;
  emoji: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  totalEntries: number;
  lastVisit: string; // Keep as string to match database
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
  };
}
