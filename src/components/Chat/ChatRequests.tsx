
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getChatRequests, respondToChatRequest } from '@/utils/chatService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface ChatRequestsProps {
  userId: string;
  onBack: () => void;
}

const ChatRequests: React.FC<ChatRequestsProps> = ({ userId, onBack }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();

    // Set up realtime subscription
    const channel = supabase
      .channel('chat-requests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_requests'
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadRequests = async () => {
    setLoading(true);
    const data = await getChatRequests();
    setRequests(data);
    setLoading(false);
  };

  const handleResponse = async (requestId: string, status: 'accepted' | 'declined', senderUsername: string) => {
    setResponding(requestId);
    const result = await respondToChatRequest(requestId, status);
    
    if (result) {
      toast({
        title: status === 'accepted' ? "Request Accepted! 🎉" : "Request Declined",
        description: status === 'accepted' 
          ? `You can now chat with ${senderUsername}! Check your conversations.`
          : `You declined the chat request from ${senderUsername}.`,
      });
      loadRequests(); // Refresh the list
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to respond to the request. Please try again.",
      });
    }
    setResponding(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex items-center p-4 border-b border-gray-200">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-medium">Chat Requests</h3>
        </div>
        <div className="p-4 text-center text-gray-500">
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mx-auto mb-2" />
          Loading requests...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-medium">Chat Requests</h3>
        {requests.length > 0 && (
          <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
            {requests.length}
          </span>
        )}
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No pending chat requests</p>
            <p className="text-sm mt-1">When someone wants to chat with you, their requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {requests.map((request) => (
              <div key={request.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {request.sender?.username?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {request.sender?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {request.message || 'Wants to chat with you'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResponse(request.id, 'declined', request.sender?.username || 'user')}
                      disabled={responding === request.id}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResponse(request.id, 'accepted', request.sender?.username || 'user')}
                      disabled={responding === request.id}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {responding === request.id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRequests;
