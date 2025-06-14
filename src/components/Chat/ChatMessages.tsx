
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Smile } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getMessages, sendMessage, markMessagesAsRead } from '@/utils/chatService';
import { ChatRoom, Message } from '@/types/chat';
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface ChatMessagesProps {
  chatRoom: ChatRoom;
  userId: string;
  onBack: () => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ chatRoom, userId, onBack }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const otherParticipantId = chatRoom.participant_1 === userId ? chatRoom.participant_2 : chatRoom.participant_1;

  useEffect(() => {
    loadMessages();
    loadOtherParticipant();
    markMessagesAsRead(chatRoom.id, userId);

    // Set up realtime subscription for new messages
    const channel = supabase
      .channel(`chat-${chatRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoom.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoom.id, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    const data = await getMessages(chatRoom.id);
    setMessages(data);
    setLoading(false);
  };

  const loadOtherParticipant = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, email, last_visit')
        .eq('id', otherParticipantId)
        .single();

      if (!error && data) {
        setOtherParticipant(data);
      }
    } catch (error) {
      console.error('Error loading other participant:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const message = await sendMessage(chatRoom.id, newMessage.trim());
    
    if (message) {
      setNewMessage('');
      // Messages will be updated via realtime subscription
      toast({
        title: "Message sent! 📤",
        description: "Your message has been delivered.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again.",
      });
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isUserOnline = (lastVisit: string) => {
    if (!lastVisit) return false;
    const lastVisitTime = new Date(lastVisit).getTime();
    const now = new Date().getTime();
    return (now - lastVisitTime) < 5 * 60 * 1000; // 5 minutes
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center border-b border-gray-200 bg-white ${isMobile ? 'p-3' : 'p-4'}`}>
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="relative">
          <Avatar className={`mr-3 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
            <AvatarFallback className="bg-purple-100 text-purple-600 text-sm">
              {otherParticipant?.username?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          {otherParticipant && isUserOnline(otherParticipant.last_visit) && (
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
          )}
        </div>
        <div>
          <h3 className={`font-medium ${isMobile ? 'text-sm' : 'text-sm'}`}>
            {otherParticipant?.username || 'Loading...'}
          </h3>
          <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {otherParticipant && isUserOnline(otherParticipant.last_visit) ? 'Online now' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto space-y-3 bg-gray-50 ${isMobile ? 'p-3' : 'p-4'}`}>
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mx-auto mb-2" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Start the conversation! 👋</p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💬 Say hello to {otherParticipant?.username}!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === userId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    isOwnMessage
                      ? 'bg-purple-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                  } ${isMobile ? 'max-w-[80%]' : 'max-w-xs'}`}
                >
                  <p className={isMobile ? 'text-sm' : ''}>{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-purple-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`border-t border-gray-200 bg-white ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${otherParticipant?.username || 'user'}...`}
            className="flex-1"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600"
          >
            {sending ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;
