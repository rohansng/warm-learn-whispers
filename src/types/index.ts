
export interface TILEntry {
  id: string;
  user_id: string;
  content: string;
  tags: string[];
  date: string;
  emoji?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  username: string;
  lastVisit?: Date;
  totalEntries: number;
}
