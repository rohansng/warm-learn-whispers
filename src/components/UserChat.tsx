
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Users } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  created_at: string;
}

interface UserChatProps {
  username: string;
}

const UserChat: React.FC<UserChatProps> = ({ username }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Set up realtime subscription for chat messages
    const channel = supabase
      .channel('chat-room')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).map(key => state[key][0]?.username).filter(Boolean);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(prev => [...prev, payload as ChatMessage]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ username });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username, isOpen]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      message: newMessage.trim(),
      created_at: new Date().toISOString()
    };

    const channel = supabase.channel('chat-room');
    await channel.send({
      type: 'broadcast',
      event: 'message',
      payload: message
    });

    setNewMessage('');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-lavender-500 to-blush-500 hover:from-lavender-600 hover:to-blush-600 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="p-4 bg-white shadow-xl border-2 border-lavender-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-lavender-600" />
            <h3 className="font-semibold text-gray-800">Community Chat</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </Button>
        </div>

        {/* Online Users */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Online ({onlineUsers.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {onlineUsers.map((user, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {user}
              </Badge>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto mb-4 space-y-2 bg-gray-50 p-3 rounded-lg">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">
              No messages yet. Start the conversation! 👋
            </p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="font-medium text-lavender-600">{msg.username}:</span>
                <span className="ml-2 text-gray-700">{msg.message}</span>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border-lavender-200 focus:border-lavender-400"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="bg-lavender-500 hover:bg-lavender-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserChat;
