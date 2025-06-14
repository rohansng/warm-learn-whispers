
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X } from 'lucide-react';
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

  const handleResponse = async (requestId: string, status: 'accepted' | 'declined') => {
    setResponding(requestId);
    const result = await respondToChatRequest(requestId, status);
    
    if (result) {
      toast({
        title: status === 'accepted' ? "Request Accepted" : "Request Declined",
        description: `You have ${status} the chat request.`,
      });
      loadRequests(); // Refresh the list
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to respond to the request.",
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
      </div>

      {/* Requests List */}
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No pending chat requests.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="p-4 border-b border-gray-100">
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
                    <p className="text-sm text-gray-500 truncate">
                      {request.message || 'Wants to chat with you'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResponse(request.id, 'declined')}
                    disabled={responding === request.id}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleResponse(request.id, 'accepted')}
                    disabled={responding === request.id}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatRequests;
