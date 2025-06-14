
import React, { useState, useEffect } from 'react';
import { getChatRooms } from '@/utils/chatService';
import { ChatRoom } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/integrations/supabase/client";

interface ChatRoomsListProps {
  userId: string;
  onSelectChatRoom: (chatRoom: ChatRoom) => void;
}

const ChatRoomsList: React.FC<ChatRoomsListProps> = ({ userId, onSelectChatRoom }) => {
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatRooms();

    // Set up realtime subscription
    const channel = supabase
      .channel('chat-rooms-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        () => {
          loadChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadChatRooms = async () => {
    setLoading(true);
    const rooms = await getChatRooms();
    setChatRooms(rooms);
    setLoading(false);
  };

  const getOtherParticipant = (room: any) => {
    return room.participant_1 === userId ? room.participant2 : room.participant1;
  };

  const isUserOnline = (lastVisit: string, isOnline: boolean) => {
    if (isOnline) return true;
    // Consider user online if last visit was within 5 minutes
    const lastVisitTime = new Date(lastVisit).getTime();
    const now = new Date().getTime();
    return (now - lastVisitTime) < 5 * 60 * 1000; // 5 minutes
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading conversations...
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet.</p>
        <p className="text-sm mt-2">Search for users to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chatRooms.map((room) => {
        const otherParticipant = getOtherParticipant(room);
        const online = isUserOnline(otherParticipant?.last_visit, otherParticipant?.is_online);
        
        return (
          <div
            key={room.id}
            onClick={() => onSelectChatRoom(room)}
            className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
          >
            <div className="relative">
              <Avatar className="w-10 h-10 mr-3">
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {otherParticipant?.username?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              {online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="font-medium text-gray-900 truncate mr-2">
                    {otherParticipant?.username || 'Unknown User'}
                  </p>
                  {online && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      online
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(room.last_message_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                Start a conversation...
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatRoomsList;
