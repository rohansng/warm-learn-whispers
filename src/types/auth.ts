
export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

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

export interface AuthState {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
}
