
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
  lastVisit: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
  };
}
