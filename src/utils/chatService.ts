import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, Message, ChatRequest, UserSettings } from "@/types/chat";

// Add interface for online user to avoid type inference issues
interface OnlineUserProfile {
  id: string;
  username: string;
  email: string;
  is_online: boolean;
  last_visit: string;
}

export const findUserByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('Error finding user:', error);
    return null;
  }

  return data;
};

export const sendChatRequest = async (receiverId: string, message?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('chat_requests')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      message: message || '',
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending chat request:', error);
    return null;
  }

  return data;
};

export const getChatRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_requests')
    .select(`
      *,
      sender:sender_id(username, email)
    `)
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat requests:', error);
    return [];
  }

  return data || [];
};

export const respondToChatRequest = async (requestId: string, status: 'accepted' | 'declined') => {
  const { data, error } = await supabase
    .from('chat_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single();

  if (error) {
    console.error('Error responding to chat request:', error);
    return null;
  }

  // If accepted, create a chat room
  if (status === 'accepted') {
    const request = data as ChatRequest;
    await createChatRoom(request.sender_id, request.receiver_id);
  }

  return data;
};

export const createChatRoom = async (participant1: string, participant2: string) => {
  // Ensure consistent ordering
  const [p1, p2] = [participant1, participant2].sort();
  
  const { data, error } = await supabase
    .from('chat_rooms')
    .upsert({
      participant_1: p1,
      participant_2: p2
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat room:', error);
    return null;
  }

  return data;
};

export const getChatRooms = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      participant1:participant_1(username, email, is_online, last_visit),
      participant2:participant_2(username, email, is_online, last_visit)
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat rooms:', error);
    return [];
  }

  return data || [];
};

export const getMessages = async (chatRoomId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(username, email)
    `)
    .eq('chat_room_id', chatRoomId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
};

export const sendMessage = async (chatRoomId: string, content: string, messageType: 'text' | 'image' | 'voice' | 'note_share' = 'text', metadata: Record<string, any> = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_room_id: chatRoomId,
      sender_id: user.id,
      content,
      message_type: messageType,
      metadata
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  // Update last message time in chat room
  await supabase
    .from('chat_rooms')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', chatRoomId);

  return data;
};

export const markMessagesAsRead = async (chatRoomId: string, userId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('chat_room_id', chatRoomId)
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
  }
};

export const updateUserPresence = async (isOnline: boolean) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ 
      last_visit: new Date().toISOString(),
      is_online: isOnline 
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating user presence:', error);
  }
};

export const getOnlineUsers = async (): Promise<OnlineUserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, is_online, last_visit');

  if (error) {
    console.error('Error fetching online users:', error);
    return [];
  }

  // Type the data explicitly and filter for online users
  const profiles = (data || []) as OnlineUserProfile[];
  return profiles.filter(user => user.is_online === true);
};

export const trackUserPresence = () => {
  const channel = supabase.channel('user-presence');
  
  channel
    .on('presence', { event: 'sync' }, () => {
      console.log('Syncing presence state');
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
          await updateUserPresence(true);
        }
      }
    });

  return channel;
};

export const getUserSettings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user settings:', error);
    return null;
  }

  // Create default settings if none exist
  if (!data) {
    const { data: newSettings, error: createError } = await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        allow_chat_requests: true,
        show_typing_indicator: true,
        show_read_receipts: true,
        show_last_seen: true,
        push_notifications_chat: true,
        push_notifications_notes: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user settings:', createError);
      return null;
    }

    return newSettings;
  }

  return data;
};

export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_settings')
    .update(settings)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user settings:', error);
    return null;
  }

  return data;
};
