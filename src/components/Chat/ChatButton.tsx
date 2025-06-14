
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getChatRequests } from '@/utils/chatService';
import { supabase } from "@/integrations/supabase/client";

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isOpen }) => {
  const [unreadRequests, setUnreadRequests] = useState(0);

  useEffect(() => {
    loadUnreadRequests();

    // Set up realtime subscription for chat requests
    const channel = supabase
      .channel('chat-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_requests'
        },
        () => {
          loadUnreadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUnreadRequests = async () => {
    const requests = await getChatRequests();
    setUnreadRequests(requests.length);
  };

  if (isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Button
        onClick={onClick}
        className="relative rounded-full w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadRequests > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadRequests}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default ChatButton;
