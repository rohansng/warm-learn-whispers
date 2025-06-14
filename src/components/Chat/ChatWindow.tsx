
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search, UserPlus, Users } from 'lucide-react';
import ChatRoomsList from './ChatRoomsList';
import ChatMessages from './ChatMessages';
import UserSearch from './UserSearch';
import ChatRequests from './ChatRequests';
import OnlineUsers from './OnlineUsers';
import { ChatRoom } from '@/types/chat';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackUserPresence, updateUserPresence } from '@/utils/chatService';

interface ChatWindowProps {
  onClose: () => void;
  userId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, userId }) => {
  const [activeView, setActiveView] = useState<'chats' | 'search' | 'requests' | 'online'>('chats');
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Track user presence when chat window opens
    const presenceChannel = trackUserPresence();

    // Cleanup on unmount
    return () => {
      updateUserPresence(false);
      if (presenceChannel) {
        presenceChannel.unsubscribe();
      }
    };
  }, []);

  const handleClose = () => {
    updateUserPresence(false);
    onClose();
  };

  return (
    <div className={`fixed z-50 ${
      isMobile 
        ? 'inset-0 p-4' 
        : 'bottom-4 right-4 w-96 h-[600px]'
    }`}>
      <Card className={`h-full bg-white shadow-xl border-2 border-purple-200 flex flex-col ${
        isMobile ? 'rounded-lg' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-800">Messages</h3>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('online')}
              className={`p-2 ${activeView === 'online' ? 'bg-purple-100' : ''}`}
              title="Online Users"
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('search')}
              className={`p-2 ${activeView === 'search' ? 'bg-purple-100' : ''}`}
              title="Search Users"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('requests')}
              className={`p-2 ${activeView === 'requests' ? 'bg-purple-100' : ''}`}
              title="Chat Requests"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedChatRoom ? (
            <ChatMessages 
              chatRoom={selectedChatRoom} 
              userId={userId}
              onBack={() => setSelectedChatRoom(null)}
            />
          ) : (
            <>
              {activeView === 'chats' && (
                <ChatRoomsList 
                  userId={userId}
                  onSelectChatRoom={setSelectedChatRoom}
                />
              )}
              {activeView === 'search' && (
                <UserSearch 
                  userId={userId}
                  onBack={() => setActiveView('chats')}
                />
              )}
              {activeView === 'requests' && (
                <ChatRequests 
                  userId={userId}
                  onBack={() => setActiveView('chats')}
                />
              )}
              {activeView === 'online' && (
                <OnlineUsers 
                  userId={userId}
                  onBack={() => setActiveView('chats')}
                  onStartChat={() => setActiveView('chats')}
                />
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChatWindow;
