
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { Edit2, Save, X } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onProfileUpdate?: (username: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onProfileUpdate }) => {
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, [user.id]);

  const fetchUserProfile = async () => {
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback to metadata username if profile doesn't exist
        const metaUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
        setCurrentUsername(metaUsername);
        setNewUsername(metaUsername);
      } else {
        setCurrentUsername(data.username);
        setNewUsername(data.username);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const metaUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
      setCurrentUsername(metaUsername);
      setNewUsername(metaUsername);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        variant: "destructive",
        title: "Username Required",
        description: "Please enter a valid username.",
      });
      return;
    }

    if (newUsername.trim() === currentUsername) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating username:', error);
        if (error.message.includes('duplicate key value violates unique constraint')) {
          toast({
            variant: "destructive",
            title: "Username Taken",
            description: "This username is already taken. Please choose a different one.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Failed to update username. Please try again.",
          });
        }
        return;
      }

      setCurrentUsername(newUsername.trim());
      setIsEditing(false);
      toast({
        title: "Username Updated!",
        description: "Your username has been successfully updated.",
      });

      if (onProfileUpdate) {
        onProfileUpdate(newUsername.trim());
      }
    } catch (error) {
      console.error('Error updating username:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewUsername(currentUsername);
    setIsEditing(false);
  };

  if (fetchLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-lavender-500 border-t-transparent"></div>
            <span className="ml-2 text-gray-600">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold text-gray-800">Profile Settings</CardTitle>
        <CardDescription className="text-gray-600">
          Manage your account information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={user.email || ''}
              disabled
              className="bg-gray-100 border-gray-200 rounded-xl"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  maxLength={20}
                  className="border-2 border-lavender-300 focus:border-lavender-500 rounded-xl"
                  disabled={loading}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveUsername}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-lavender-500 to-blush-500 hover:from-lavender-600 hover:to-blush-600 text-white rounded-xl"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={loading}
                    className="flex-1 border-2 border-gray-300 rounded-xl"
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={currentUsername}
                  disabled
                  className="bg-gray-100 border-gray-200 rounded-xl flex-1"
                />
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="border-2 border-lavender-300 text-lavender-600 hover:bg-lavender-50 rounded-xl"
                >
                  <Edit2 size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Your username is visible to other users in the chat system
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
