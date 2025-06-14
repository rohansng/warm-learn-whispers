
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
  try {
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
  } catch (error) {
    console.error('Error in findUserByUsername:', error);
    return null;
  }
};

export const sendChatRequest = async (receiverId: string, message?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return null;
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from('chat_requests')
      .select('*')
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingRequest) {
      console.log('Chat request already sent');
      return null;
    }

    const { data, error } = await supabase
      .from('chat_requests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: message || 'Hi! I\'d like to chat with you.',
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending chat request:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in sendChatRequest:', error);
    return null;
  }
};

export const getChatRequests = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('chat_requests')
      .select(`
        *,
        sender:profiles!chat_requests_sender_id_fkey(username, email)
      `)
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getChatRequests:', error);
    return [];
  }
};

export const respondToChatRequest = async (requestId: string, status: 'accepted' | 'declined') => {
  try {
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
  } catch (error) {
    console.error('Error in respondToChatRequest:', error);
    return null;
  }
};

export const createChatRoom = async (participant1: string, participant2: string) => {
  try {
    // Ensure consistent ordering
    const [p1, p2] = [participant1, participant2].sort();
    
    const { data, error } = await supabase
      .from('chat_rooms')
      .upsert({
        participant_1: p1,
        participant_2: p2
      }, {
        onConflict: 'participant_1,participant_2'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat room:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createChatRoom:', error);
    return null;
  }
};

export const getChatRooms = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        participant1:profiles!chat_rooms_participant_1_fkey(username, email, last_visit),
        participant2:profiles!chat_rooms_participant_2_fkey(username, email, last_visit)
      `)
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat rooms:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getChatRooms:', error);
    return [];
  }
};

export const getMessages = async (chatRoomId: string) => {
  try {
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
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
};

export const sendMessage = async (chatRoomId: string, content: string, messageType: 'text' | 'image' | 'voice' | 'note_share' = 'text', metadata: Record<string, any> = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return null;
    }

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
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
};

export const markMessagesAsRead = async (chatRoomId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('chat_room_id', chatRoomId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
  }
};

export const updateUserPresence = async (isOnline: boolean) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        last_visit: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating user presence:', error);
    }
  } catch (error) {
    console.error('Error in updateUserPresence:', error);
  }
};

export const getOnlineUsers = async (): Promise<OnlineUserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, last_visit');

    if (error) {
      console.error('Error fetching online users:', error);
      return [];
    }

    // Since we don't have is_online column yet, consider users online if last_visit was within 5 minutes
    const now = new Date().getTime();
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    return (data || []).map(user => ({
      id: user.id,
      username: user.username || 'Unknown',
      email: user.email || '',
      is_online: user.last_visit ? new Date(user.last_visit).getTime() > fiveMinutesAgo : false,
      last_visit: user.last_visit || new Date().toISOString()
    })).filter(user => user.is_online);
  } catch (error) {
    console.error('Error in getOnlineUsers:', error);
    return [];
  }
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
  try {
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
  } catch (error) {
    console.error('Error in getUserSettings:', error);
    return null;
  }
};

export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  try {
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
  } catch (error) {
    console.error('Error in updateUserSettings:', error);
    return null;
  }
};
