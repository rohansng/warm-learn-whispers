
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, UserPlus, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { findUserByUsername, sendChatRequest } from '@/utils/chatService';
import { useToast } from '@/hooks/use-toast';

interface UserSearchProps {
  userId: string;
  onBack: () => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ userId, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchResult(null);
    setRequestSent(false);
    
    const user = await findUserByUsername(searchQuery.trim());
    
    if (user && user.id === userId) {
      toast({
        variant: "destructive",
        title: "Invalid Search",
        description: "You cannot chat with yourself!",
      });
      setSearchResult(null);
    } else {
      setSearchResult(user);
      if (!user) {
        toast({
          variant: "destructive",
          title: "User Not Found",
          description: `No user found with username "${searchQuery}"`,
        });
      }
    }
    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;

    setRequesting(true);
    const request = await sendChatRequest(searchResult.id, `Hi! I'd like to chat with you.`);
    
    if (request) {
      setRequestSent(true);
      toast({
        title: "Chat Request Sent! 🎉",
        description: `Your chat request has been sent to ${searchResult.username}. They'll receive a notification.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "Failed to send chat request. You may have already sent a request to this user.",
      });
    }
    setRequesting(false);
  };

  const handleNewSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setRequestSent(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-medium">Find Users</h3>
      </div>

      {/* Search */}
      <div className="p-4 space-y-4">
        <div className="flex space-x-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter username..."
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {searchResult.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{searchResult.username}</p>
                  <p className="text-sm text-gray-500">{searchResult.email}</p>
                </div>
              </div>
              
              {requestSent ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Request Sent</span>
                </div>
              ) : (
                <Button
                  onClick={handleSendRequest}
                  disabled={requesting}
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {requesting ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
            
            {requestSent && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Button
                  onClick={handleNewSearch}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Search for Another User
                </Button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-500 py-8">
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mx-auto mb-2" />
            Searching for users...
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <h4 className="font-medium text-blue-800 mb-2">How to Start Chatting:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Search for a user by their username</li>
            <li>2. Send them a chat request</li>
            <li>3. Wait for them to accept your request</li>
            <li>4. Start chatting once they accept!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
