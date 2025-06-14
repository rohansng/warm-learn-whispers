
export interface TILEntry {
  id: string;
  username: string;
  content: string;
  tags: string[];
  date: string;
  emoji?: string;
  createdAt: Date;
}

export interface User {
  username: string;
  lastVisit?: Date;
  totalEntries: number;
}
