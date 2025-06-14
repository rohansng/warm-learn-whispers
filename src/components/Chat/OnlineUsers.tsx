
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { getOnlineUsers, findUserByUsername, sendChatRequest } from '@/utils/chatService';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

interface OnlineUsersProps {
  userId: string;
  onBack: () => void;
  onStartChat?: (username: string) => void;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ userId, onBack, onStartChat }) => {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOnlineUsers();

    // Set up realtime subscription for presence updates
    const channel = supabase
      .channel('online-users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          loadOnlineUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadOnlineUsers = async () => {
    setLoading(true);
    const users = await getOnlineUsers();
    // Filter out current user
    const filteredUsers = users.filter(user => user.id !== userId);
    setOnlineUsers(filteredUsers);
    setLoading(false);
  };

  const handleStartChat = async (username: string) => {
    try {
      const user = await findUserByUsername(username);
      if (user) {
        await sendChatRequest(user.id, `Hi! I'd like to chat with you.`);
        toast({
          title: "Chat request sent!",
          description: `Your chat request has been sent to ${username}.`,
        });
        if (onStartChat) {
          onStartChat(username);
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send chat request. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading online users...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center">
          <h3 className="font-semibold text-gray-800">Online Users</h3>
          <Badge variant="secondary" className="ml-2">
            {onlineUsers.length}
          </Badge>
        </div>
      </div>

      {/* Online Users List */}
      <div className="flex-1 overflow-y-auto">
        {onlineUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No other users are currently online.</p>
            <p className="text-sm mt-2">Check back later!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {user.username?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-green-600">Online now</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleStartChat(user.username)}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
