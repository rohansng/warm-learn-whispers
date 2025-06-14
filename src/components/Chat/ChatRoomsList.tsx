
import React, { useState, useEffect } from 'react';
import { getChatRooms } from '@/utils/chatService';
import { ChatRoom } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users } from 'lucide-react';
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

  const isUserOnline = (lastVisit: string) => {
    if (!lastVisit) return false;
    // Consider user online if last visit was within 5 minutes
    const lastVisitTime = new Date(lastVisit).getTime();
    const now = new Date().getTime();
    return (now - lastVisitTime) < 5 * 60 * 1000; // 5 minutes
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mx-auto mb-2" />
        Loading conversations...
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">No conversations yet</p>
        <p className="text-sm mt-1">Search for users to start chatting!</p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Use the search button to find other users and send them chat requests!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>{chatRooms.length} conversation{chatRooms.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      {chatRooms.map((room) => {
        const otherParticipant = getOtherParticipant(room);
        const online = isUserOnline(otherParticipant?.last_visit);
        
        return (
          <div
            key={room.id}
            onClick={() => onSelectChatRoom(room)}
            className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
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
              <div className="flex items-center justify-between mb-1">
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
                  {room.last_message_at ? new Date(room.last_message_at).toLocaleDateString() : 'New'}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {room.last_message_at ? 'Click to view messages' : 'Start a conversation...'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatRoomsList;
