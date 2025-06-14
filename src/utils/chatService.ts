
import { supabase } from "@/integrations/supabase/client";
import { ChatRoom, Message, ChatRequest, UserSettings } from "@/types/chat";

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
  const { data, error } = await supabase
    .from('chat_requests')
    .insert({
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
  const { data, error } = await supabase
    .from('chat_requests')
    .select(`
      *,
      sender:profiles!chat_requests_sender_id_fkey(username, email)
    `)
    .eq('receiver_id', (await supabase.auth.getUser()).data.user?.id)
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
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      participant1:profiles!chat_rooms_participant_1_fkey(username, email),
      participant2:profiles!chat_rooms_participant_2_fkey(username, email)
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
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
      sender:profiles!messages_sender_id_fkey(username, email)
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
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_room_id: chatRoomId,
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

export const getUserSettings = async () => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
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
        user_id: userId,
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
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const { data, error } = await supabase
    .from('user_settings')
    .update(settings)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user settings:', error);
    return null;
  }

  return data;
};
