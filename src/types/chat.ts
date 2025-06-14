
export interface ChatRoom {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'voice' | 'note_share';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  is_deleted: boolean;
}

export interface ChatRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  allow_chat_requests: boolean;
  show_typing_indicator: boolean;
  show_read_receipts: boolean;
  show_last_seen: boolean;
  push_notifications_chat: boolean;
  push_notifications_notes: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatUser {
  id: string;
  username: string;
  email: string;
  last_seen?: string;
  is_online?: boolean;
}
