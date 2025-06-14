import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getProfileByUsername, createProfile, getNotesByUserId } from '@/utils/supabaseStorage';
import { generateGuestUUID } from '@/utils/guestUtils';
import { User as UserType } from '../../types';
import { User } from 'lucide-react';

interface GuestAuthFormProps {
  onGuestSuccess: (user: UserType) => void;
}

const GuestAuthForm: React.FC<GuestAuthFormProps> = ({ onGuestSuccess }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGuestAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('GuestAuth: Starting guest auth for username:', username);
    
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "Username Required",
        description: "Please enter a username to continue.",
      });
      return;
    }

    if (username.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Username Too Short",
        description: "Username must be at least 3 characters long.",
      });
      return;
    }

    setLoading(true);

    try {
      const trimmedUsername = username.trim();
      console.log('GuestAuth: Checking for existing profile with username:', trimmedUsername);
      
      // Check if username exists
      let profile = await getProfileByUsername(trimmedUsername);
      console.log('GuestAuth: Profile lookup result:', profile);
      
      if (!profile) {
        // Create new guest profile with a proper UUID
        const guestId = generateGuestUUID();
        console.log('GuestAuth: Creating new guest profile with UUID:', guestId);
        
        profile = await createProfile(guestId, trimmedUsername, '');
        
        if (!profile) {
          throw new Error('Failed to create guest profile');
        }

        console.log('GuestAuth: New guest profile created:', profile);
        toast({
          title: "Welcome!",
          description: `Guest account created for ${trimmedUsername}. Your data will be saved and accessible from any device with this username.`,
        });
      } else {
        // Existing username found - load their data
        console.log('GuestAuth: Found existing profile:', profile);
        const notes = await getNotesByUserId(profile.id);
        toast({
          title: "Welcome back!",
          description: `Found ${notes.length} saved learning${notes.length !== 1 ? 's' : ''} for ${trimmedUsername}.`,
        });
      }

      // Create user object for the app
      const user: UserType = {
        id: profile.id,
        username: profile.username,
        email: profile.email || '',
        totalEntries: profile.total_entries || 0,
        lastVisit: profile.last_visit || new Date().toISOString()
      };

      console.log('GuestAuth: Created user object:', user);
      console.log('GuestAuth: About to call onGuestSuccess...');
      
      // Call the success callback
      onGuestSuccess(user);
      console.log('GuestAuth: onGuestSuccess called successfully');
      
    } catch (error) {
      console.error('GuestAuth: Guest auth error:', error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Failed to authenticate as guest. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleGuestAuth} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="guest-username" className="block text-sm font-medium text-gray-700">
          Choose Username
        </label>
        <Input
          id="guest-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a unique username..."
          required
          disabled={loading}
          minLength={3}
          maxLength={20}
          className="border-2 border-gray-200 focus:border-lavender-400 rounded-xl transition-all duration-300"
        />
        <p className="text-xs text-gray-500">
          Use the same username on any device to access your saved learnings
        </p>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-mint-500 to-lavender-500 hover:from-mint-600 hover:to-lavender-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105"
        disabled={loading || !username.trim()}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Checking username...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <User className="w-4 h-4 mr-2" />
            Continue as Guest
          </div>
        )}
      </Button>
    </form>
  );
};

export default GuestAuthForm;
