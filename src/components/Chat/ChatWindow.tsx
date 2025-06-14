
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search, UserPlus } from 'lucide-react';
import ChatRoomsList from './ChatRoomsList';
import ChatMessages from './ChatMessages';
import UserSearch from './UserSearch';
import ChatRequests from './ChatRequests';
import { ChatRoom } from '@/types/chat';

interface ChatWindowProps {
  onClose: () => void;
  userId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, userId }) => {
  const [activeView, setActiveView] = useState<'chats' | 'search' | 'requests'>('chats');
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px]">
      <Card className="h-full bg-white shadow-xl border-2 border-purple-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-800">Messages</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('search')}
              className={`p-2 ${activeView === 'search' ? 'bg-purple-100' : ''}`}
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('requests')}
              className={`p-2 ${activeView === 'requests' ? 'bg-purple-100' : ''}`}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
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
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChatWindow;
